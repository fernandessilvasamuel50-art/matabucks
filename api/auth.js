import {Auth} from '@auth/core';
import {authConfig,authConfigured,authOrigin} from '../lib/auth.js';

export default async function handler(req,res){
  res.setHeader('Cache-Control','no-store');
  if(!authConfigured())return res.status(503).json({error:'login_not_configured'});
  const incoming=new URL(req.url,authOrigin());
  const action=req.query?.route||incoming.searchParams.get('route')||incoming.pathname.replace(/^\/api\/auth\/?/,'');
  if(!/^[a-z/-]*$/.test(action))return res.status(400).end();
  incoming.pathname='/api/auth/'+action;incoming.searchParams.delete('route');
  const body=req.method==='GET'||req.method==='HEAD'?undefined:typeof req.body==='string'?req.body:new URLSearchParams(req.body||{}).toString();
  const response=await Auth(new Request(incoming,{method:req.method,headers:req.headers,body}),authConfig());
  response.headers.forEach((v,k)=>{if(k!=='set-cookie')res.setHeader(k,v);});
  const cookies=response.headers.getSetCookie();if(cookies.length)res.setHeader('Set-Cookie',cookies);
  res.status(response.status).end(await response.text());
}
