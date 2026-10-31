import React,{useEffect,useMemo,useRef,useState} from "react";
import {createRoot} from "react-dom/client";
import {motion,AnimatePresence} from "motion/react";
import {Swords,Shield,Crown,Skull,Star,Flame,Trophy,Target,Medal,ChevronLeft,ChevronRight,X,Menu,ArrowUpRight,CheckCircle2,Info,ScrollText,Clock,LockKeyhole,Play,BarChart3,Sparkles,Compass} from "lucide-react";
import "./style.css";
const AS="/img/";
const fallback={
 score:6452,top200Cutoff:8956,elo:"Mestre II",marks:12,markThreshold:20,laneLevel:9,peakScore:7742,matches:1005,
 wins:507,losses:498,winRatePercent:50.4,mvps:121,pentakills:12,rankS:69,legendaryS:6,rankA:101,triplekillsConfirmedSinceBaseline:1,
 history:[
 {id:"2026-10-30-5",date:"2026-10-30",result:"Vitória",k:4,d:1,a:3,delta:57,scoreAfter:6452},
 {id:"2026-10-30-4",date:"2026-10-30",result:"Derrota",k:11,d:5,a:3,delta:-73,scoreAfter:6395},
 {id:"2026-10-30-3",date:"2026-10-30",result:"Vitória",delta:64,scoreAfter:6468,triplekills:1},
 {id:"2026-10-30-2",date:"2026-10-30",result:"Vitória",delta:55,scoreAfter:6404},
 {id:"2026-10-30-1",date:"2026-10-30",result:"Vitória",delta:113,scoreAfter:6349,mvp:true}]};
const skinSet=[
 {id:"original",name:"Clássica",subtitle:"Samira original",tier:"ORIGINAL"},
 {id:"psyops",name:"PsyOps",subtitle:"Operações Psíquicas",tier:"ÉPICA"},
 {id:"velho-oeste",name:"Velho Oeste",subtitle:"High Noon",tier:"ÉPICA"},
 {id:"celulas-supremas",name:"Células Supremas",subtitle:"Supreme Cells",tier:"ESPECIAL"},
 {id:"soul-fighter",name:"Soul Fighter",subtitle:"Torneio das Almas",tier:"LENDÁRIA"},
 {id:"cromatizadora",name:"Cromatizadora",subtitle:"Chromacrash",tier:"ÉPICA"},
 {id:"guerreira-cinzas",name:"Guerreira das Cinzas",subtitle:"Ashen Avenger",tier:"ESPECIAL"},
 {id:"curtindo-verao",name:"Curtindo o Verão",subtitle:"Summer Party",tier:"ÉPICA"}];
const n=v=>Number(v??0).toLocaleString("pt-BR");
const Avatar=({className=""})=><img className={"avatar "+className} src={AS+"samira-portrait.webp"} alt="Retrato da Samira" onError={e=>{e.currentTarget.onerror=null;e.currentTarget.src=AS+"samira-original.jpg"}}/>;
function Badge({result}){const win=result==="Vitória";return <span className={"result-tag "+(win?"win":"loss")}>{win?"V":"D"}</span>}
function Extra({m}){let text=m.pentakills?"PENTAKILL":m.triplekills?"TRIPLE KILL":m.mvp?"MVP":m.rank?"RANK "+m.rank:null;
return text?<span className={"extra-tag "+(m.triplekills?"triple":m.pentakills?"penta":"mvp")}>{m.triplekills?<Flame size={12}/>:m.mvp?<Star size={12}/>:<Trophy size={12}/>} {text}</span>:null}
function FeedCard({m}){return <div className="feed-card" title={m.result+" "+(m.delta>0?"+":"")+m.delta+" pontos"}>
<Avatar className="feed-avatar"/><Badge result={m.result}/><b className={"points-delta "+(m.delta<0?"negative":"")}>{m.delta>0?"+":""}{m.delta}</b>
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
 <div className="rank-crest"><div className="rank-ambient"></div><img src={AS+(String(d.elo||"").toLowerCase().includes("grão")?"grandmaster-rank.webp":"master-rank.webp")} alt={"Emblema "+(d.elo||"Mestre II")}/></div>
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
<div className="overview-note">Triplas: registradas desde o início do acompanhamento.</div>
</section>}
function DragonRole({d}){return <section className="panel dragon" id="rota"><Corners/><h2>ROTA DO DRAGÃO</h2><div className="dragon-emblem"><img src={AS+"dragon-route.webp"} alt="Emblema dourado da Rota do Dragão"/></div><p>NÍVEL {n(d.laneLevel??9)}</p><small>ESPECIALIDADE</small><div className="role-chips"><span>ADC</span><span>ATIRADORA</span><span>DUO LANE</span></div></section>}
function Skins(){const scrollRef=useRef(null),[selected,setSelected]=useState(null);const move=dir=>scrollRef.current?.scrollBy({left:dir*360,behavior:"smooth"});return <section className="panel skins" id="skins"><Corners/><div className="panel-heading skin-header"><div className="medallion"><Avatar/></div><div><h2>ARSENAL DA SAMIRA</h2><small>O ESTILO NUNCA MORRE.</small></div></div>
<div className="skins-gallery-shell"><button className="gallery-arrow prev" onClick={()=>move(-1)} aria-label="Skins anteriores"><ChevronLeft/></button><div className="skins-gallery" ref={scrollRef}>{skinSet.map((s,i)=><button className="skin-card" key={s.id} onClick={()=>setSelected(i)}><img src={AS+"samira-"+s.id+".jpg"} loading="lazy" alt={"Arte de Samira "+s.name}/><div className="skin-title"><b>Samira</b><span>{s.name}</span></div></button>)}</div><button className="gallery-arrow next" onClick={()=>move(1)} aria-label="Próximas skins"><ChevronRight/></button></div>
<div className="gallery-pagination"><span className="active"></span><span></span><span></span><span></span><span></span></div>
<AnimatePresence>{selected!==null&&<motion.div className="modal-shade" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onClick={()=>setSelected(null)} role="presentation"><motion.div className="skin-modal" role="dialog" aria-modal="true" aria-label={"Visual da Samira "+skinSet[selected].name} onClick={e=>e.stopPropagation()} initial={{y:30,scale:.96}} animate={{y:0,scale:1}} exit={{y:20,opacity:0}}><img src={AS+"samira-"+skinSet[selected].id+".jpg"} alt={"Samira "+skinSet[selected].name}/><button onClick={()=>setSelected(null)} className="close-modal" aria-label="Fechar"><X/></button><div className="modal-text"><small>{skinSet[selected].tier}</small><h3>SAMIRA · {skinSet[selected].name}</h3><p>{skinSet[selected].subtitle}</p><div className="modal-nav"><button onClick={()=>setSelected((selected+skinSet.length-1)%skinSet.length)} aria-label="Anterior"><ChevronLeft/></button><span>{selected+1} / {skinSet.length}</span><button onClick={()=>setSelected((selected+1)%skinSet.length)} aria-label="Próxima"><ChevronRight/></button></div></div></motion.div></motion.div>}</AnimatePresence>
</section>}
function RecentGames({d}){const items=[...(d.history||[])].slice(0,6);return <section className="panel recent" id="partidas"><Corners/><div className="panel-simple-head"><h2>ÚLTIMAS PARTIDAS</h2><a href="#historico">VER TODAS <ArrowUpRight size={14}/></a></div>
<div className="game-rows">{items.map((m,i)=><div className="game-row" key={m.id||i}><Avatar className="recent-avatar"/><Badge result={m.result}/><div className="game-desc"><b className={m.result==="Vitória"?"green":"red"}>{m.result.toUpperCase()}</b><span className={m.delta<0?"red":"green"}>{m.delta>0?"+":""}{m.delta}</span></div>{m.k!=null&&<div className="game-kda">{m.k}/{m.d}/{m.a}</div>}<Extra m={m}/><time>{m.date?.split("-").reverse().slice(0,2).join("/")}</time></div>)}</div>
{!items.length&&<p className="nothing">Nenhuma partida registrada.</p>}
</section>}
function Achievements({d}){const trophies=[{name:"DUAS PENTAS",detail:"30/3/5 em partida Mestre",Icon:Skull},{name:"PENTAKILLS",detail:n(d.pentakills??12)+" no histórico",Icon:Crown},{name:"MVP",detail:n(d.mvps??121)+" vezes",Icon:Star},{name:"TOP 200",detail:"Na caçada",Icon:LockKeyhole}];const [sel,setSel]=useState(null);return <section className="achieve-section" id="conquistas"><div className="achievement-title"><Trophy size={20}/> CÂMARA DE CONQUISTAS</div><div className="achievement-tiles">{trophies.map((a,i)=><button className="achievement" key={a.name} onClick={()=>setSel(a)}><div className="achievement-medal"><a.Icon size={29}/></div><div><b>{a.name}</b><span>{a.detail}</span></div></button>)}</div><AnimatePresence>{sel&&<motion.div className="modal-shade" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onClick={()=>setSel(null)}><motion.div className="achieve-modal" initial={{scale:.92}} animate={{scale:1}} exit={{scale:.92}} onClick={e=>e.stopPropagation()}><button onClick={()=>setSel(null)} className="close-modal" aria-label="Fechar"><X/></button><Trophy size={60}/><h3>{sel.name}</h3><p>{sel.detail}</p></motion.div></motion.div>}</AnimatePresence></section>}
function App(){const [data,setData]=useState(fallback);const [connected,setConnected]=useState(false);const [updated,setUpdated]=useState(null);
useEffect(()=>{let alive=true;async function sync(){try{const res=await fetch("/api/tracker",{cache:"no-store"});if(!res.ok)throw Error(String(res.status));const next=await res.json();if(alive&&typeof next.score==="number"){setData({...fallback,...next});setConnected(true);setUpdated(new Date())}}catch(e){if(alive)setConnected(false)}}sync();const timer=setInterval(sync,30000);return()=>{alive=false;clearInterval(timer)}},[]);
return <div className="root"><Hero d={data}/><MatchTicker history={data.history}/>
<main className="dashboard"><div className="top-grid"><Hunt d={data}/><Overview d={data}/><DragonRole d={data}/></div>
<div className="bottom-grid"><Skins/><RecentGames d={data}/></div><Achievements d={data}/></main>
<footer className="footer" id="historico"><span>MATABUKS / SAMIRISMO — PROJETO DE FÃ NÃO OFICIAL.</span><span>{connected?"● DADOS SINCRONIZADOS":"◌ EXIBINDO ÚLTIMO REGISTRO SALVO"}</span><span>Partidas e estatísticas: somente dados informados.</span></footer>
</div>}
createRoot(document.getElementById("root")).render(<App/>);