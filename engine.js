// Both dictionary t and input use exactly this normalization (not Python's n).
// Lower each Unicode scalar independently, avoiding context-sensitive final sigma.
const lower = text => Array.from(text, ch => ch.toLowerCase()).join('');
export const normalize = text => lower(text.normalize('NFKC'));

export function normalizeWithMap(input) {
  const segmenter = new Intl.Segmenter('ja', { granularity: 'grapheme' });
  let text = '';
  const starts = [], ends = [];
  function append(value, start, end) {
    text += value;
    for (let i = 0; i < value.length; i++) { starts.push(start); ends.push(end); }
  }
  for (const { segment, index } of segmenter.segment(input)) {
    const scalars = Array.from(segment);
    const parts = scalars.map(ch => ch.normalize('NFKC'));
    if (parts.join('') === segment.normalize('NFKC')) {
      let offset = index;
      scalars.forEach((ch, i) => { append(lower(parts[i]), offset, offset + ch.length); offset += ch.length; });
    } else {
      // Composition/reordering (e.g. halfwidth kana + dakuten) is indivisible.
      append(normalize(segment), index, index + segment.length);
    }
  }
  return { text, starts, ends };
}

export function prepareDictionary(data, reportedTerms = []) {
  if (!data || !Array.isArray(data.entries) || !data.entries.length) throw new Error('辞書の entries が空、または不正です');
  const terms = new Map();
  const reported = new Set(reportedTerms.map(normalize));
  for (const entry of [...data.entries, ...reportedTerms.map(t => ({ t }))]) {
    if (typeof entry.t !== 'string' || !entry.t.length) throw new Error('辞書に空または不正な登録語があります');
    if (!terms.has(entry.t)) terms.set(entry.t, { term: entry.t, needle: normalize(entry.t), reported: reported.has(normalize(entry.t)) });
  }
  return [...terms.values()];
}

export async function loadDictionary(url, fetcher = fetch, reportedTerms = []) {
  const response = await fetcher(url);
  if (!response.ok) throw new Error(`辞書の取得に失敗しました (${response.status})`);
  const data = await response.json();
  const terms = prepareDictionary(data, reportedTerms);
  return { terms, count: terms.length, version: data.version };
}

export async function loadReportedTerms(url, fetcher = fetch) {
  const response = await fetcher(url);
  if (!response.ok) throw new Error(`Reported list unavailable (${response.status})`);
  const data = await response.json();
  if (!Array.isArray(data.terms) || data.terms.some(t => typeof t !== 'string' || !t.length)) throw new Error('Invalid reported terms list');
  return data.terms;
}

// Split at every boundary: red applies only where a reported match overlaps.
// Candidate tails stay yellow; all matches remain in results.
export function colorHighlights(results) {
  const events = new Map();
  for (const result of results) for (const {start, end} of result.matches) {
    for (const [at, delta] of [[start, 1], [end, -1]]) {
      const event = events.get(at) ?? { candidate: 0, reported: 0 };
      event[result.reported ? 'reported' : 'candidate'] += delta;
      events.set(at, event);
    }
  }
  const spans = [];
  let candidate = 0, reported = 0, previous = 0;
  for (const [at, delta] of [...events].sort((a,b) => a[0]-b[0])) {
    if (at > previous && (candidate || reported)) {
      const kind = reported ? 'reported' : 'candidate';
      const last = spans.at(-1);
      if (last?.end === previous && last.kind === kind) last.end = at;
      else spans.push({start: previous, end: at, kind});
    }
    candidate += delta.candidate; reported += delta.reported; previous = at;
  }
  return spans;
}

export function scan(input, terms) {
  const { text, starts, ends } = normalizeWithMap(input);
  const results = [], ranges = [];
  let total = 0;
  for (const { term, needle, reported = false } of terms) {
    const matches = [];
    for (let at = text.indexOf(needle); at !== -1; at = text.indexOf(needle, at + 1)) {
      const match = { start: starts[at], end: ends[at + needle.length - 1], normalizedStart: at, normalizedEnd: at + needle.length };
      matches.push(match);
      ranges.push({ start: match.start, end: match.end });
    }
    if (matches.length) { results.push({ term, matches, count: matches.length, reported }); total += matches.length; }
  }
  ranges.sort((a, b) => a.start - b.start || a.end - b.end);
  const highlights = [];
  for (const range of ranges) {
    const last = highlights.at(-1);
    if (last && range.start <= last.end) last.end = Math.max(last.end, range.end);
    else highlights.push({ ...range });
  }
  return { results, total, highlights };
}
