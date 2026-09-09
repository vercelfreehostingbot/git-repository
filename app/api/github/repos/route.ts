import {NextResponse} from "next/server";
import {Octokit} from "@octokit/rest";
export const runtime="nodejs";
export async function GET(){
  const token=process.env.GITHUB_TOKEN;
  if(!token)return NextResponse.json({error:"GITHUB_TOKEN is missing."},{status:500});
  try{
    const api=new Octokit({auth:token});
    const {data}=await api.rest.repos.listForAuthenticatedUser({per_page:100,sort:"updated",direction:"desc",affiliation:"owner,collaborator,organization_member",type:"all"});
    return NextResponse.json({repos:data.map(r=>({id:r.id,full_name:r.full_name,name:r.name,owner:r.owner.login,private:r.private,default_branch:r.default_branch}))});
  }catch(e:any){return NextResponse.json({error:e?.message||"GitHub request failed"},{status:e?.status||500})}
}