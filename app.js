import { loadDictionary, scan } from './engine.js';
import { config } from './config.js';
const $ = id => document.getElementById(id);
let dictionary;
let frame;
function update() {
  const input = $('input').value;
  $('char-count').textContent = `${Array.from(input).length.toLocaleString('ja-JP')}文字`;
  $('preview').replaceChildren();
  if (!dictionary) { $('preview').textContent = input; return; }
  const { results, total, highlights } = scan(input, dictionary.terms);
  const preview = document.createDocumentFragment();
  let cursor = 0;
  for (const { start, end } of highlights) {
    preview.append(document.createTextNode(input.slice(cursor, start)));
    const mark = document.createElement('mark');
    mark.textContent = input.slice(start, end);
    preview.append(mark);
    cursor = end;
  }
  preview.append(document.createTextNode(input.slice(cursor)));
  $('preview').append(preview);
  $('summary').textContent = `${results.length}種類 / 合計${total}件`;
  $('message').textContent = !input ? '文章を入力すると、一致箇所が赤く表示されます' : total ? '赤い箇所は、辞書に登録された文字列との部分一致です' : '辞書に一致する文字列はありません';
  const list = document.createDocumentFragment();
  for (const result of results) {
    const item = document.createElement('li');
    const term = document.createElement('span');
    term.textContent = result.term;
    const count = document.createElement('span');
    count.className = 'count';
    count.textContent = `${result.count}件`;
    item.append(term, count);
    list.append(item);
  }
  $('result-list').replaceChildren(list);
  $('empty').hidden = !!results.length;
  $('empty').textContent = input ? '辞書に一致する文字列はありません' : '文章を入力すると、ここに一致した登録語が表示されます。';
}
$('input').addEventListener('input', () => { cancelAnimationFrame(frame); frame = requestAnimationFrame(update); });
$('clear').addEventListener('click', () => { $('input').value = ''; update(); $('input').focus(); });
if (config.reportFormUrl) {
  try { const url = new URL(config.reportFormUrl); if (url.protocol === 'https:') { $('report').href = url.href; $('report').hidden = false; } } catch { /* Invalid configuration keeps the link hidden. */ }
}
try {
  if (!Intl.Segmenter) throw new Error('このブラウザは文字位置の解析に対応していません。最新版のSafari、Chrome、Firefoxをご利用ください');
  dictionary = await loadDictionary(config.dictionaryUrl);
  $('dictionary-status').textContent = `辞書 v${dictionary.version ?? '—'} · ${dictionary.count.toLocaleString('ja-JP')}語`;
  update();
} catch (error) {
  $('message').textContent = `チェックできません：${error.message}。ページを再読み込みしてください。`;
  $('message').setAttribute('role', 'alert');
  $('dictionary-status').textContent = '辞書を利用できません';
  $('empty').textContent = 'チェックは実行されていません。';
}
