import {readFileSync} from 'node:fs';
import {ownerSession,authConfigured,sameOrigin,OWNER_ID} from '../lib/auth.js';
import {fetchJournal} from '../lib/journal.js';
import {validateEvent,composeTracker,issueBody,REPOSITORY,matchRevision} from '../lib/tracker.js';
import {invalidateJournal} from './tracker.js';
const baseline=JSON.parse(readFileSync(new URL('../data/baseline.json',import.meta.url),'utf8'));
const headers=token=>({Authorization:'Bearer '+token,Accept:'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28','User-Agent':'Matabuks-Tracker'});

export function assessWrite(input,records){
  const event=validateEvent(input),current=composeTracker(baseline,records);
  if(records.some(e=>e.id===event.id))return {event,duplicate:true,current};
  if(event.kind==='correction'){
    const match=current.history.find(m=>m.id===event.targetId);
    if(!match)throw Error('Partida não encontrada.');
    if(!event.expected||matchRevision(match)!==matchRevision(event.expected))throw Error('A partida mudou. Reabra os detalhes antes de corrigir.');
    const revised={...match,...event.patch};for(const key of event.unset||[])delete revised[key];
    validateEvent({schema:event.schema,kind:'match',id:'validation-only',match:revised});
  }
  if(event.kind==='revert'&&!records.some(e=>e.id===event.targetEventId))throw Error('Registro da reversão não encontrado.');
  const next=composeTracker(baseline,[...records,{...event,number:current.integration.lastIssue+1}]);
  return {event,duplicate:next.integration.duplicates.includes(event.id),current,next};
}

export default async function handler(req,res){
  res.setHeader('Cache-Control','no-store');res.setHeader('Allow','GET, POST');
  if(!['GET','POST'].includes(req.method))return res.status(405).json({error:'method_not_allowed'});
  if(req.method==='POST'&&!sameOrigin(req))return res.status(403).json({error:'origin_rejected'});
  const session=await ownerSession(req);
  if(req.method==='GET')return res.status(200).json({configured:authConfigured(),authenticated:!!session});
  if(!session)return res.status(401).json({error:'owner_login_required'});
  if(!req.headers['content-type']?.startsWith('application/json'))return res.status(415).json({error:'json_required'});
  try{
    if(Number(req.headers['content-length'])>20000||JSON.stringify(req.body||'').length>20000)return res.status(413).json({error:'payload_too_large'});
    const input=typeof req.body==='string'?JSON.parse(req.body):req.body;
    // Revalidate the provider identity before every write, including revoked sessions.
    const identity=await fetch('https://api.github.com/user',{headers:headers(session.accessToken),signal:AbortSignal.timeout(10000)});
    if(!identity.ok||(await identity.json()).id!==OWNER_ID)return res.status(401).json({error:'login_expired'});
    const journal=await fetchJournal(undefined,{token:session.accessToken});
    const prepared=assessWrite(input,journal.records);
    if(prepared.duplicate)return res.status(200).json({status:'already_saved',id:prepared.event.id});
    const saved=await fetch('https://api.github.com/repos/'+REPOSITORY+'/issues',{
      method:'POST',headers:{...headers(session.accessToken),'Content-Type':'application/json'},
      body:JSON.stringify({title:'[tracker] '+prepared.event.kind+' — '+prepared.event.id,body:issueBody(prepared.event)}),signal:AbortSignal.timeout(12000)});
    if(!saved.ok)return res.status(saved.status===401||saved.status===403?403:502).json({error:'write_failed',message:'Não foi possível confirmar a gravação. Tente novamente com o mesmo registro.'});
    const issue=await saved.json();
    const check=await fetch('https://api.github.com/repos/'+REPOSITORY+'/issues/'+issue.number,{headers:headers(session.accessToken),signal:AbortSignal.timeout(10000)});
    const persisted=check.ok?await check.json():null;
    if(persisted?.body!==issueBody(prepared.event))return res.status(502).json({error:'verification_pending',id:prepared.event.id,message:'Aguarde a sincronização antes de tentar novamente.'});
    await invalidateJournal();
    return res.status(201).json({status:'saved',id:prepared.event.id,issue:issue.number});
  }catch(error){
    const validation=/inválid|Informe|Preencha|MVP|Use o placar|Correção|Partida|Registro|partida mudou|Confirme|vazi/.test(error.message);
    return res.status(validation?400:503).json({error:validation?'invalid_event':'temporarily_unavailable',message:validation?error.message:'Não foi possível confirmar. Aguarde a sincronização e tente novamente.'});
  }
}
