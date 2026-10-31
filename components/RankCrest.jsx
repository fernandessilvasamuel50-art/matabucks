import React from 'react';
import {Shield} from 'lucide-react';
const themes=[['soberano','sovereign','#9b82ff','#bdeaff','challenger-rank.webp'],['desafiante','challenger','#f6d781','#81e6ff','challenger-rank.webp'],['grão','grandmaster','#ff525e','#e8b86a','ranks/grandmaster-complete-v2.webp'],['mestre','master','#e86cff','#8ceaff','ranks/master-complete-v2.webp'],['diamante','diamond','#99a8ff','#b3f1ff'],['esmeralda','emerald','#46ddb0','#d4ffe8'],['platina','platinum','#62d5df','#e5feff'],['ouro','gold','#e7b964','#fff0ba'],['prata','silver','#b5cadf','#f4f8ff'],['bronze','bronze','#cb9765','#ffe1b4'],['ferro','iron','#8c9baf','#dbe9f1']];
export default function RankCrest({elo='Mestre III'}){
  const [,name,core,light,image]=themes.find(([key])=>elo.toLowerCase().includes(key))||themes[3];
  const complete=name==='master'||name==='grandmaster';
  return <div className={'rank-crest animated-crest restored-crest rank-theme-'+name} style={{'--rank-core':core,'--rank-light':light}}>
    <div className="rank-aura" aria-hidden="true"/>
    {image?<img className={complete?'rank-complete-image':'rank-core-image'} src={'/img/'+image} alt={'Emblema '+elo}/>:<Shield className="rank-generic-shield" aria-label={'Emblema '+elo} strokeWidth={1.1}/>}
    <span className="rank-spark spark-one" aria-hidden="true"/><span className="rank-spark spark-two" aria-hidden="true"/>
  </div>;
}
