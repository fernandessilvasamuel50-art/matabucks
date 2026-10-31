import {readFileSync} from 'node:fs';
import {getCache} from '@vercel/functions';
import {composeTracker, REPOSITORY} from '../lib/tracker.js';
import {fetchJournal} from '../lib/journal.js';

const baseline = JSON.parse(readFileSync(new URL('../data/baseline.json', import.meta.url), 'utf8'));
const CACHE_KEY = 'matabuks:' + REPOSITORY + ':journal:v1';
const FRESH_SECONDS = 180;
let memory, pending;
const cache = getCache();
export async function invalidateJournal(){memory=undefined;try{await cache.delete(CACHE_KEY);}catch{/* The next regular refresh remains available. */}}

async function readJournal() {
  const now = Date.now();
  let saved = memory;
  try { saved = await cache.get(CACHE_KEY) || saved; } catch { /* In-memory cache is sufficient in local development. */ }
  if (saved?.retryAt > now) return {...saved, stale: true};
  if (saved && now - saved.checkedAt < FRESH_SECONDS * 1000) return {...saved, stale: false};
  if (!pending) pending = (async () => {
    try {
      const value = await fetchJournal(saved, {token: process.env.GITHUB_READ_TOKEN});
      memory = value;
      try { await cache.set(CACHE_KEY, value, {ttl: 86400, name: 'Matabuks match journal'}); } catch { /* Cache is not the durable data store. */ }
      return {...value, stale: false};
    } catch (error) {
      if (saved) {
        const value = {...saved, retryAt: error.retryAt || Date.now() + 60000};
        memory = value;
        try { await cache.set(CACHE_KEY, value, {ttl: 86400, name: 'Matabuks match journal'}); } catch { /* Preserve the in-memory last known state. */ }
        return {...value, stale: true};
      }
      throw error;
    }
  })().finally(() => { pending = null; });
  return pending;
}

export default async function handler(req, res) {
  res.setHeader('Allow', 'GET');
  res.setHeader('Cache-Control', 'public,max-age=0,s-maxage=15,stale-while-revalidate=15');
  if (req.method !== 'GET') return res.status(405).json({error: 'method_not_allowed'});
  try {
    const journal = await readJournal();
    const data = composeTracker(baseline, journal.records);
    data.integration.checkedAt = new Date(journal.checkedAt).toISOString();
    data.integration.stale = journal.stale;
    data.integration.syncSeconds = FRESH_SECONDS;
    return res.status(200).json(data);
  } catch (error) {
    console.error('Tracker read failed', error.message);
    res.setHeader('Cache-Control', 'no-store');
    return res.status(503).json({error: 'tracker_unavailable'});
  }
}
