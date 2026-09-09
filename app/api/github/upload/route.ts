import {Octokit} from "@octokit/rest";
import AdmZip from "adm-zip";
export const runtime="nodejs";
export const dynamic="force-dynamic";

function cleanPath(input:string){
  const p=input.replace(/\\/g,"/").replace(/^\/+/,"");
  const parts=p.split("/");
  if(!p||p.endsWith("/")||parts.some(x=>x===".."||x==="."))return null;
  if(parts[0]===".git")return null;
  return p;
}
function response(run:(send:(x:any)=>void)=>Promise<void>){
  const enc=new TextEncoder();
  const stream=new ReadableStream({start(controller){
    const send=(x:any)=>{try{controller.enqueue(enc.encode(JSON.stringify(x)+"\n"))}catch{}};
    run(send).catch(e=>send({type:"error",message:e?.message||"Unknown error"})).finally(()=>{try{controller.close()}catch{}});
  }});
  return new Response(stream,{headers:{"Content-Type":"application/x-ndjson; charset=utf-8","Cache-Control":"no-cache, no-transform","X-Accel-Buffering":"no"}});
}
export async function POST(req:Request){
  const form=await req.formData(),mode=String(form.get("mode")||"replace"),file=form.get("zip");
  if(!(file instanceof File))return Response.json({error:"ZIP file is required."},{status:400});
  const token=process.env.GITHUB_TOKEN;
  if(!token)return Response.json({error:"GITHUB_TOKEN is missing in Vercel Environment Variables."},{status:500});
  const bytes=Buffer.from(await file.arrayBuffer());
  return response(async send=>{
    const api=new Octokit({auth:token});
    send({type:"status",message:"Authenticating with GitHub…"});
    const me=await api.rest.users.getAuthenticated();
    send({type:"log",level:"ok",message:`Authenticated as ${me.data.login}.`});

    send({type:"status",message:"Scanning ZIP…"});
    const zip=new AdmZip(bytes),items:{path:string,data:Buffer}[]=[];
    for(const entry of zip.getEntries()){
      const p=cleanPath(entry.entryName);
      if(!p||entry.isDirectory)continue;
      const data=entry.getData();
      if(data.length>50*1024*1024)throw Error(`File too large (>50 MB): ${p}`);
      items.push({path:p,data});
    }
    if(!items.length)throw Error("ZIP contains no uploadable files.");
    send({type:"scan",total:items.length});

    let owner:string,repo:string,branch:string,oldSha:string|undefined,url:string;
    if(mode==="create"){
      repo=String(form.get("repoName")||"").trim();
      if(!/^[A-Za-z0-9._-]+$/.test(repo))throw Error("Invalid repository name.");
      send({type:"status",message:"Creating repository…"});
      const r=await api.rest.repos.createForAuthenticatedUser({name:repo,description:String(form.get("description")||""),private:String(form.get("private")||"false")==="true",auto_init:false});
      owner=r.data.owner.login;branch="main";url=r.data.html_url;
      send({type:"log",level:"ok",message:`Created ${owner}/${repo}.`});
    }else{
      owner=String(form.get("owner")||"").trim();repo=String(form.get("repo")||"").trim();
      if(!owner||!repo)throw Error("Existing repository is required.");
      send({type:"status",message:`Opening ${owner}/${repo}…`});
      const r=await api.rest.repos.get({owner,repo});
      branch=r.data.default_branch;url=r.data.html_url;
      const ref=await api.rest.git.getRef({owner,repo,ref:`heads/${branch}`});
      oldSha=ref.data.object.sha;
      send({type:"log",level:"ok",message:`Default branch: ${branch} • previous commit: ${oldSha}`});
      send({type:"log",level:"info",message:"Replacement will preserve previous Git history."});
    }

    send({type:"status",message:"Uploading file blobs…"});
    const tree:any[]=[];let current=0,failed=0;
    for(const item of items){
      current++;send({type:"progress",current,total:items.length,file:item.path,failed});
      try{
        const b=await api.rest.git.createBlob({owner,repo,content:item.data.toString("base64"),encoding:"base64"});
        tree.push({path:item.path,mode:"100644",type:"blob",sha:b.data.sha});
        send({type:"log",level:"ok",message:`✓ ${current}/${items.length} ${item.path}`});
      }catch(e:any){
        failed++;send({type:"progress",current,total:items.length,file:item.path,failed});
        throw Error(`Failed: ${item.path} — ${e?.message||"GitHub error"}`);
      }
    }

    send({type:"status",message:"Building clean Git tree…"});
    const newTree=await api.rest.git.createTree({owner,repo,tree});
    send({type:"log",level:"ok",message:`Clean tree created. Files absent from the ZIP are not included.`});

    send({type:"status",message:"Creating commit…"});
    const commit=await api.rest.git.createCommit({owner,repo,message:mode==="replace"?"Replace all project files":"Initial project upload",tree:newTree.data.sha,...(oldSha?{parents:[oldSha]}:{})});
    send({type:"log",level:"ok",message:`Commit created: ${commit.data.sha}`});

    send({type:"status",message:"Updating branch…"});
    if(mode==="create")await api.rest.git.createRef({owner,repo,ref:"refs/heads/main",sha:commit.data.sha});
    else await api.rest.git.updateRef({owner,repo,ref:`heads/${branch}`,sha:commit.data.sha,force:false});
    send({type:"log",level:"ok",message:`${branch} updated successfully.`});
    send({type:"result",url,commit:commit.data.sha});
  });
}