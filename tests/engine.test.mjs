import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { performance } from 'node:perf_hooks';
import { normalize, normalizeWithMap, prepareDictionary, scan, loadDictionary } from '../engine.js';
const dict = (...words) => prepareDictionary({ entries: words.map(t => ({ t })) });
for (const [input, words, counts] of [
  ['トリミング',['リミング'],[1]], ['ピエロ',['エロ'],[1]], ['人口減少',['口'],[1]], ['入口',['口'],[1]],
  ['口口口',['口'],[3]], ['口でするやつ',['口','口でするやつ'],[1,1]], ['SEX',['sex'],[1]], ['ＳＥＸ',['sex'],[1]],
  ['画像を切り抜く',['リミング'],[]], ['sexsex',['sex'],[2]], ['aaaa',['a','aa','aaa'],[4,3,2]],
  ['口とSEX😀\n入口',['口','sex'],[2,1]], ['', ['口'], []],
]) test(`部分一致 ${JSON.stringify(input)}`, () => assert.deepEqual(scan(input,dict(...words)).results.map(r=>r.count),counts));

test('元文章の位置・改行・絵文字を保持する', () => {
  const input = '😀トリミング\nＳＥＸと入口';
  const result = scan(input, dict('リミング','sex','口'));
  assert.deepEqual(result.highlights.map(r=>input.slice(r.start,r.end)),['リミング','ＳＥＸ','口']);
  assert.equal(result.results[0].matches[0].start,3);
});
test('NFKCの展開・合成と正しい位置', () => {
  const input = '😀㍿とｶﾞとe\u0301とﬃ！';
  const result = scan(input, dict('株式会社','ガ','é','ffi'));
  assert.deepEqual(result.highlights.map(r=>input.slice(r.start,r.end)), ['㍿','ｶﾞ','e\u0301','ﬃ']);
  assert.equal(normalizeWithMap(input).text, normalize(input));
});
test('正規化展開内の一致も省略せず保持', () => {
  const result = scan('ﬃ',dict('f','ff','ffi'));
  assert.deepEqual(result.results.map(r=>r.count),[2,1,1]);
  assert.deepEqual(result.highlights,[{start:0,end:1}]);
});
test('絵文字クラスタの中も元のスカラー位置を維持', () => {
  const input='👩‍💻';
  assert.deepEqual(scan(input,dict('💻')).highlights,[{start:3,end:5}]);
});
test('包含一致の情報を失わず描画範囲だけ統合', () => {
  const result=scan('口でするやつ',dict('口','口でするやつ'));
  assert.equal(result.total,2);
  assert.deepEqual(result.results.map(r=>r.matches[0].end),[1,6]);
  assert.deepEqual(result.highlights,[{start:0,end:6}]);
});
test('重複表記を統合、別表記は保持、nと属性は照合に不使用', () => {
  const terms=prepareDictionary({entries:[{t:'SEX',n:'WRONG',r:'high'},{t:'SEX',l:'ja'},{t:'sex',r:'low'}]});
  const result=scan('sexSEX',terms);
  assert.deepEqual(result.results.map(r=>[r.term,r.count]),[['SEX',2],['sex',2]]);
});
test('大小文字の方式は辞書と本文で統一', () => {
  assert.equal(scan('ΟΣ',dict('οσ')).total,1);
  assert.equal(scan('STRAẞE',dict('Straße')).total,1);
  assert.equal(scan('STRASSE',dict('Straße')).total,0); // casefoldではなくJS小文字化
});
test('読み込み成功', async()=>assert.equal((await loadDictionary('x',async()=>({ok:true,json:async()=>({entries:[{t:'口'}]})}))).count,1));
test('HTTP失敗は未検出扱いにしない', async()=>assert.rejects(loadDictionary('x',async()=>({ok:false,status:404})),/404/));
test('ネットワーク失敗', async()=>assert.rejects(loadDictionary('x',async()=>{throw new Error('offline')}),/offline/));
test('JSON破損', async()=>assert.rejects(loadDictionary('x',async()=>({ok:true,json:async()=>{throw new SyntaxError('JSON')}})),/JSON/));
test('空・不正辞書は明示的エラー',()=>{for(const data of [{},{entries:[]},{entries:[{t:''}]},{entries:[{n:'口'}]}])assert.throws(()=>prepareDictionary(data));});
const data=JSON.parse(await readFile(new URL('../dictionary/seaart_ng_dictionary_web.json',import.meta.url),'utf8'));
test('添付辞書2363語を全件使用・実辞書の例文',()=>{
  assert.equal(data.entries.length,2363);
  const result=scan('トリミング ピエロ 人口 入口 口でするやつ SEX ＳＥＸ',prepareDictionary(data));
  for(const term of ['リミング','エロ','口','口でするやつ'])assert.ok(result.results.some(r=>r.term===term),term);
});
test('数千文字・2363語の全件走査',t=>{
  const input='😀トリミングと人口。SEX\n'.repeat(400);
  const start=performance.now();
  const result=scan(input,prepareDictionary(data));
  const elapsed=performance.now()-start;
  assert.equal(result.results.find(r=>r.term==='口').count,400);
  assert.equal(result.results.find(r=>r.term==='リミング').count,400);
  t.diagnostic(`${input.length} UTF-16 units / ${elapsed.toFixed(1)} ms`);
});
test('短い文字列総当たり：重複する部分一致を全件保持',()=>{
  const terms=dict('a','b','aa','ab','ba','aba');
  for(let bits=0;bits<256;bits++){
    const input=bits.toString(2).padStart(8,'0').replaceAll('0','a').replaceAll('1','b');
    const result=scan(input,terms);
    for(const {term} of terms){
      const expected=[];
      for(let i=0;i<input.length;i++)if(input.slice(i,i+term.length)===term)expected.push(i);
      assert.deepEqual(result.results.find(r=>r.term===term)?.matches.map(m=>m.start)??[],expected);
    }
  }
});
