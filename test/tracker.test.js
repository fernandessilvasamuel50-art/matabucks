import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {composeTracker, validateEvent, readIssue, issueBody, matchId} from '../lib/tracker.js';
const baseline = JSON.parse(readFileSync(new URL('../data/baseline.json', import.meta.url)));
const match = {date: '2026-10-30', result: 'Vitória', k: 10, d: 2, a: 8, delta: 100, scoreAfter: 6456, mvp: true, pentakills: 2, rank: 'S', marksAfter: 12};
const event = (id, value = match, number = 1) => ({schema: 'matabuks/v1', kind: 'match', id, match: value, number});
test('one appended match updates all confirmed totals exactly once', () => {
  const data = composeTracker(baseline, [event('new-1'), event('new-1', match, 2), event('duplicate-with-other-id', match, 3)]);
  assert.equal(data.matches, 1007); assert.equal(data.wins, 508); assert.equal(data.losses, 499);
  assert.equal(data.score, 6456); assert.equal(data.pentakills, 14); assert.equal(data.mvps, 122); assert.equal(data.rankS, 70);
  assert.equal(data.history.length, baseline.history.length + 1); assert.equal(data.integration.duplicates.length, 2);
});
test('two independent concurrent records preserve both matches and all old IDs', () => {
  const other = {...match, result: 'Derrota', delta: -60, scoreAfter: 6396, mvp: false, svp: true, pentakills: 0, rank: 'A'};
  const data = composeTracker(baseline, [event('new-2', other, 2), event('new-1')]);
  assert.equal(data.score, 6396); assert.equal(data.matches, 1008); assert.equal(data.svpsConfirmedSinceBaseline, 1);
  for (const old of baseline.history) assert.ok(data.history.some(m => m.id === old.id));
});
test('new match correction recalculates achievements without another match', () => {
  const correction = {schema: 'matabuks/v1', kind: 'correction', id: 'fix-1', targetId: 'new-1', patch: {pentakills: 1, mvp: false}, number: 2};
  const data = composeTracker(baseline, [event('new-1'), correction, {...correction, number: 3}]);
  assert.equal(data.matches, 1007); assert.equal(data.pentakills, 13); assert.equal(data.mvps, 121);
});
test('confirmed checkpoint corrects marks without touching any game or score', () => {
  const data = composeTracker(baseline, [{schema: 'matabuks/v1', kind: 'checkpoint', id: 'confirmed-marks', updates: {marks: 11}, number: 1}]);
  assert.equal(data.marks, 11); assert.equal(data.matches, 1006); assert.equal(data.score, 6356); assert.deepEqual(data.history, baseline.history);
});
test('conflicting confirmed score remains authoritative and requests reconciliation', () => {
  const data = composeTracker(baseline, [event('gap-match', {...match, scoreAfter: 6600})]);
  assert.equal(data.score, 6600); assert.ok(data.integration.warnings.some(w => w.includes('Reconciliação'))); assert.equal(data.matches, 1007);
});
test('unknown awards and KDA stay unknown; no inferred medals', () => {
  const data = composeTracker(baseline, [event('unknown-fields', {date: '2026-10-30', result: 'Derrota'})]);
  assert.equal(data.mvps, baseline.mvps); assert.equal(data.pentakills, baseline.pentakills); assert.equal(data.history[0].k, undefined);
  assert.equal(data.score, baseline.score); assert.equal(data.marks, baseline.marks); assert.equal(data.lastDelta, null);
});
test('author authentication, input validation and pull-request exclusion', () => {
  const record = event('valid-record');
  assert.equal(readIssue({user: {login: 'stranger'}, body: issueBody(record)}), null);
  assert.equal(readIssue({user: {login: 'fernandessilvasamuel50-art'}, pull_request: {}, body: issueBody(record)}), null);
  assert.equal(readIssue({user: {login: 'fernandessilvasamuel50-art'}, body: issueBody(record), number: 1}).id, 'valid-record');
  assert.throws(() => validateEvent(event('invalid-kda', {...match, k: -1})));
  assert.throws(() => validateEvent(event('invalid-mvp', {...match, result: 'Derrota'})));
  assert.throws(() => validateEvent(event('invalid-date', {...match, date: '2026-02-31'})));
});
test('reversible integration probe never changes statistics', () => {
  for (const active of [true, false]) {
    const data = composeTracker(baseline, [{schema: 'matabuks/v1', kind: 'probe', id: 'probe-1', active, number: 1}]);
    for (const field of ['score', 'marks', 'matches', 'wins', 'losses', 'mvps', 'pentakills']) assert.equal(data[field], baseline[field]);
    assert.equal(data.integration.probeActive, active);
  }
});
test('stable match identifier for repeat submissions', () => assert.equal(matchId(match), matchId({...match})));
test('manual identity requires sufficient evidence and never collapses anonymous partial matches', () => {
  assert.throws(() => matchId({date: '2026-10-30', result: 'Vitória'}));
  assert.notEqual(matchId(match), matchId({...match, scoreAfter: 6556}));
});
