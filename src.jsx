import React,{useEffect,useMemo,useRef,useState} from "react";
import {createRoot} from "react-dom/client";
import {motion,AnimatePresence} from "motion/react";
import {Swords,Shield,Crown,Skull,Star,Flame,Trophy,Target,Medal,ChevronLeft,ChevronRight,X,Menu,ArrowUpRight,CheckCircle2,Info,ScrollText,Clock,LockKeyhole,Play,BarChart3,Sparkles,Compass} from "lucide-react";
import "./style.css";
import "./enhancements.css";
import lastKnown from "./data/last-known.json";
import RankCrest from "./components/RankCrest.jsx";
import Medals, {MedalIcon} from "./components/Medals.jsx";
import Modal from "./components/Modal.jsx";
import MatchForm from "./components/MatchForm.jsx";
const AS="/img/";
const fallback={...lastKnown,statisticsEstimated:true};
const skinSet=[
 {id:"original",name:"A Rosa do Deserto",officialName:"Samira, a Rosa do Deserto",focus:"65%",color:"#cf9b78"},
 {id:"psyops",name:"PsyOps",officialName:"Samira PsyOps",focus:"71%",color:"#a491eb"},
 {id:"velho-oeste",name:"Velho Oeste",officialName:"Samira Velho Oeste",focus:"50%",color:"#e9a448"},
 {id:"soul-fighter",name:"Soul Fighter",officialName:"Samira Soul Fighter",focus:"66%",color:"#e7799a"},
 {id:"cromatizadora",name:"Cromatizadora",officialName:"Samira Cromatizadora",focus:"69%",color:"#e37ae5"},
 {id:"curtindo-verao",name:"Curtindo o Verão",officialName:"Samira Curtindo o Verão",focus:"57%",color:"#85e5d5"},
 {id:"guerreira-cinzas",name:"Guerreira das Cinzas",officialName:"Samira Guerreira das Cinzas",focus:"56%",color:"#b1a8ef"},
 {id:"celulas-supremas",name:"Células Supremas",officialName:"Samira Células Supremas",focus:"73%",color:"#e5c767"}
];
const n=v=>Number(v??0).toLocaleString("pt-BR");
const Avatar=({className=""})=><img className={"avatar "+className} src={AS+"samira-portrait.webp"} alt="Retrato da Samira" onError={e=>{e.currentTarget.onerror=null;e.currentTarget.src=AS+"samira-original.jpg"}}/>;
function Badge({result}){const win=result==="Vitória";return <span className={"result-tag "+(win?"win":"loss")}>{win?"V":"D"}</span>}
function Extra({m}){return <Medals match={m} compact/>}
function FeedCard({m}){return <div className="feed-card" title={m.result+" "+(m.delta>0?"+":"")+m.delta+" pontos"}>
<Avatar className="feed-avatar"/><Badge result={m.result}/><b className={"points-delta "+(m.delta<0?"negative":"")}>{m.delta==null?"—":(m.delta>0?"+":"")+m.delta}</b>
{m.k!=null&&<span className="feed-kda">{m.k}/{m.d}/{m.a}</span>}<Extra m={m}/>
</div>}
function MatchTicker({history}){const recent=[...(history||[])].slice(0,8).reverse();
const data=recent.length?recent:[];
if(!data.length)return <div className="ticker-empty">Nenhuma partida registrada ainda</div>;
return <section className="ticker-panel" aria-label="Faixa animada das partidas recentes">
<div className="ticker-accent">◆</div><div className="ticker-mask">
<div className="ticker-track">{[0,1,2].map(copy=><div className="ticker-set" key={copy} aria-hidden={copy!==0}>{data.map((m,i)=><FeedCard key={(m.id||i)+"-"+copy} m={m}/>)}</div>)}</div>
</div><div className="ticker-accent right">◆</div></section>}
function Corners(){return <><i className="corner tl"/><i className="corner tr"/><i className="corner bl"/><i className="corner br"/></>}
function Header({avatar}){const [open,setOpen]=useState(false);return <div className="top-nav">
<a className="top-brand" href="#inicio"><img src={AS+"dragon-route.webp"} alt="" className="brand-rune"/><span><b>MATABUKS</b><small>S A M I R I S M O</small></span></a>
<nav className={open?"nav-tabs open":"nav-tabs"} aria-label="Navegação">
{[["Início","#inicio",Compass],["Estatísticas","#estatisticas",BarChart3],["Partidas","#partidas",Swords],["Conquistas","#conquistas",Trophy],["Skins","#skins",Sparkles],["Histórico","#historico",Clock]].map(([label,url,Icon],i)=><a key={label} className={i===0?"selected":""} href={url} onClick={()=>setOpen(false)}><Icon size={14}/>{label}</a>)}
</nav>
<div className="top-player"><Avatar/><div><small>WILD RIFT</small><b>SAMIRA</b></div></div>
<button className="mobile-menu" aria-label="Abrir menu" aria-expanded={open} onClick={()=>setOpen(!open)}><Menu/></button>
</div>}
function Hero({d,history}){return <section className="hero-wrap" id="inicio">
<div className="hero-portrait" role="img" aria-label="Arte ilustrada da Samira"></div>
<div className="hero-shade"></div>
<Header/>
<div className="hero-left"><h1>MATABUKS</h1><p>“ESTILO É TUDO.”<small>— SAMIRA</small></p></div>
<div className="hero-profile">
 <RankCrest elo={d.elo}/>
 <h2>{d.elo??"Mestre II"}</h2>
 <div className="rank-marks">
  <img src={AS+"mark-diamond.webp"} alt="Marca ranqueada"/>
  <strong>{Number(d.marks??12)} <span>/ {String(d.elo||"").toLowerCase().includes("grão")?(d.nextRankMarkThreshold||"—"):String(d.elo||"Mestre II").endsWith(" III")?10:String(d.elo||"Mestre II").endsWith(" II")?20:30}</span></strong>
 </div>
 <div className="rank-marks-progress"><span style={{width:Math.min(100,100*Number(d.marks??12)/(String(d.elo||"").toLowerCase().includes("grão")?(d.nextRankMarkThreshold||Number(d.marks??12)):String(d.elo||"Mestre II").endsWith(" III")?10:String(d.elo||"Mestre II").endsWith(" II")?20:30))+"%"}}/></div>
 <small className="rank-promotion">{String(d.elo||"").toLowerCase().includes("grão")?"PROGRESSO NA RANQUEADA":String(d.elo||"Mestre II").endsWith(" III")?"PRÓXIMO: MESTRE II":String(d.elo||"Mestre II").endsWith(" II")?"PRÓXIMO: MESTRE I":"PRÓXIMO: GRÃO-MESTRE"}</small>
</div>
<div className="hero-route"><img src={AS+"dragon-route.webp"} alt="Símbolo dourado da rota do dragão"/><h2>ROTA DO DRAGÃO</h2><p>ADC · ATIRADORA</p><small>“CAÇANDO GRANDES HISTÓRIAS.”</small></div>
</section>}
function Hunt({d}){let s=Number(d.score??6395),top=Number(d.top200Cutoff??8956),p=top?Math.min(100,Math.max(0,s/top*100)):0;
return <section className="panel hunt" id="cacada"><Corners/>
<div className="panel-heading"><div className="medallion"><Avatar/></div><div><h2>A CAÇADA AO TOP 200</h2><small>CADA PONTO É UMA HISTÓRIA.</small></div></div>
<div className="hunt-progress-wrap"><div className="hunt-track"><motion.div className="hunt-gold" initial={{width:"0%"}} animate={{width:p+"%"}} transition={{duration:1.5,ease:"easeOut"}}/><div className="hunt-marker" style={{left:p+"%"}}><Avatar/></div><div className="hunt-destination"><img src={AS+"dragon-route.webp"} alt="Destino Top 200"/></div></div></div>
<div className="hunt-numbers"><div><b>{n(s)}</b><span>SamiraCoins</span></div><div className="progress-percent">{p.toFixed(1).replace(".",",")}%</div><div className="end-score"><b>{n(top)}</b><span>Corte informado (Top 200)</span></div></div>
<p className="hunt-remainder">Faltam <strong>{n(Math.max(0,top-s))}</strong> pontos até o corte informado. <span>O corte muda com o ranking.</span></p>
</section>}
function Overview({d}){const stats=[
 {label:"PARTIDAS",value:n(d.matches??1004),icon:Swords},
 {label:"WIN RATE",value:(Number(d.winRatePercent??50.4)).toFixed(1).replace(".",",")+"%",icon:Target},
 {label:"MVPs",value:n(d.mvps??121),icon:Star},
 {label:"PENTAKILLS",value:n(d.pentakills??12),icon:Crown},
 {label:"RANK S",value:n(d.rankS??69),icon:Medal},
 {label:"TRIPLES REGISTRADAS",value:n(d.triplekillsConfirmedSinceBaseline??1)+"+",icon:Flame}
];return <section className="panel overview" id="estatisticas"><Corners/><div className="panel-simple-head"><h2>VISÃO GERAL</h2><span>COM SAMIRA</span></div>
<div className="overview-grid">{stats.map((x,i)=><motion.div className="metric" key={x.label} initial={{opacity:0,y:12}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{delay:i*.05}}><x.icon className="metric-icon" size={24} strokeWidth={1.65}/><div><strong>{x.value}</strong><span>{x.label}</span></div></motion.div>)}</div>
<div className="overview-note">Partidas, vitórias e win rate são estimativas históricas. Triplas: confirmadas desde o início do acompanhamento.</div>
</section>}
function DragonRole({d}){return <section className="panel dragon" id="rota"><Corners/><h2>ROTA DO DRAGÃO</h2><div className="dragon-emblem"><img src={AS+"dragon-route.webp"} alt="Emblema dourado da Rota do Dragão"/></div><p>NÍVEL {n(d.laneLevel??9)}</p><small>ESPECIALIDADE</small><div className="role-chips"><span>ADC</span><span>ATIRADORA</span><span>DUO LANE</span></div></section>}
function Skins(){
 const scrollRef=useRef(null),[selected,setSelected]=useState(null);
 const close=React.useCallback(()=>setSelected(null),[]);
 const move=dir=>scrollRef.current?.scrollBy({left:dir*(scrollRef.current.clientWidth*.72),behavior:"smooth"});
 return <section className="panel skins loading-card-gallery" id="skins"><Corners/>
 <div className="skin-section-heading"><div className="panel-heading skin-header"><div className="medallion"><Avatar/></div><div><h2>ARSENAL DA SAMIRA</h2><small>O ESTILO NUNCA MORRE.</small></div></div><span className="gallery-guide">8 VISUAIS <span>·</span> DESLIZE PARA EXPLORAR</span></div>
 <div className="skins-gallery-shell"><button className="gallery-arrow prev" onClick={()=>move(-1)} aria-label="Skins anteriores"><ChevronLeft/></button>
 <div className="skins-gallery" ref={scrollRef} aria-label="Skins da Samira, uma única fileira">{skinSet.map((skin,index)=><button className="skin-card loading-card" key={skin.id} style={{"--skin-accent":skin.color}} onClick={()=>setSelected(index)} aria-label={"Ver "+skin.officialName}>
 <img className="skin-art" src={AS+"samira-"+skin.id+".jpg"} style={{objectPosition:skin.focus+" center"}} loading="lazy" alt={skin.officialName}/><span className="skin-vignette"/><span className="skin-frame"/><span className="skin-number">{String(index+1).padStart(2,"0")}</span>
 <span className="skin-caption"><span className="skin-champion">SAMIRA</span><strong>{skin.name}</strong><span className="skin-divider"/><span className="skin-profile"><Avatar/></span></span>
 </button>)}</div><button className="gallery-arrow next" onClick={()=>move(1)} aria-label="Próximas skins"><ChevronRight/></button></div>
 <div className="gallery-bottom"><span>ARTES OFICIAIS · WILD RIFT</span><span>TOQUE PARA AMPLIAR <ArrowUpRight size={12}/></span></div>
 {selected!==null&&<Modal title={skinSet[selected].officialName} onClose={close} className="skin-modal skin-viewer"><img src={AS+"samira-"+skinSet[selected].id+".jpg"} alt={skinSet[selected].officialName}/><div className="modal-text"><small>ARSENAL DA SAMIRA</small><h3>{skinSet[selected].officialName}</h3><div className="modal-nav"><button onClick={()=>setSelected((selected+skinSet.length-1)%skinSet.length)} aria-label="Skin anterior"><ChevronLeft/></button><span>{selected+1} / {skinSet.length}</span><button onClick={()=>setSelected((selected+1)%skinSet.length)} aria-label="Próxima skin"><ChevronRight/></button></div></div></Modal>}
 </section>
}
function RecentGames({d}){
 const [all,setAll]=useState(false),[selected,setSelected]=useState(null);
 const close=React.useCallback(()=>setSelected(null),[]);
 const items=(d.history||[]).slice(0,all?undefined:6);
 const formatDate=date=>date?.split("-").reverse().join("/")||"Data não informada";
 return <section className="panel recent wildrift-history" id="partidas"><Corners/><div className="panel-simple-head"><div><span className="eyebrow">CADA PARTIDA CONTA</span><h2>ÚLTIMAS PARTIDAS</h2></div><span className="history-count">{(d.history||[]).length} REGISTRADAS</span></div>
 <div className="game-rows" role="list">{items.map(match=><article className={"game-row match-history-row "+(match.result==="Vitória"?"history-win":"history-loss")} key={match.id} role="listitem">
 <div className="match-portrait"><Avatar/><span aria-hidden="true">{match.result==="Vitória"?"V":"D"}</span></div>
 <div className="match-outcome"><strong>{match.result.toUpperCase()}</strong><span>{match.mode||"Ranqueada"} · Samira</span><b className={"history-delta "+(match.delta<0?"red":"green")}>{match.delta==null?"PONTOS NÃO INFORMADOS":(match.delta>0?"+":"")+match.delta+" PONTOS"}</b></div>
 <div className="history-kda"><strong>{match.k!=null?match.k+"/"+match.d+"/"+match.a:"—"}</strong><span>K / D / A</span></div>
 <div className="history-awards"><Medals match={match}/></div>
 <div className="history-date"><time>{formatDate(match.date)}</time>{match.scoreAfter!=null&&<span>{n(match.scoreAfter)} pontos</span>}</div>
 <button className="match-detail-button" onClick={()=>setSelected(match)} aria-label={"Detalhes da partida "+match.id}><ScrollText size={20}/></button>
 </article>)}</div>
 {!items.length&&<p className="nothing">Sua próxima partida começa esta história.</p>}
 {(d.history||[]).length>6&&<button className="history-more" onClick={()=>setAll(!all)}>{all?"Mostrar recentes":"Ver todo o histórico ("+d.history.length+")"}<ChevronRight size={16}/></button>}
 {selected&&<Modal title="Detalhes da partida" onClose={close} className="match-details-modal"><span className="eyebrow">{formatDate(selected.date)}</span><h2 className={selected.result==="Vitória"?"green":"red"}>{selected.result.toUpperCase()}</h2><div className="detail-champion"><Avatar/><div><strong>SAMIRA</strong><span>{selected.mode||"Ranqueada"}</span></div><Medals match={selected}/></div><dl className="match-facts">{[["KDA",selected.k!=null?selected.k+"/"+selected.d+"/"+selected.a:null],["Variação",selected.delta!=null?(selected.delta>0?"+":"")+selected.delta:null],["Champion Score",selected.scoreAfter],["Placar das equipes",selected.teamScore],["Ouro",selected.gold],["Desempenho",selected.performanceScore],["Marcas após a partida",selected.marksAfter]].filter(([,value])=>value!=null).map(([label,value])=><div key={label}><dt>{label}</dt><dd>{typeof value==="number"?n(value):value}</dd></div>)}</dl><p className="confirmed-note">Somente informações confirmadas desta partida.</p></Modal>}
 </section>
}
function Achievements({d}){const trophies=[{name:"DUAS PENTAS",detail:"30/3/5 em partida Mestre",Icon:Skull},{name:"PENTAKILLS",detail:n(d.pentakills??12)+" no histórico",Icon:Crown},{name:"MVP",detail:n(d.mvps??121)+" vezes",Icon:Star},{name:"TOP 200",detail:"Na caçada",Icon:LockKeyhole}];const [sel,setSel]=useState(null);return <section className="achieve-section" id="conquistas"><div className="achievement-title"><Trophy size={20}/> CÂMARA DE CONQUISTAS</div><div className="achievement-tiles">{trophies.map((a,i)=><button className="achievement" key={a.name} onClick={()=>setSel(a)}><div className="achievement-medal"><a.Icon size={29}/></div><div><b>{a.name}</b><span>{a.detail}</span></div></button>)}</div><AnimatePresence>{sel&&<motion.div className="modal-shade" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onClick={()=>setSel(null)}><motion.div className="achieve-modal" initial={{scale:.92}} animate={{scale:1}} exit={{scale:.92}} onClick={e=>e.stopPropagation()}><button onClick={()=>setSel(null)} className="close-modal" aria-label="Fechar"><X/></button><Trophy size={60}/><h3>{sel.name}</h3><p>{sel.detail}</p></motion.div></motion.div>}</AnimatePresence></section>}
function App(){
 const [data,setData]=useState(()=>{try{const saved=JSON.parse(localStorage.getItem("matabuks-tracker-v4"));return saved&&Number.isFinite(saved.score)&&Array.isArray(saved.history)?{...fallback,...saved}:fallback}catch{return fallback}});
 const [connected,setConnected]=useState(false),[updated,setUpdated]=useState(null);
 useEffect(()=>{let alive=true,busy=false;const controller=new AbortController();async function sync(){if(busy)return;busy=true;try{const res=await fetch("/api/tracker",{cache:"no-store",signal:controller.signal});if(!res.ok)throw Error(String(res.status));const next=await res.json();if(alive&&Number.isFinite(next.score)&&Array.isArray(next.history)){setData(next);setConnected(!next.integration?.stale);setUpdated(next.integration?.checkedAt||new Date().toISOString());try{localStorage.setItem("matabuks-tracker-v4",JSON.stringify(next))}catch{}}}catch{if(alive)setConnected(false)}finally{busy=false}}sync();const timer=setInterval(sync,30000);return()=>{alive=false;controller.abort();clearInterval(timer)}},[]);
 return <div className="root"><Hero d={data}/><MatchTicker history={data.history}/>
 <main className="dashboard"><div className="dashboard-toolbar"><div><span className="journey-label">SUA JORNADA COM SAMIRA</span><span className={"sync-status "+(connected?"is-connected":"")} role="status"><i/>{connected?"Dados sincronizados":"Últimos dados disponíveis"}{updated&&<small> · {new Date(updated).toLocaleTimeString("pt-BR",{timeZone:"America/Manaus",hour:"2-digit",minute:"2-digit"})}</small>}</span></div><MatchForm data={data}/></div>
 {data.integration?.warnings?.length>0&&<div className="reconciliation-note" role="status"><Info size={16}/> Há informações de pontuação ou conquistas aguardando reconciliação. <details><summary>Ver observações</summary>{data.integration.warnings.map(text=><p key={text}>{text}</p>)}</details></div>}
 <div className="top-grid"><Hunt d={data}/><Overview d={data}/><DragonRole d={data}/></div>
 <div className="arsenal-section"><Skins/></div><RecentGames d={data}/><Achievements d={data}/></main>
 <footer className="footer" id="historico"><span>MATABUKS / SAMIRISMO — PROJETO DE FÃ NÃO OFICIAL.</span><span>{connected?"● DADOS SINCRONIZADOS":"◌ ÚLTIMOS DADOS DISPONÍVEIS"}</span><span>Totais históricos estimados. Conquistas confirmadas.</span></footer>
 </div>
}
createRoot(document.getElementById("root")).render(<App/>);
