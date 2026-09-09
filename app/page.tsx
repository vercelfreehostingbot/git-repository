"use client";

import {useEffect,useMemo,useRef,useState} from "react";

type Repo={id:number;full_name:string;name:string;owner:string;private:boolean;default_branch:string};
type Log={id:number;time:string;message:string;level:string};

export default function Page(){
  const [mode,setMode]=useState<"replace"|"create">("replace");
  const [repo,setRepo]=useState("");
  const [name,setName]=useState("");
  const [description,setDescription]=useState("");
  const [privateRepo,setPrivateRepo]=useState(false);
  const [zip,setZip]=useState<File|null>(null);
  const [confirm,setConfirm]=useState(false);
  const [repos,setRepos]=useState<Repo[]>([]);
  const [loadingRepos,setLoadingRepos]=useState(false);
  const [running,setRunning]=useState(false);
  const [status,setStatus]=useState("Ready");
  const [total,setTotal]=useState(0);
  const [done,setDone]=useState(0);
  const [failed,setFailed]=useState(0);
  const [current,setCurrent]=useState("-");
  const [logs,setLogs]=useState<Log[]>([]);
  const [error,setError]=useState("");
  const [result,setResult]=useState<{url:string;commit:string}|null>(null);
  const started=useRef(0);
  const terminal=useRef<HTMLDivElement>(null);
  const percent=useMemo(()=>total?Math.round(done/total*100):0,[done,total]);

  useEffect(()=>{terminal.current?.scrollTo(0,terminal.current.scrollHeight)},[logs]);

  function log(message:string,level="info"){setLogs(x=>[...x,{id:Date.now()+Math.random(),time:new Date().toLocaleTimeString(),message,level}])}
  function parseRepo(v:string){const s=v.trim().replace(/\/+$/,"");const m=s.match(/github\.com\/([^/]+)\/([^/?#]+?)(?:\.git)?$/i)||s.match(/^([^/]+)\/([^/]+)$/);return m?{owner:m[1],repo:m[2]}:null}

  async function loadRepos(){
    setLoadingRepos(true);setError("");log("Loading your GitHub repositories…");
    try{const r=await fetch("/api/github/repos");const j=await r.json();if(!r.ok)throw Error(j.error);setRepos(j.repos);log(`Loaded ${j.repos.length} repositories.`,"ok")}
    catch(e:any){setError(e.message);log(e.message,"err")}finally{setLoadingRepos(false)}
  }

  function selectRepo(r:Repo){setRepo(r.full_name);log(`Selected ${r.full_name} • default branch: ${r.default_branch}`)}

  async function upload(){
    setError("");setResult(null);setLogs([]);
    if(!zip)return setError("Please select a ZIP file.");
    if(mode==="create"&&!name.trim())return setError("Repository name is required.");
    if(mode==="replace"&&!parseRepo(repo))return setError("Enter a valid GitHub repository such as owner/repository.");
    if(mode==="replace"&&!confirm)return setError("Please confirm Replace All.");
    setRunning(true);setStatus("Starting…");setTotal(0);setDone(0);setFailed(0);setCurrent("-");started.current=Date.now();
    log(mode==="replace"?"⚠ REPLACE ALL: old current files will be removed. Git history remains.":"CREATE: preparing new repository.");
    const fd=new FormData();fd.append("mode",mode);fd.append("zip",zip);
    if(mode==="create"){fd.append("repoName",name.trim());fd.append("description",description);fd.append("private",String(privateRepo))}
    else{const p=parseRepo(repo)!;fd.append("owner",p.owner);fd.append("repo",p.repo)}
    try{
      const r=await fetch("/api/github/upload",{method:"POST",body:fd});
      if(!r.body)throw Error("Live streaming is unavailable.");
      const reader=r.body.getReader(),decoder=new TextDecoder();let buffer="";
      while(true){const x=await reader.read();if(x.done)break;buffer+=decoder.decode(x.value,{stream:true});const lines=buffer.split("\n");buffer=lines.pop()||"";for(const line of lines)if(line.trim())try{handle(JSON.parse(line))}catch{}}
      if(buffer.trim())try{handle(JSON.parse(buffer))}catch{}
    }catch(e:any){setError(e.message||"Update failed");setStatus("Failed");log(e.message||"Update failed","err")}
    finally{setRunning(false)}
  }

  function handle(e:any){
    if(e.type==="status")setStatus(e.message);
    if(e.type==="log")log(e.message,e.level||"info");
    if(e.type==="scan"){setTotal(e.total);log(`Found ${e.total} uploadable files.`,"ok")}
    if(e.type==="progress"){setDone(e.current);setTotal(e.total);setCurrent(e.file);setFailed(e.failed||0)}
    if(e.type==="error"){setError(e.message);setStatus("Failed");log(`ERROR: ${e.message}`,"err")}
    if(e.type==="result"){setResult({url:e.url,commit:e.commit});setStatus("Completed");log(`Completed successfully in ${((Date.now()-started.current)/1000).toFixed(1)}s`,"ok")}
  }

  return <main className="page"><div className="wrap">
    <header className="hero"><div className="tag">GITHUB REPOSITORY MANAGER • V3</div><h1>Clean Upload Center</h1><p>Create a repository or completely replace an existing project with a ZIP.</p></header>
    <div className="grid">
      <section className="card">
        <div className="tabs"><button className={`tab ${mode==="replace"?"active":""}`} onClick={()=>setMode("replace")} disabled={running}>♻ Replace All</button><button className={`tab ${mode==="create"?"active":""}`} onClick={()=>setMode("create")} disabled={running}>＋ New Repository</button></div>
        {mode==="replace"?<>
          <h2>Existing Repository</h2>
          <label>GitHub URL or owner/repository</label><input value={repo} onChange={e=>setRepo(e.target.value)} placeholder="Computer17/my-project" disabled={running}/>
          <div className="actions"><button className="small" onClick={loadRepos} disabled={loadingRepos||running}>{loadingRepos?"Loading…":"Load my repositories"}</button></div>
          {repos.length>0&&<div className="repoList">{repos.map(r=><button className="repoItem" key={r.id} onClick={()=>selectRepo(r)}>{r.full_name} {r.private?"🔒":"🌐"}</button>)}</div>}
          <div className="warning"><b>⚠ Replace All</b><br/>The current branch will contain only the new ZIP files. Files missing from the ZIP disappear from the current project. Previous commits remain in Git history.</div>
          <label className="check"><input type="checkbox" checked={confirm} onChange={e=>setConfirm(e.target.checked)} disabled={running}/><span>I understand and want to replace all current project files.</span></label>
        </>:<>
          <h2>New Repository</h2>
          <label>Repository name</label><input value={name} onChange={e=>setName(e.target.value)} placeholder="my-project" disabled={running}/>
          <label>Description</label><textarea value={description} onChange={e=>setDescription(e.target.value)} placeholder="Optional description" disabled={running}/>
          <label className="check"><input type="checkbox" checked={privateRepo} onChange={e=>setPrivateRepo(e.target.checked)} disabled={running}/><span>Private repository</span></label>
        </>}
        <label>Project ZIP</label><div className="file">📦 Select project ZIP<input type="file" accept=".zip,application/zip" onChange={e=>setZip(e.target.files?.[0]||null)} disabled={running}/>{zip&&<div className="hint">{zip.name} • {(zip.size/1024/1024).toFixed(2)} MB</div>}</div>
        <div className="hint">For safety, .git/ entries are never uploaded.</div>
        {error&&<div className="error">❌ {error}</div>}
        <button className="primary" onClick={upload} disabled={running}>{running?"⏳ Working…":mode==="replace"?"♻ DELETE OLD FILES + UPLOAD NEW":"🚀 CREATE + UPLOAD"}</button>
      </section>
      <section className="card monitor">
        <div className="top"><h2>Live Monitor</h2><span className="status">{status}</span></div>
        <div className="progress"><div className="bar" style={{width:`${percent}%`}}/></div>
        <div className="stats"><div className="stat"><b>{percent}%</b><span>PROGRESS</span></div><div className="stat"><b>{done}/{total}</b><span>FILES</span></div><div className="stat"><b>{failed}</b><span>FAILED</span></div><div className="stat"><b>{started.current?Math.floor((Date.now()-started.current)/1000):0}s</b><span>ELAPSED</span></div></div>
        <div className="current">Current: {current}</div>
        <div className="terminal" ref={terminal}>{logs.length===0?<span className="muted">Waiting for an operation…</span>:logs.map(x=><div className={`log ${x.level}`} key={x.id}>[{x.time}] {x.message}</div>)}</div>
        {result&&<div className="result">✅ <b>Upload completed</b><div className="hint">Commit: {result.commit}</div><a href={result.url} target="_blank" rel="noreferrer">{result.url}</a></div>}
        <div className="actions"><button className="small" onClick={()=>navigator.clipboard?.writeText(logs.map(x=>`[${x.time}] ${x.message}`).join("\n"))}>Copy logs</button><button className="small" onClick={()=>setLogs([])} disabled={running}>Clear</button></div>
      </section>
    </div>
  </div></main>
}