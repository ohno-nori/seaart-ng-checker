import { loadDictionary, loadReportedTerms, scan, colorHighlights } from './engine.js';
import { config } from './config.js';
const $ = id => document.getElementById(id);
let dictionary;
let frame;
function update() {
  const input = $('input').value;
  $('char-count').textContent = `${Array.from(input).length.toLocaleString('ja-JP')}文字 / characters`;
  $('preview').replaceChildren();
  if (!dictionary) { $('preview').textContent = input; return; }
  const { results, total } = scan(input, dictionary.terms);
  const highlights = colorHighlights(results);
  const preview = document.createDocumentFragment();
  let cursor = 0;
  for (const { start, end, kind } of highlights) {
    preview.append(document.createTextNode(input.slice(cursor, start)));
    const mark = document.createElement('mark');
    mark.className = kind;
    mark.textContent = input.slice(start, end);
    preview.append(mark);
    cursor = end;
  }
  preview.append(document.createTextNode(input.slice(cursor)));
  $('preview').append(preview);
  $('summary').textContent = `${results.length}種類 / terms · 合計${total}件 / matches`;
  $('message').textContent = !input ? '入力すると一致箇所を表示 / Paste text to see matches' : total ? '黄色：辞書候補 · 赤色：規制報告あり / Yellow: listed · Red: reported blocked' : '辞書に一致する文字列はありません / No dictionary matches';
  const list = document.createDocumentFragment();
  for (const result of results) {
    const item = document.createElement('li');
    const term = document.createElement('span');
    term.textContent = result.term;
    const count = document.createElement('span');
    count.className = 'count';
    count.textContent = `${result.count}件 / matches`;
    const status = document.createElement('span');
    status.className = `term-status ${result.reported ? 'reported' : 'candidate'}`;
    status.textContent = result.reported ? '規制報告あり / Reported blocked' : '辞書候補 / Listed';
    item.append(term, count, status);
    list.append(item);
  }
  $('result-list').replaceChildren(list);
  $('empty').hidden = !!results.length;
  $('empty').textContent = input ? '辞書に一致する文字列はありません / No dictionary matches' : '一致した登録語をここに表示 / Matching terms appear here';
}
$('input').addEventListener('input', () => { cancelAnimationFrame(frame); frame = requestAnimationFrame(update); });
$('clear').addEventListener('click', () => { $('input').value = ''; update(); $('input').focus(); });
if (config.reportFormUrl) {
  try { const url = new URL(config.reportFormUrl); if (url.protocol === 'https:') { $('report').href = url.href; $('report').hidden = false; } } catch { /* Invalid configuration keeps the link hidden. */ }
}
try {
  if (!Intl.Segmenter) throw new Error('このブラウザは文字位置の解析に対応していません。最新版のSafari、Chrome、Firefoxをご利用ください');
  const reportedTerms = await loadReportedTerms(config.reportedTermsUrl);
  dictionary = await loadDictionary(config.dictionaryUrl, fetch, reportedTerms);
  $('dictionary-status').textContent = `辞書 / Dictionary v${dictionary.version ?? '—'} · ${dictionary.count.toLocaleString('ja-JP')}語 / terms`;
  update();
} catch (error) {
  $('message').textContent = `チェックできません / Check unavailable: ${error.message}。再読み込みしてください / Please reload. Requires a modern browser with Intl.Segmenter.`;
  $('message').setAttribute('role', 'alert');
  $('dictionary-status').textContent = '辞書を利用できません / Dictionary unavailable';
  $('empty').textContent = 'チェックは実行されていません / Check has not run';
}
