import React,{useEffect,useState} from 'react';
import {Copy,Check,ExternalLink} from 'lucide-react';
import {issueBody,REPOSITORY} from '../lib/tracker.js';
import {useOwner} from './OwnerAccess.jsx';
export default function SaveEvent({event,data,disabled=false,onSaved}){
  const owner=useOwner(),[status,setStatus]=useState(''),[copied,setCopied]=useState(false);
  const body=event?issueBody(event):'';
  const present=!!event&&(data.integration?.audit?.some(e=>e.id===event.id)||data.history?.some(m=>m.id===event.id));
  const ignored=!!event&&data.integration?.audit?.some(e=>e.id===event.id&&e.ignored);
  useEffect(()=>{setStatus('');setCopied(false);},[body]);
  async function copy(){try{await navigator.clipboard.writeText(body);setCopied(true);}catch{setStatus('Não foi possível copiar. Tente confirmar pelo GitHub.');}}
  async function save(){
    if(disabled||!event)return;setStatus('Gravando…');
    try{
      const response=await fetch('/api/events',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(event)}),result=await response.json();
      if(!response.ok)throw Error(result.message||'Entre novamente na sua conta para salvar.');
      setStatus('Gravação confirmada. Aguardando aparecer no painel…');onSaved?.();window.dispatchEvent(new Event('matabuks:refresh'));
    }catch(error){setStatus(error.message);}
  }
  return <div className="save-event">
    <ol className="save-steps" aria-label="Etapas do registro"><li className="done">Recebido</li><li className={event&&!disabled?'done':''}>Conferido</li><li className={present?'done':''}>Publicado</li></ol>
    <div className="entry-actions"><button className="secondary-action" type="button" disabled={!event||disabled} onClick={copy}><Copy size={15}/>{copied?'Copiado':'Enviar ao ChatGPT'}</button>
    {owner.authenticated?<button type="button" className="primary-action" disabled={!event||disabled||status==='Gravando…'||present} onClick={save}>{present?<><Check size={15}/>Publicado</>:status==='Gravando…'?'Gravando…':'Salvar partida'}</button>:owner.configured?<a className="primary-action" href="/api/auth/signin">Entrar para salvar</a>:<a className={'primary-action'+(!event||disabled?' disabled-action':'')} aria-disabled={!event||disabled} target="_blank" rel="noopener noreferrer" href={event?'https://github.com/'+REPOSITORY+'/issues/new?'+new URLSearchParams({title:'[tracker] '+event.kind+' — '+event.id,body}):undefined}>Confirmar no GitHub <ExternalLink size={15}/></a>}
    </div>
    {present?<p className={ignored?'entry-warning':'entry-success'} role="status">{ignored?'Registro publicado, mas não aplicado: há uma correção conflitante. Reabra a partida para conferir.':'Publicado e confirmado no painel.'}</p>:status?<p className="entry-hint" role="status">{status}</p>:<p className="confirmed-note">Revise os dados antes de confirmar. A publicação só é indicada após a leitura do registro salvo.</p>}
  </div>;
}
