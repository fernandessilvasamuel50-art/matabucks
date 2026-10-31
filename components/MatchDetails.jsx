import React,{useCallback,useState} from 'react';
import Modal from './Modal.jsx';
import Medals from './Medals.jsx';
import MatchForm from './MatchForm.jsx';
import ShareCard from './ShareCard.jsx';
import {formatDay} from '../lib/analytics.js';
import {REPOSITORY} from '../lib/tracker.js';
export default function MatchDetails({match,data,onClose}){
  const [view,setView]=useState('details');
  const editClose=useCallback(()=>setView('details'),[]);
  if(view==='edit')return <MatchForm data={data} initialMatch={match} onClose={editClose}/>;
  if(view==='share')return <ShareCard match={match} onClose={editClose}/>;
  return <Modal title="Detalhes da partida" onClose={onClose} className="match-details-modal"><span className="eyebrow">{formatDay(match.date)}</span><h2 className={match.result==='Vitória'?'green':'red'}>{match.result.toUpperCase()}</h2><div className="detail-champion"><img className="avatar" src="/img/samira-portrait.webp" alt="Samira"/><div><strong>SAMIRA</strong><span>{match.mode||'Ranqueada'}</span></div><Medals match={match}/></div><dl className="match-facts">{[['KDA',match.k!=null?`${match.k}/${match.d}/${match.a}`:null],['Variação',match.delta!=null?`${match.delta>0?'+':''}${match.delta}`:null],['Champion Score',match.scoreAfter],['Placar das equipes',match.teamScore],['Ouro',match.gold],['Desempenho',match.performanceScore],['Marcas após a partida',match.marksAfter]].filter(([,v])=>v!=null).map(([label,value])=><div key={label}><dt>{label}</dt><dd>{typeof value==='number'?value.toLocaleString('pt-BR'):value}</dd></div>)}</dl><p className="confirmed-note">Somente informações confirmadas desta partida.</p><p className="confirmed-note">{match.sourceIssue?<a href={`https://github.com/${REPOSITORY}/issues/${match.sourceIssue}`} target="_blank" rel="noopener noreferrer">Ver registro original</a>:'Registro inicial preservado do tracker.'}</p><div className="entry-actions"><button className="secondary-action" onClick={()=>setView('edit')}>Corrigir informações</button><button className="primary-action" onClick={()=>setView('share')}>Criar cartão</button></div></Modal>;
}
