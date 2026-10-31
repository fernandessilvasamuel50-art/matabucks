import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {Plus, Check, AlertCircle} from 'lucide-react';
import Modal from './Modal.jsx';
import PrintImport from './PrintImport.jsx';
import SaveEvent from './SaveEvent.jsx';
import {validateMatch, matchId, composeTracker} from '../lib/tracker.js';

function today() { return new Intl.DateTimeFormat('en-CA', {timeZone: 'America/Manaus', year: 'numeric', month: '2-digit', day: '2-digit'}).format(new Date()); }
export default function MatchForm({data,initialMatch,onClose}) {
  const [open, setOpen] = useState(false);
  const empty={date:today(),result:'',k:'',d:'',a:'',delta:'',scoreAfter:'',gold:'',performanceScore:'',teamScore:'',marksAfter:'',mvp:false,svp:false,rank:'',triplekills:'',quadrakills:'',pentakills:''};
  const [form,setForm]=useState(()=>{let draft={};if(!initialMatch)try{const saved=JSON.parse(sessionStorage.getItem('matabuks-draft'));if(saved&&typeof saved==='object')draft=Object.fromEntries(Object.keys(empty).filter(k=>typeof saved[k]===typeof empty[k]).map(k=>[k,saved[k]]));}catch{}return {...empty,...draft,...Object.fromEntries(Object.keys(empty).filter(k=>initialMatch?.[k]!=null).map(k=>[k,typeof empty[k]==='boolean'?initialMatch[k]:String(initialMatch[k])]))};});
  useEffect(()=>{if(!initialMatch)try{sessionStorage.setItem('matabuks-draft',JSON.stringify(form));}catch{}},[form,initialMatch]);
  const [correctionId]=useState(()=> 'correction:'+crypto.randomUUID());
  const [imported,setImported]=useState(false),[reviewed,setReviewed]=useState(false);
  const close = useCallback(() => {setOpen(false);onClose?.();}, [onClose]);
  const set = (key, value) => {setReviewed(false);setForm(current => ({...current, [key]: value, ...(key === 'result' ? {mvp: false, svp: false} : {})}));};
  const extracted=fields=>{setImported(true);setReviewed(false);setForm({...empty,date:'',...Object.fromEntries(Object.entries(fields).map(([k,v])=>[k,String(v)]))});};
  const prepared = useMemo(() => {
    try {
      const match = {date: form.date, result: form.result,...(initialMatch?Object.fromEntries(['champion','mode'].filter(k=>initialMatch[k]).map(k=>[k,initialMatch[k]])):{champion:'Samira',mode:'Ranqueada'})};
      for (const key of ['k', 'd', 'a', 'delta', 'scoreAfter', 'gold', 'performanceScore', 'marksAfter', 'triplekills', 'quadrakills', 'pentakills']) if (form[key] !== '') match[key] = Number(form[key]);
      for (const key of ['teamScore', 'rank']) if (form[key]) match[key] = form[key];
      for (const key of ['mvp', 'svp']) if (form[key]||initialMatch?.[key]===true) match[key] = form[key];
      const validated = validateMatch(match);
      const patch=initialMatch?Object.fromEntries(Object.entries(validated).filter(([k,v])=>v!==initialMatch[k])):null;
      const unset=initialMatch?Object.keys(form).filter(k=>!['date','result','mvp','svp'].includes(k)&&form[k]===''&&initialMatch[k]!=null):[];
      if(initialMatch&&!Object.keys(patch).length&&!unset.length)throw Error('Altere o campo que precisa ser corrigido.');
      const event = initialMatch?{schema:'matabuks/v1',kind:'correction',id:correctionId,targetId:initialMatch.id,patch,unset,expected:validateMatch(initialMatch)}:{schema: 'matabuks/v1', kind: 'match', id: matchId(validated), match: validated};
      const preview = composeTracker(data, [{...event, number: 1}]);
      const duplicate = !initialMatch&&preview.history.length === data.history.length;
      return {event, preview, duplicate};
    } catch (error) { return {error: error.message}; }
  }, [form, data,initialMatch,correctionId]);
  return <>
    {!initialMatch&&<button className="primary-action" onClick={() => setOpen(true)}><Plus size={17}/> Registrar partida</button>}
    {(open||initialMatch) && <Modal title={initialMatch?'Corrigir partida':'Registrar partida de Samira'} onClose={close} className="match-entry-modal">
      <div className="entry-heading"><span className="eyebrow">SUA PRÓXIMA HISTÓRIA</span><h2>{initialMatch?'Corrigir partida':'Registrar partida'}</h2><p>Informe somente o que você confirmou no resultado.</p></div>
      {!initialMatch&&<PrintImport onExtract={extracted}/>}
      <form onSubmit={event => event.preventDefault()}>
        <div className="entry-grid">
          <label>Data do registro<input type="date" value={form.date} onInput={e => set('date', e.target.value)} onChange={e => set('date', e.target.value)} required/></label>
          <label>Resultado<select value={form.result} onChange={e => set('result', e.target.value)} required><option value="">Selecione</option><option>Vitória</option><option>Derrota</option></select></label>
          <fieldset className="kda-inputs"><legend>KDA</legend>{[['k', 'Abates'], ['d', 'Mortes'], ['a', 'Assistências']].map(([key, label]) => <label key={key}><span>{label}</span><input type="number" inputMode="numeric" min="0" max="300" value={form[key]} onChange={e => set(key, e.target.value)} aria-label={label} placeholder="—"/></label>)}</fieldset>
          <label>Variação de pontos<input type="number" inputMode="text" value={form.delta} onChange={e => set('delta', e.target.value)} placeholder="Ex.: -96 ou 100"/></label>
          <label>Champion Score final<input type="number" inputMode="numeric" min="0" value={form.scoreAfter} onChange={e => set('scoreAfter', e.target.value)} placeholder="Ex.: 6356"/></label>
          <label>Marcas após a partida<input type="number" inputMode="numeric" min="0" value={form.marksAfter} onChange={e => set('marksAfter', e.target.value)} placeholder="Se confirmado no resultado"/></label>
          <label>Medalha de desempenho<select value={form.rank} onChange={e => set('rank', e.target.value)}><option value="">Não informada</option><option value="S">Rank S</option><option value="A">Rank A</option></select></label>
        </div>
        <fieldset className="confirmed-awards"><legend>Conquistas confirmadas</legend><label><input type="checkbox" checked={form.mvp} disabled={form.result !== 'Vitória'} onChange={e => set('mvp', e.target.checked)}/><img src="/img/medals/mvp.webp" alt=""/> MVP</label><label><input type="checkbox" checked={form.svp} disabled={form.result !== 'Derrota'} onChange={e => set('svp', e.target.checked)}/><img src="/img/medals/svp.webp" alt=""/> SVP</label></fieldset>
        <div className="multikill-inputs">{[['triplekills', 'Triplekills', 'triple'], ['quadrakills', 'Quadrakills', 'quadra'], ['pentakills', 'Pentakills', 'penta']].map(([key, label, image]) => <label key={key}><img src={'/img/medals/' + image + '.webp'} alt=""/><span>{label}</span><input type="number" inputMode="numeric" min="0" max="1000" value={form[key]} onChange={e => set(key, e.target.value)} placeholder="—" aria-label={label}/></label>)}</div>
        <details className="entry-details"><summary>Mais informações da partida</summary><div className="entry-grid"><label>Ouro<input type="number" inputMode="numeric" min="0" value={form.gold} onChange={e => set('gold', e.target.value)}/></label><label>Desempenho<input type="number" inputMode="numeric" min="0" value={form.performanceScore} onChange={e => set('performanceScore', e.target.value)}/></label><label>Placar das equipes<input value={form.teamScore} onChange={e => set('teamScore', e.target.value)} placeholder="30-33"/></label></div></details>
        {prepared.error ? <p className="entry-hint">{prepared.error}</p> : prepared.duplicate ? <p className="entry-error" role="status"><Check size={16}/> Esta partida já está registrada. Nenhuma alteração é necessária.</p> : <div className="entry-preview"><span>DEPOIS DESTA PARTIDA</span><strong>{prepared.preview.score.toLocaleString('pt-BR')} <small>pontos</small></strong><p>{prepared.preview.matches.toLocaleString('pt-BR')} partidas · {prepared.preview.winRatePercent.toFixed(1).replace('.', ',')}% de vitórias <small>(estimativa)</small></p>{prepared.preview.integration.warnings.map(warning => <p className="entry-warning" key={warning}><AlertCircle size={15}/>{warning}</p>)}</div>}
        {imported&&<label className="review-confirmation"><input type="checkbox" checked={reviewed} onChange={e=>setReviewed(e.target.checked)}/>Conferi os campos com os prints, inclusive a data e as conquistas.</label>}
        <SaveEvent event={prepared.event} data={data} disabled={!!prepared.error||prepared.duplicate||(imported&&!reviewed)}/>
      </form>
    </Modal>}
  </>;
}
