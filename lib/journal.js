import {readIssue, REPOSITORY} from './tracker.js';

// Fetch only changed Issues between full reconciliations, keeping API usage independent of history length.
export async function fetchJournal(saved, {fetcher = fetch, now = Date.now(), token} = {}) {
  const incremental = saved?.lastFullReadAt && now - saved.lastFullReadAt < 21600000;
  const records = new Map(incremental ? saved.records.map(record => [record.number, record]) : []);
  const since = incremental ? '&since=' + encodeURIComponent(new Date(saved.checkedAt - 60000).toISOString()) : '';
  for (let page = 1; page <= 100; page++) {
    const response = await fetcher('https://api.github.com/repos/' + REPOSITORY + '/issues?state=all&per_page=100&sort=updated&direction=asc&page=' + page + since, {
      headers: {Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28', 'User-Agent': 'Matabuks-Tracker', ...(token ? {Authorization: 'Bearer ' + token} : {})},
      signal: AbortSignal.timeout(12000)
    });
    if (!response.ok) {
      const error = Error('github_read_' + response.status);
      const reset = Number(response.headers.get('x-ratelimit-reset')) * 1000;
      error.retryAt = Math.max(now + 60000, Number.isFinite(reset) && (response.status === 403 || response.status === 429) ? reset : 0);
      throw error;
    }
    for (const issue of await response.json()) {
      const event = readIssue(issue);
      if (event) records.set(issue.number, event);
      else records.delete(issue.number);
    }
    if (!response.headers.get('link')?.includes('rel="next"')) return {records: [...records.values()], checkedAt: now, lastFullReadAt: incremental ? saved.lastFullReadAt : now};
  }
  throw Error('journal_pagination_limit');
}
