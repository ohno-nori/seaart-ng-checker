import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {prepareDictionary,scan,colorHighlights,loadReportedTerms} from '../engine.js';
test('v2 + 着替え: all candidates yellow until reports supplied',()=>{
 const d=JSON.parse(fs.readFileSync(new URL('../dictionary/v2/seaart_ng_dictionary_web.json',import.meta.url)));
 assert.equal(d.entries.length,2584);
 const result=scan('着替え 自由研究 トリミング ＰＯＴＡＴＯ',prepareDictionary(d));
 for(const term of ['着替え','自由','リミング','pot'])assert.ok(result.results.some(r=>r.term===term));
 assert.ok(colorHighlights(result.results).every(r=>r.kind==='candidate'));
});
test('reported-only words are included; normalized variants share status',()=>{
 const terms=prepareDictionary({entries:[{t:'SEX'}]},['sex','着替え']);
 const result=scan('ＳＥＸ 着替え',terms);
 assert.ok(result.results.every(r=>r.reported));
 assert.ok(colorHighlights(result.results).every(r=>r.kind==='reported'));
});
test('overlaps split precisely and retain every match',()=>{
 const result=scan('口でするやつ',prepareDictionary({entries:[{t:'口でするやつ'},{t:'口'}]},['口']));
 assert.equal(result.total,2);
 assert.deepEqual(colorHighlights(result.results),[{start:0,end:1,kind:'reported'},{start:1,end:6,kind:'candidate'}]);
});
test('empty reports accepted, malformed and missing reports fail explicitly',async()=>{
 assert.deepEqual(await loadReportedTerms('x',async()=>({ok:true,json:async()=>({terms:[]})})),[]);
 await assert.rejects(loadReportedTerms('x',async()=>({ok:false,status:404})));
 await assert.rejects(loadReportedTerms('x',async()=>({ok:true,json:async()=>({terms:['']})})));
});
test('NFKC expansion and emoji positions retain color',()=>{
 const text='😀㍿ｶﾞ';
 const result=scan(text,prepareDictionary({entries:[{t:'株式会社'}]},['ガ']));
 assert.deepEqual(colorHighlights(result.results).map(r=>[text.slice(r.start,r.end),r.kind]),[['㍿','candidate'],['ｶﾞ','reported']]);
});
