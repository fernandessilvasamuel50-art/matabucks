import React from 'react';
export function MedalIcon({type, label, className = ''}) {
  return <img className={'award-icon ' + className} src={'/img/medals/' + type + '.webp'} alt={label} title={label} width="40" height="40" loading="lazy"/>;
}
export default function Medals({match, compact = false}) {
  const medals = [];
  if (match.mvp === true) medals.push(['mvp', 'MVP']);
  if (match.svp === true) medals.push(['svp', 'SVP']);
  if (match.rank === 'S' || match.rank === 'A') medals.push(['rank-' + match.rank.toLowerCase(), 'Rank ' + match.rank]);
  if (match.triplekills > 0) medals.push(['triple', match.triplekills + ' triplekill(s)']);
  if (match.quadrakills > 0) medals.push(['quadra', match.quadrakills + ' quadrakill(s)']);
  if (match.pentakills > 0) medals.push(['penta', match.pentakills + ' pentakill(s)']);
  if (!medals.length) return null;
  return <div className={'match-medals' + (compact ? ' compact-medals' : '')}>{medals.map(([type, label]) => <MedalIcon key={type} type={type} label={label}/>)}</div>;
}
