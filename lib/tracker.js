export const REPOSITORY = 'fernandessilvasamuel50-art/matabucks';
export const OWNER = 'fernandessilvasamuel50-art';
export const SCHEMA = 'matabuks/v1';
export const MARKER = '<!-- matabuks:tracker:v1 -->';
const own = (value, key) => Object.prototype.hasOwnProperty.call(value, key);
const integer = (value, min = 0, max = 1000000) => Number.isSafeInteger(value) && value >= min && value <= max;
const optionalNumbers = ['gold', 'performanceScore', 'triplekills', 'quadrakills', 'pentakills', 'marksAfter'];
const optionalBooleans = ['mvp', 'svp', 'legendaryS'];

export function validateMatch(input, partial = false) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw Error('Partida inválida.');
  const match = {};
  if (!partial || own(input, 'date')) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(input.date || '') || new Date(input.date + 'T12:00:00Z').toISOString().slice(0, 10) !== input.date) throw Error('Informe uma data válida.');
    match.date = input.date;
  }
  if (!partial || own(input, 'result')) {
    if (!['Vitória', 'Derrota'].includes(input.result)) throw Error('Informe vitória ou derrota.');
    match.result = input.result;
  }
  for (const key of ['k', 'd', 'a']) if (own(input, key) && input[key] != null) {
    if (!integer(input[key], 0, 300)) throw Error('KDA deve conter números inteiros não negativos.');
    match[key] = input[key];
  }
  if (!partial && ['k', 'd', 'a'].some(key => own(match, key)) && !['k', 'd', 'a'].every(key => own(match, key))) throw Error('Preencha todo o KDA ou deixe os três campos vazios.');
  if (own(input, 'delta') && input.delta != null) {
    if (!integer(input.delta, -10000, 10000)) throw Error('Variação de pontos inválida.');
    match.delta = input.delta;
  }
  if (own(input, 'scoreAfter') && input.scoreAfter != null) {
    if (!integer(input.scoreAfter, 0, 100000)) throw Error('Champion Score inválido.');
    match.scoreAfter = input.scoreAfter;
  }
  for (const key of optionalNumbers) if (own(input, key) && input[key] != null) {
    if (!integer(input[key], 0, key === 'gold' ? 1000000 : key === 'performanceScore' ? 100000 : 1000)) throw Error('Valor inválido em ' + key + '.');
    match[key] = input[key];
  }
  for (const key of optionalBooleans) if (own(input, key)) {
    if (typeof input[key] !== 'boolean') throw Error('Confirmação inválida em ' + key + '.');
    match[key] = input[key];
  }
  if (own(input, 'rank') && input.rank != null) {
    if (!['S', 'A'].includes(input.rank)) throw Error('Medalha de desempenho inválida.');
    match.rank = input.rank;
  }
  for (const key of ['teamScore', 'nickname', 'champion', 'mode']) if (own(input, key) && input[key] != null) {
    if (typeof input[key] !== 'string' || input[key].length > 80) throw Error('Texto inválido em ' + key + '.');
    match[key] = input[key].trim();
  }
  if (match.teamScore && !/^\d{1,3}[-×x:]\d{1,3}$/.test(match.teamScore.replaceAll(' ', ''))) throw Error('Use o placar no formato 30-33.');
  if ((match.mvp && match.result === 'Derrota') || (match.svp && match.result === 'Vitória') || (match.mvp && match.svp)) throw Error('MVP pertence à vitória e SVP à derrota.');
  return match;
}

export function validateEvent(input) {
  if (!input || input.schema !== SCHEMA || !/^[\w.:/-]{3,180}$/.test(input.id || '')) throw Error('Identificador do registro inválido.');
  if (input.kind === 'match') return {schema: SCHEMA, kind: 'match', id: input.id, match: validateMatch(input.match)};
  if (input.kind === 'correction') {
    if (typeof input.targetId !== 'string' || input.targetId.length > 180) throw Error('Partida da correção inválida.');
    const patch = validateMatch(input.patch, true);
    if (!Object.keys(patch).length) throw Error('Correção vazia.');
    return {schema: SCHEMA, kind: 'correction', id: input.id, targetId: input.targetId, patch};
  }
  if (input.kind === 'checkpoint') {
    const updates = {};
    for (const key of ['marks', 'score', 'top200Cutoff', 'laneLevel']) if (own(input.updates || {}, key)) {
      if (!integer(input.updates[key], 0, 100000)) throw Error('Checkpoint inválido.');
      updates[key] = input.updates[key];
    }
    if (own(input.updates || {}, 'elo')) {
      if (typeof input.updates.elo !== 'string' || input.updates.elo.length > 40) throw Error('Elo inválido.');
      updates.elo = input.updates.elo;
    }
    if (!Object.keys(updates).length) throw Error('Checkpoint vazio.');
    return {schema: SCHEMA, kind: 'checkpoint', id: input.id, updates};
  }
  if (input.kind === 'probe' && typeof input.active === 'boolean') return {schema: SCHEMA, kind: 'probe', id: input.id, active: input.active};
  throw Error('Tipo de registro inválido.');
}

export function issueBody(event) {
  return MARKER + '\n\n```json\n' + JSON.stringify(validateEvent(event), null, 2) + '\n```\n\nRegistro do Matabuks — Samirismo. Sem build ou deploy para registrar partidas.';
}

export function readIssue(issue) {
  if (issue.pull_request || issue.user?.login?.toLowerCase() !== OWNER || !issue.body?.includes(MARKER)) return null;
  try {
    const json = issue.body.match(/```json\s*([\s\S]*?)\s*```/);
    if (!json || issue.body.length > 50000) return null;
    return {...validateEvent(JSON.parse(json[1])), number: issue.number, url: issue.html_url, updatedAt: issue.updated_at};
  } catch { return null; }
}

export function matchFingerprint(match) {
  const keys = ['date', 'result', 'k', 'd', 'a', 'delta', 'scoreAfter'];
  // Without a confirmed final score/KDA there is insufficient evidence to collapse two distinct matches.
  if (!['k', 'd', 'a', 'scoreAfter'].every(key => Number.isFinite(match[key]))) return null;
  return keys.map(key => match[key] ?? '').join('|');
}

export function matchId(match) {
  const fingerprint = matchFingerprint(match);
  if (!fingerprint) throw Error('Confirme o KDA e a pontuação final para evitar duplicidades. Dados parciais podem ser enviados pelo ChatGPT.');
  return 'match:' + fingerprint.replace('Vitória', 'V').replace('Derrota', 'D').replaceAll('|', ':');
}

export function composeTracker(baseline, records) {
  const data = structuredClone(baseline);
  const history = new Map(data.history.map(match => [match.id, match]));
  const baselineIds = new Set(history.keys());
  const fingerprints = new Map(data.history.map(match => [matchFingerprint(match), match.id]).filter(([key]) => key));
  const accepted = new Set(), newIds = [], timeline = [], warnings = [], duplicates = [];
  let activeProbe = false, lastIssue = 0;
  for (const raw of [...records].sort((a, b) => a.number - b.number)) {
    let event;
    try { event = {...validateEvent(raw), number: raw.number}; } catch { warnings.push('Registro #' + raw.number + ' inválido.'); continue; }
    lastIssue = Math.max(lastIssue, event.number || 0);
    if (accepted.has(event.id)) { duplicates.push(event.id); continue; }
    accepted.add(event.id);
    if (event.kind === 'probe') { activeProbe = event.active; continue; }
    if (event.kind === 'checkpoint') { timeline.push(event); continue; }
    if (event.kind === 'correction') {
      if (!history.has(event.targetId)) { warnings.push('Correção sem partida: ' + event.targetId); continue; }
      const previous = history.get(event.targetId);
      try { history.set(event.targetId, {...previous, ...validateMatch({...previous, ...event.patch})}); }
      catch { warnings.push('Correção incompatível: ' + event.targetId); }
      if (baselineIds.has(event.targetId) && (own(event.patch, 'delta') || own(event.patch, 'scoreAfter'))) warnings.push('Pontos retroativos alterados; confirme o checkpoint atual.');
      continue;
    }
    const fingerprint = matchFingerprint(event.match);
    if (history.has(event.id) || (fingerprint && fingerprints.has(fingerprint))) { duplicates.push(event.id); continue; }
    history.set(event.id, {...event.match, id: event.id, sourceIssue: event.number});
    if (fingerprint) fingerprints.set(fingerprint, event.id);
    newIds.push(event.id);
    timeline.push(event);
  }
  const totals = {matches: 0, wins: 0, losses: 0, mvps: 0, rankS: 0, rankA: 0, legendaryS: 0, pentakills: 0, triplekillsConfirmedSinceBaseline: 0, quadrakillsConfirmedSinceBaseline: 0, svpsConfirmedSinceBaseline: 0};
  const values = match => ({matches: 1, wins: +(match.result === 'Vitória'), losses: +(match.result === 'Derrota'), mvps: +(match.mvp === true), rankS: +(match.rank === 'S'), rankA: +(match.rank === 'A'), legendaryS: +(match.legendaryS === true), pentakills: match.pentakills || 0, triplekillsConfirmedSinceBaseline: match.triplekills || 0, quadrakillsConfirmedSinceBaseline: match.quadrakills || 0, svpsConfirmedSinceBaseline: +(match.svp === true)});
  for (const id of newIds) {
    const additions = values(history.get(id));
    for (const key of Object.keys(totals)) totals[key] += additions[key];
  }
  for (const original of baseline.history) {
    const revised = history.get(original.id), before = values(original), after = values(revised);
    for (const key of ['wins', 'losses']) totals[key] += after[key] - before[key];
    const fields = {mvps: 'mvp', rankS: 'rank', rankA: 'rank', legendaryS: 'legendaryS', pentakills: 'pentakills', triplekillsConfirmedSinceBaseline: 'triplekills', quadrakillsConfirmedSinceBaseline: 'quadrakills', svpsConfirmedSinceBaseline: 'svp'};
    for (const [key, field] of Object.entries(fields)) if (after[key] !== before[key]) {
      if (own(original, field)) totals[key] += after[key] - before[key];
      else warnings.push('Conquista retroativa em ' + original.id + ': total histórico requer confirmação.');
    }
  }
  for (const [key, delta] of Object.entries(totals)) data[key] = (baseline[key] || 0) + delta;
  for (const event of timeline) {
    if (event.kind === 'checkpoint') { Object.assign(data, event.updates); continue; }
    const match = history.get(event.id), previousScore = data.score;
    if (own(match, 'scoreAfter')) {
      if (own(match, 'delta') && previousScore + match.delta !== match.scoreAfter) warnings.push('Reconciliação de pontos: ' + event.id + ' (esperado ' + (previousScore + match.delta) + ', confirmado ' + match.scoreAfter + ').');
      data.score = match.scoreAfter;
    } else if (own(match, 'delta')) data.score += match.delta;
    data.previousScore = previousScore;
    data.lastDelta = match.delta ?? null;
    if (own(match, 'marksAfter')) data.marks = match.marksAfter;
    data.updatedAt = match.date;
  }
  data.peakScore = Math.max(baseline.peakScore || 0, data.score, ...newIds.map(id => history.get(id).scoreAfter || 0));
  data.history = [...newIds].reverse().map(id => history.get(id)).concat(baseline.history.map(match => history.get(match.id)));
  data.winRatePercent = data.matches ? Number((100 * data.wins / data.matches).toFixed(1)) : 0;
  data.rankDivision = data.elo;
  if (/^Mestre III$/i.test(data.elo)) data.markThreshold = 10;
  else if (/^Mestre II$/i.test(data.elo)) data.markThreshold = 20;
  else if (/^Mestre I$/i.test(data.elo)) data.markThreshold = 30;
  data.statisticsEstimated = true;
  data.version = 4;
  data.integration = {source: 'github-issues', repository: REPOSITORY, lastIssue, records: accepted.size, duplicates, warnings: [...new Set(warnings)], probeActive: activeProbe};
  return data;
}
