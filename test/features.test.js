import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {encode} from '@auth/core/jwt';
import {composeTracker,validateEvent,matchRevision} from '../lib/tracker.js';
import {summarize,filterMatches,scoreSeries,recentPace} from '../lib/analytics.js';
import {parseMatchText,mergePrints} from '../lib/ocr.js';
import {createBackup,inspectBackup,historyCSV} from '../lib/backup.js';
import {ownerSession,OWNER_ID,sameOrigin} from '../lib/auth.js';
import {assessWrite} from '../api/events.js';
import eventsHandler from '../api/events.js';
const baseline=JSON.parse(readFileSync(new URL('../data/baseline.json',import.meta.url)));
const match={date:'2026-10-31',result:'Vitória',k:10,d:2,a:8,delta:100,scoreAfter:6456,mvp:true};
const event=(id,number=1)=>({schema:'matabuks/v1',kind:'match',id,match,number});
const revert=(id,targetEventId,number)=>({schema:'matabuks/v1',kind:'revert',id,targetEventId,number});
test('revert removes only its target; later matches and confirmed checkpoints survive',()=>{
  const records=[event('game-one'),{...event('game-two',2),match:{...match,k:2,delta:-50,scoreAfter:6406,mvp:false}}, {schema:'matabuks/v1',kind:'checkpoint',id:'final-check',updates:{score:6406,marks:8},number:3}];
  const undone=composeTracker(baseline,[...records,revert('undo-first','game-one',4)]);
  assert.equal(undone.history.length,baseline.history.length+1);assert.equal(undone.score,6406);assert.equal(undone.marks,8);assert.equal(undone.mvps,baseline.mvps);
  const restored=composeTracker(baseline,[...records,revert('undo-first','game-one',4),revert('undo-the-undo','undo-first',5)]);
  assert.equal(restored.history.length,baseline.history.length+2);assert.equal(restored.mvps,baseline.mvps+1);
});
test('conflicting concurrent corrections cannot silently overwrite an earlier correction',()=>{
  const fix={schema:'matabuks/v1',kind:'correction',id:'fix-first',targetId:'game-one',patch:{k:11},expected:match,number:2};
  const data=composeTracker(baseline,[event('game-one'),fix,{...fix,id:'fix-second',patch:{k:12},number:3}]);
  assert.equal(data.history[0].k,11);assert.ok(data.integration.warnings.some(w=>w.includes('concorrente')));
});
test('removing an incorrect award preserves unknown rather than recording false',()=>{
  const data=composeTracker(baseline,[event('game-one'),{schema:'matabuks/v1',kind:'correction',id:'fix-award',targetId:'game-one',patch:{},unset:['mvp'],expected:match,number:2}]);
  assert.equal(data.history[0].mvp,undefined);assert.equal(data.mvps,baseline.mvps);
  assert.throws(()=>validateEvent({schema:'matabuks/v1',kind:'correction',id:'unsafe-remove',targetId:'game-one',patch:{},unset:['result']}));
});
test('analytics use only available fields and keep estimates separate',()=>{
  const history=[{id:'a',...match},{id:'b',date:'2026-10-31',result:'Derrota'}];
  const s=summarize(history);assert.equal(s.count,2);assert.equal(s.winRate,50);assert.equal(s.kdaKnown,1);assert.equal(s.kda,9);assert.equal(s.pointsKnown,1);
  assert.equal(filterMatches(history,{award:'mvp'}).length,1);assert.equal(filterMatches(history,{from:'2026-11-01'}).length,0);
  assert.equal(scoreSeries(history,'marksAfter',7,'2026-10-31').length,0);assert.equal(recentPace(history,8956,6356).games,null);
});
test('OCR never assigns team-table KDA or unconfirmed medals',()=>{
  const result=parseMatchText('DERROTA\n5/6/3\n30/10/2026\nChampion Score 6.356\nVariação −96\nOuro 14.548\nMVP');
  assert.equal(result.fields.k,5);assert.equal(result.fields.delta,-96);assert.equal(result.fields.scoreAfter,6356);assert.equal(result.fields.gold,14548);assert.equal(result.fields.mvp,undefined);
  const table=parseMatchText('Vitória 5/6/19\n6/4/17\n13/8/11');assert.equal(table.fields.k,undefined);
  const merged=mergePrints([result,{fields:{scoreAfter:6355}}]);assert.equal(merged.fields.scoreAfter,undefined);assert.ok(merged.conflicts.includes('scoreAfter'));
});
test('backup round trip verifies checksum; corruption and incompatible files are rejected',async()=>{
  const data=composeTracker(baseline,[event('game-one')]),backup=await createBackup(data);
  const checked=await inspectBackup(JSON.stringify(backup),baseline);assert.equal(checked.missing.length,1);
  backup.events[0].match.k=99;await assert.rejects(inspectBackup(JSON.stringify(backup),baseline));
  assert.match(historyCSV([{id:'=cmd()',delta:-96}]),/'=cmd/);
});
test('direct writer refuses stale revisions and treats retries as already saved',()=>{
  const records=[event('game-one')];assert.equal(assessWrite(event('game-one'),records).duplicate,true);
  assert.throws(()=>assessWrite({schema:'matabuks/v1',kind:'correction',id:'stale-fix',targetId:'game-one',patch:{k:8},expected:{...match,k:9}},records));
  assert.equal(matchRevision({...match,id:'one',sourceIssue:1}),matchRevision(match));
  const {delta,...withoutDelta}=match;
  assert.equal(assessWrite({...event('retry-without-delta'),match:withoutDelta},records).duplicate,true);
});
test('owner sessions reject missing, tampered and unauthorized cookies; public session never reveals provider token',async()=>{
  const saved={...process.env};process.env.AUTH_SECRET='test-only-secret-never-deployed-0123456789';process.env.AUTH_GITHUB_ID='test-id';process.env.AUTH_GITHUB_SECRET='test-secret';
  try{
    const name='__Secure-authjs.session-token';
    const encoded=await encode({secret:process.env.AUTH_SECRET,salt:name,token:{ownerId:OWNER_ID,login:'fernandessilvasamuel50-art',accessToken:'test-only'},maxAge:60});
    assert.ok(await ownerSession({headers:{cookie:name+'='+encoded}}));
    assert.equal(await ownerSession({headers:{authorization:'Bearer '+encoded}}),null);
    assert.equal(await ownerSession({headers:{cookie:name+'='+encoded+'tampered'}}),null);
    const stranger=await encode({secret:process.env.AUTH_SECRET,salt:name,token:{ownerId:2,login:'stranger',accessToken:'test-only'},maxAge:60});
    assert.equal(await ownerSession({headers:{cookie:name+'='+stranger}}),null);
    assert.equal(sameOrigin({headers:{origin:'https://attacker.example'}}),false);
    const response={code:0,setHeader(){},status(v){this.code=v;return this;},json(v){this.value=v;return this;}};
    await eventsHandler({method:'POST',headers:{origin:'https://attacker.example'}},response);assert.equal(response.code,403);
    await eventsHandler({method:'POST',headers:{origin:'https://matabuks-samira-fernandessilvasamuel50-arts-projects.vercel.app','content-type':'application/json'}},response);assert.equal(response.code,401);
  }finally{for(const key of ['AUTH_SECRET','AUTH_GITHUB_ID','AUTH_GITHUB_SECRET']){if(saved[key]===undefined)delete process.env[key];else process.env[key]=saved[key];}}
});
