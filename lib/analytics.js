export const dayInManaus = (date = new Date()) => new Intl.DateTimeFormat('en-CA', {timeZone:'America/Manaus',year:'numeric',month:'2-digit',day:'2-digit'}).format(date);
export const formatDay = date => date?.split('-').reverse().join('/') || 'Data desconhecida';
export function summarize(matches) {
  const wins = matches.filter(m => m.result === 'Vitória').length;
  const complete = matches.filter(m => ['k','d','a'].every(k => Number.isFinite(m[k])));
  const totals = complete.reduce((s,m) => ({k:s.k+m.k,d:s.d+m.d,a:s.a+m.a}),{k:0,d:0,a:0});
  const points = matches.filter(m => Number.isFinite(m.delta));
  return {count:matches.length,wins,losses:matches.length-wins,winRate:matches.length?100*wins/matches.length:null,
    points:points.reduce((s,m)=>s+m.delta,0),pointsKnown:points.length,kda:complete.length?(totals.k+totals.a)/Math.max(1,totals.d):null,kdaKnown:complete.length,
    mvps:matches.filter(m=>m.mvp===true).length,svps:matches.filter(m=>m.svp===true).length,pentas:matches.reduce((s,m)=>s+(m.pentakills||0),0),
    gold:matches.filter(m=>Number.isFinite(m.gold)).reduce((s,m)=>s+m.gold,0),goldKnown:matches.filter(m=>Number.isFinite(m.gold)).length};
}
export function filterMatches(history, {result='',award='',from='',to=''}={}) {
  return history.filter(m=>(!result||m.result===result)&&(!from||m.date>=from)&&(!to||m.date<=to)&&(!award||(award==='S'||award==='A'?m.rank===award:award==='multikill'?['triplekills','quadrakills','pentakills'].some(k=>m[k]>0):m[award]===true)));
}
export function scoreSeries(history, metric='scoreAfter', days=0, now=dayInManaus()) {
  const since = days?new Date(new Date(now+'T12:00:00Z').getTime()-(days-1)*86400000).toISOString().slice(0,10):'';
  return [...history].reverse().filter(m=>(!since||m.date>=since)&&Number.isFinite(m[metric])).map(m=>({id:m.id,date:m.date,value:m[metric],match:m}));
}
export function recentPace(history, cutoff, current) {
  const sample=history.slice(0,20),known=sample.filter(m=>Number.isFinite(m.delta));
  const mean=known.length?known.reduce((s,m)=>s+m.delta,0)/known.length:null;
  return {sample:known.length,mean,games:known.length>=5&&mean>0?Math.ceil(Math.max(0,cutoff-current)/mean):null};
}
export function confirmedRecords(history) {
  const most = key => history.filter(m=>Number.isFinite(m[key])).reduce((best,m)=>!best||m[key]>best[key]?m:best,null);
  const items=[['Mais abates',most('k'),'k'],['Mais ouro',most('gold'),'gold'],['Mais pontos em uma partida',history.filter(m=>m.delta>0).reduce((best,m)=>!best||m.delta>best.delta?m:best,null),'delta'],['Mais pentas em uma partida',history.filter(m=>m.pentakills>0).reduce((best,m)=>!best||m.pentakills>best.pentakills?m:best,null),'pentakills']];
  let streak=0,best=0,end=null;
  for(const m of [...history].reverse()){streak=m.result==='Vitória'?streak+1:0;if(streak>best){best=streak;end=m;}}
  return [...items.filter(([,m])=>m).map(([label,m,key])=>({label,value:m[key],match:m})),...(best?[{label:'Sequência de vitórias registrada',value:best,match:end}]:[])];
}
