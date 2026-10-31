// Only labelled, unambiguous information is proposed. OCR is never evidence of an award.
export function parseMatchText(text) {
  const t=String(text).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
  const fields={},uncertain=[];
  const victories=/\b(vitoria|victory)\b/.test(t),defeats=/\b(derrota|defeat)\b/.test(t);
  if(victories!==defeats) fields.result=victories?'Vitória':'Derrota';
  else uncertain.push('result');
  const kdas=[...t.matchAll(/\b(\d{1,2})\s*\/\s*(\d{1,2})\s*\/\s*(\d{1,2})\b/g)];
  const distinct=[...new Set(kdas.map(m=>m.slice(1).join('/')))];
  if(distinct.length===1) [fields.k,fields.d,fields.a]=distinct[0].split('/').map(Number);else uncertain.push('k','d','a');
  const number=s=>Number(s.replace(/[.,\s]/g,''));
  const labels={scoreAfter:/(?:champion score|pontuacao (?:de campeao|da campea)|pontos (?:de campeao|da campea)|score final)\s*[:=]?\s*([\d.,]+)/g,gold:/(?:ouro|gold)\s*[:=]?\s*([\d.,]+)/g,performanceScore:/(?:desempenho|performance(?: score)?)\s*[:=]?\s*(\d+)/g,marksAfter:/(?:marcas apos|marcas atuais)\s*[:=]?\s*(\d+)/g,delta:/(?:variacao|pontos (?:ganhos|perdidos)|delta)\s*[:=]?\s*([+−-]?\s*[\d.,]+)/g};
  for(const [key,re] of Object.entries(labels)){
    const values=[...new Set([...t.matchAll(re)].map(m=>number(m[1].replace('−','-'))))];
    if(values.length===1&&Number.isFinite(values[0]))fields[key]=values[0];else if(values.length>1)uncertain.push(key);
  }
  if(fields.delta>0&&/pontos perdidos/.test(t))fields.delta=-fields.delta;
  const dates=[...new Set([...t.matchAll(/\b(\d{2})\/(\d{2})\/(\d{4})\b/g)].map(m=>`${m[3]}-${m[2]}-${m[1]}`))];
  if(dates.length===1)fields.date=dates[0];
  return {fields,uncertain,hasAwardText:/\b(mvp|svp|pentakill|quadrakill|triplekill|rank s|rank a)\b/.test(t)};
}
export function mergePrints(results) {
  const fields={},conflicts=new Set(),sources={};
  results.forEach(({fields:input},index)=>{for(const [key,value] of Object.entries(input)){
    if(key in fields&&fields[key]!==value)conflicts.add(key);else fields[key]=value;
    (sources[key] ||= []).push(index+1);
  }});
  for(const key of conflicts)delete fields[key];
  return {fields,conflicts:[...conflicts],sources};
}
