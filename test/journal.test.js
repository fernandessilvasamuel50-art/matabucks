import test from 'node:test';
import assert from 'node:assert/strict';
import {fetchJournal} from '../lib/journal.js';
import {issueBody} from '../lib/tracker.js';
const now = 1793469632000;
const issue = (number, active = true) => ({number, user: {login: 'fernandessilvasamuel50-art'}, body: issueBody({schema: 'matabuks/v1', kind: 'probe', id: 'probe-' + number, active})});
const response = (items, next = false) => new Response(JSON.stringify(items), {headers: next ? {link: '<https://api.github.com/next>; rel="next"'} : {}});
test('full read follows pagination and includes closed records', async () => {
  let calls = 0;
  const value = await fetchJournal(undefined, {now, fetcher: async url => {assert.ok(url.includes('state=all')); return ++calls === 1 ? response([issue(1)], true) : response([{...issue(2, false), state: 'closed'}]);}});
  assert.equal(calls, 2); assert.deepEqual(value.records.map(event => event.number), [1, 2]);
});
test('incremental update preserves older records and applies edits without a full-history download', async () => {
  const saved = await fetchJournal(undefined, {now, fetcher: async () => response([issue(1), issue(2)])});
  const value = await fetchJournal(saved, {now: now + 180000, fetcher: async url => {assert.ok(url.includes('&since='));return response([issue(2, false), issue(3)]);}});
  assert.equal(value.records.length, 3); assert.equal(value.records.find(r => r.number === 1).active, true); assert.equal(value.records.find(r => r.number === 2).active, false);
});
test('periodic full reconciliation drops records no longer present', async () => {
  const saved = await fetchJournal(undefined, {now, fetcher: async () => response([issue(1), issue(2)])});
  const value = await fetchJournal(saved, {now: now + 21600001, fetcher: async url => {assert.ok(!url.includes('&since='));return response([issue(1)]);}});
  assert.deepEqual(value.records.map(r => r.number), [1]);
});
test('partial pagination failure never returns a truncated successful history', async () => {
  let calls = 0;
  await assert.rejects(fetchJournal(undefined, {now, fetcher: async () => ++calls === 1 ? response([issue(1)], true) : new Response('{}', {status: 503})}), /github_read_503/);
});
