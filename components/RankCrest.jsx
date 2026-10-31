import React, {useId} from 'react';
import {Shield} from 'lucide-react';

const themes = [
  ['soberano', 'sovereign', '#9b82ff', '#bdeaff', '#f5cb7d', 'challenger-rank.webp'],
  ['desafiante', 'challenger', '#f6d781', '#81e6ff', '#fff6d8', 'challenger-rank.webp'],
  ['grão', 'grandmaster', '#ff525e', '#ffd3b3', '#e8b86a', 'grandmaster-rank.webp'],
  ['mestre', 'master', '#e86cff', '#8ceaff', '#f1bc78', 'master-rank.webp'],
  ['diamante', 'diamond', '#99a8ff', '#b3f1ff', '#e7dbff'],
  ['esmeralda', 'emerald', '#46ddb0', '#d4ffe8', '#dcbd76'],
  ['platina', 'platinum', '#62d5df', '#e5feff', '#9baec8'],
  ['ouro', 'gold', '#e7b964', '#fff0ba', '#a76e38'],
  ['prata', 'silver', '#b5cadf', '#f4f8ff', '#6f90ae'],
  ['bronze', 'bronze', '#cb9765', '#ffe1b4', '#7d513c'],
  ['ferro', 'iron', '#8c9baf', '#dbe9f1', '#535e70']
];

export default function RankCrest({elo = 'Mestre II'}) {
  const uid = useId().replaceAll(':', '');
  const theme = themes.find(([name]) => elo.toLowerCase().includes(name)) || themes[3];
  const [, name, core, light, accent, image] = theme;
  const grad = uid + '-wing', ring = uid + '-ring';
  return <div className={'rank-crest animated-crest rank-theme-' + name} style={{'--rank-core': core, '--rank-light': light, '--rank-accent': accent}}>
    <div className="rank-aura" aria-hidden="true"/>
    <svg className="rank-wings" viewBox="0 0 360 240" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id={grad} x1="30" y1="20" x2="122" y2="208" gradientUnits="userSpaceOnUse"><stop stopColor={light}/><stop offset=".32" stopColor={core}/><stop offset=".7" stopColor={core} stopOpacity=".35"/><stop offset="1" stopColor={accent}/></linearGradient>
        <linearGradient id={ring} x1="100" y1="28" x2="250" y2="218" gradientUnits="userSpaceOnUse"><stop stopColor={accent}/><stop offset=".3" stopColor={light}/><stop offset=".72" stopColor={core}/><stop offset="1" stopColor={light}/></linearGradient>
      </defs>
      {[false, true].map(mirror => <g key={String(mirror)} transform={mirror ? 'translate(360 0) scale(-1 1)' : undefined} className="rank-wing">
        <path d="M103 207C46 209 8 184 15 135C27 105 47 67 49 22C75 47 87 82 75 121C58 158 62 188 103 207Z" fill={'url(#' + grad + ')'} fillOpacity=".42" stroke={'url(#' + grad + ')'} strokeWidth="2"/>
        <path d="M102 208C55 197 35 178 38 147C55 124 62 91 57 61C85 86 90 111 79 139C65 169 71 195 102 208Z" fill={'url(#' + grad + ')'} fillOpacity=".5" stroke={core} strokeWidth="1.5"/>
        <path d="M96 203C54 207 19 194 14 169C32 187 56 187 73 183" stroke={accent} strokeWidth="2"/>
        <path d="M52 36C60 77 56 104 34 145C29 169 41 187 70 198" stroke={light} strokeWidth="2" opacity=".9"/>
        <path d="M18 153L55 119M36 180L76 145M58 196L82 175" stroke={light} strokeWidth="1.25" opacity=".65"/>
      </g>)}
      <circle cx="180" cy="123" r="88" stroke={'url(#' + ring + ')'} strokeWidth="2" opacity=".65"/>
      <path d="M99 88A88 88 0 0 0 176 211M184 35A88 88 0 0 1 263 152" stroke={light} strokeWidth="3" className="crest-ring-light"/>
      <path d="M111 53L125 42L136 45L159 35L172 38L180 31L189 38L211 35L225 43L236 42L251 54" stroke={accent} strokeWidth="2"/>
      <path d="M172 214L180 224L189 214" fill={light}/>
    </svg>
    {image ? <img className="rank-core-image" src={'/img/' + image} alt={'Emblema ' + elo}/> : <Shield className="rank-generic-shield" aria-label={'Emblema ' + elo} strokeWidth={1.1}/>}
    <span className="rank-spark spark-one" aria-hidden="true"/><span className="rank-spark spark-two" aria-hidden="true"/><span className="rank-spark spark-three" aria-hidden="true"/>
  </div>;
}
