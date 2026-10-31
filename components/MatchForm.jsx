import React, {useCallback, useMemo, useState} from 'react';
import {Plus, Check, ExternalLink, Copy, AlertCircle} from 'lucide-react';
import Modal from './Modal.jsx';
import {validateMatch, issueBody, matchId, REPOSITORY, composeTracker} from '../lib/tracker.js';

function today() { return new Intl.DateTimeFormat('en-CA', {timeZone: 'America/Manaus', year: 'numeric', month: '2-digit', day: '2-digit'}).format(new Date()); }
export default function MatchForm({data}) {
  const [open, setOpen] = useState(false), [copied, setCopied] = useState(false), [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({date: today(), result: '', k: '', d: '', a: '', delta: '', scoreAfter: '', gold: '', performanceScore: '', teamScore: '', marksAfter: '', mvp: false, svp: false, rank: '', triplekills: '', quadrakills: '', pentakills: ''});
  const close = useCallback(() => setOpen(false), []);
  const set = (key, value) => {setCopied(false);setSubmitted(false);setForm(current => ({...current, [key]: value, ...(key === 'result' ? {mvp: false, svp: false} : {})}));};
  const prepared = useMemo(() => {
    try {
      const match = {date: form.date, result: form.result, champion: 'Samira', mode: 'Ranqueada'};
      for (const key of ['k', 'd', 'a', 'delta', 'scoreAfter', 'gold', 'performanceScore', 'marksAfter', 'triplekills', 'quadrakills', 'pentakills']) if (form[key] !== '') match[key] = Number(form[key]);
      for (const key of ['teamScore', 'rank']) if (form[key]) match[key] = form[key];
      for (const key of ['mvp', 'svp']) if (form[key]) match[key] = true;
      const validated = validateMatch(match);
      const event = {schema: 'matabuks/v1', kind: 'match', id: matchId(validated), match: validated};
      const preview = composeTracker(data, [{...event, number: 1}]);
      const duplicate = preview.history.length === data.history.length;
      const body = issueBody(event);
      const url = 'https://github.com/' + REPOSITORY + '/issues/new?' + new URLSearchParams({title: '[tracker] ' + match.result + ' — Samira — ' + match.date, body});
      return {event, preview, duplicate, body, url};
    } catch (error) { return {error: error.message}; }
  }, [form, data]);
  async function copy() { try {await navigator.clipboard.writeText(prepared.body);setCopied(true);} catch {setCopied(false);} }
  function publish(event) {if (prepared.error || prepared.duplicate) {event.preventDefault();return;} setSubmitted(true);}
  return <>
    <button className="primary-action" onClick={() => setOpen(true)}><Plus size={17}/> Registrar partida</button>
    {open && <Modal title="Registrar partida de Samira" onClose={close} className="match-entry-modal">
      <div className="entry-heading"><span className="eyebrow">SUA PRÓXIMA HISTÓRIA</span><h2>Registrar partida</h2><p>Informe somente o que você confirmou no resultado.</p></div>
      <form onSubmit={event => event.preventDefault()}>
        <div className="entry-grid">
          <label>Data do registro<input type="date" value={form.date} onChange={e => set('date', e.target.value)} required/></label>
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
        <p className="publish-explanation">Confirme a publicação no GitHub com sua conta fernandessilvasamuel50-art. Depois, o painel sincroniza automaticamente em alguns minutos. Nenhuma senha é solicitada aqui.</p>
        <div className="entry-actions"><button type="button" className="secondary-action" disabled={!!prepared.error || prepared.duplicate} onClick={copy}><Copy size={15}/>{copied ? 'Copiado' : 'Copiar para o ChatGPT'}</button><a className={'primary-action' + (prepared.error || prepared.duplicate ? ' disabled-action' : '')} href={prepared.url || undefined} target="_blank" rel="noopener noreferrer" onClick={publish} aria-disabled={!!prepared.error || prepared.duplicate}>Confirmar no GitHub <ExternalLink size={15}/></a></div>
        {submitted && <p className="entry-success" role="status">Conclua a publicação na aba do GitHub. A partida só é salva depois dessa confirmação.</p>}
      </form>
    </Modal>}
  </>;
}
