import React,{useEffect,useRef,useState} from 'react';
import {Download} from 'lucide-react';
import Modal from './Modal.jsx';
import {formatDay,summarize} from '../lib/analytics.js';
export default function ShareCard({match,matches,onClose}){
  const canvas=useRef(null),[options,setOptions]=useState({kda:true,points:true,date:true}),[ready,setReady]=useState(false);
  useEffect(()=>{let alive=true;setReady(false);const image=new Image();image.onload=()=>{
    if(!alive||!canvas.current)return;const c=canvas.current;c.width=1080;c.height=1080;const x=c.getContext('2d');
    const bg=x.createLinearGradient(0,0,1080,1080);bg.addColorStop(0,'#133447');bg.addColorStop(1,'#050a13');x.fillStyle=bg;x.fillRect(0,0,1080,1080);
    x.strokeStyle='#bca16a';x.lineWidth=2;x.strokeRect(38,38,1004,1004);x.save();x.beginPath();x.arc(540,315,148,0,Math.PI*2);x.clip();x.drawImage(image,392,167,296,296);x.restore();
    x.strokeStyle='#d7b879';x.lineWidth=4;x.beginPath();x.arc(540,315,150,0,Math.PI*2);x.stroke();
    x.textAlign='center';x.fillStyle='#e2c68c';x.font='bold 48px Georgia';x.fillText('MATABUKS',540,110);
    x.fillStyle='#a3b5c0';x.font='24px Arial';x.fillText('SAMIRISMO · WILD RIFT',540,520);
    const summary=matches?summarize(matches):null;
    x.fillStyle=match?.result==='Derrota'?'#ef7d80':'#7fdfcf';x.font='bold 66px Georgia';x.fillText(match?match.result.toUpperCase():'RESUMO DA SESSÃO',540,625);
    x.fillStyle='#f4e9d1';x.font='bold 72px Arial';
    if(options.kda)x.fillText(match?(match.k!=null?`${match.k}/${match.d}/${match.a}`:'KDA não informado'):`${summary.wins} V · ${summary.losses} D`,540,738);
    x.font='34px Arial';if(options.points)x.fillText(match?(match.delta!=null?`${match.delta>0?'+':''}${match.delta} pontos`:'Pontos não informados'):`${summary.points>0?'+':''}${summary.points} pontos confirmados`,540,815);
    x.fillStyle='#b7c5ce';x.font='24px Arial';if(options.date)x.fillText(match?formatDay(match.date):`${matches.length} partidas registradas`,540,905);
    x.fillStyle='#7f95a1';x.font='18px Arial';x.fillText('Painel de fã · Dados registrados pelo jogador',540,995);setReady(true);
  };image.onerror=()=>setReady(false);image.src='/img/samira-portrait.webp';return()=>{alive=false;};},[match,matches,options]);
  function download(){if(!ready)return;canvas.current.toBlob(blob=>{if(!blob)return;const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='matabuks-'+(match?.id||'sessao').replace(/[^\w-]/g,'-')+'.png';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);},'image/png');}
  return <Modal title="Criar cartão para compartilhar" onClose={onClose} className="share-modal"><span className="eyebrow">UMA HISTÓRIA PARA GUARDAR</span><h2>Compartilhar</h2><div className="share-options">{[['kda','KDA / resultado'],['points','Pontuação'],['date','Data / partidas']].map(([key,label])=><label key={key}><input type="checkbox" checked={options[key]} onChange={e=>setOptions({...options,[key]:e.target.checked})}/>{label}</label>)}</div><canvas ref={canvas} className="share-canvas" aria-label="Prévia do cartão"/><button className="primary-action" disabled={!ready} onClick={download}><Download size={16}/>Baixar imagem</button></Modal>;
}
