import {REPOSITORY,validateEvent} from './tracker.js';
const digest=async value=>[...new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(JSON.stringify(value))))].map(v=>v.toString(16).padStart(2,'0')).join('');
export async function createBackup(data){
  const payload={schema:'matabuks/backup-v1',repository:REPOSITORY,createdAt:new Date().toISOString(),snapshot:data,events:(data.integration?.audit||[]).map(e=>({...validateEvent(e),number:e.number}))};
  return {...payload,sha256:await digest(payload)};
}
export async function inspectBackup(text,current){
  if(text.length>5000000)throw Error('Backup grande demais.');
  const {sha256,...payload}=JSON.parse(text);
  if(payload.schema!=='matabuks/backup-v1'||payload.repository!==REPOSITORY||!Array.isArray(payload.events)||payload.events.length>10000)throw Error('Este arquivo não é um backup compatível do Matabuks.');
  if(sha256!==await digest(payload))throw Error('O arquivo foi alterado ou está incompleto.');
  const events=payload.events.map(e=>({...validateEvent(e),number:e.number}));
  const currentIds=new Set((current.integration?.audit||[]).map(e=>e.id));
  return {...payload,events,missing:events.filter(e=>!currentIds.has(e.id))};
}
export function historyCSV(history){
  const keys=['id','date','result','k','d','a','delta','scoreAfter','marksAfter','mvp','svp','rank','triplekills','quadrakills','pentakills','gold','performanceScore'];
  const cell=v=>'"'+String(v??'').replace(/^[=+@-]/,"'$&").replaceAll('"','""')+'"';
  return '\ufeff'+[keys.join(';'),...history.map(m=>keys.map(k=>cell(m[k])).join(';'))].join('\r\n');
}
export function downloadFile(value,name,type){const url=URL.createObjectURL(new Blob([value],{type})),a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
