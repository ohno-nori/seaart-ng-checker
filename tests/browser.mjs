// Optional browser checks: npm install --no-save playwright && npx playwright install chromium
import { createRequire } from 'node:module';
import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE_PATH || 'playwright');
const browser = await chromium.launch({headless:true, ...(process.env.BROWSER_CHANNEL ? {channel:process.env.BROWSER_CHANNEL} : {})});
await mkdir(new URL('../test-results/',import.meta.url),{recursive:true});
try {
  for (const [name, viewport, colorScheme] of [['desktop',{width:1280,height:900},'light'],['mobile',{width:390,height:844},'light'],['mobile-dark',{width:390,height:844},'dark']]) {
    const page=await browser.newPage({viewport,colorScheme});
    const errors=[]; page.on('pageerror',e=>errors.push(e.message));
    const requests=[]; page.on('request',r=>requests.push({url:r.url(),method:r.method()}));
    await page.goto('http://127.0.0.1:4173');
    await page.waitForFunction(()=>document.getElementById('dictionary-status').textContent.includes('2,584'));
    const text='トリミングしたピエロの画像。\n人口と入口、口でするやつ。\n😀 SEX / ＳＥＸ';
    await page.locator('#input').fill(text);
    await page.waitForFunction(()=>document.querySelectorAll('mark').length>0);
    assert.equal(await page.locator('#preview').textContent(),text);
    assert.ok((await page.locator('#result-list').textContent()).includes('リミング'));
    assert.equal(await page.locator('#report').isVisible(),false);
    assert.equal(await page.locator('mark.reported').count(),0);
    assert.ok(await page.locator('mark.candidate').count()>0);
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
    await page.screenshot({path:fileURLToPath(new URL(`../test-results/${name}.png`,import.meta.url)),fullPage:true});
    await page.locator('#input').fill('<img src=x onerror="window.injected=true">口');
    await page.waitForFunction(()=>document.getElementById('preview').textContent.startsWith('<img'));
    assert.equal(await page.locator('#preview img').count(),0);
    assert.equal(await page.evaluate(()=>window.injected),undefined);
    await page.locator('#clear').click();
    assert.equal(await page.locator('#input').inputValue(),'');
    assert.equal(await page.locator('#summary').textContent(),'0種類 / terms · 合計0件 / matches');
    await page.locator('#input').fill('澄んだ空');
    await page.waitForFunction(()=>document.getElementById('message').textContent==='辞書に一致する文字列はありません / No dictionary matches');
    await page.reload();
    assert.equal(await page.locator('#input').inputValue(),'');
    assert.ok(requests.every(r=>r.url.startsWith('http://127.0.0.1:4173/')&&r.method==='GET'));
    assert.deepEqual(errors,[]);
    console.log(`PASS ${name}: rendering, input, clear, empty result, XSS, privacy, no overflow`);
    await page.close();
  }
  const page=await browser.newPage();
  await page.route('**/reported_terms.json',r=>r.fulfill({json:{terms:['着替え']}}));
  await page.goto('http://127.0.0.1:4173');
  await page.waitForFunction(()=>document.getElementById('dictionary-status').textContent.includes('2,584'));
  await page.locator('#input').fill('着替え ピエロ');
  await page.waitForSelector('mark.reported');
  assert.equal(await page.locator('mark.reported').textContent(),'着替え');
  assert.equal(await page.locator('mark.candidate').textContent(),'エロ');
  console.log('PASS supplied reports produce red, other candidates remain yellow');
  await page.route('**/seaart_ng_dictionary_web.json',r=>r.fulfill({status:404,body:'missing'}));
  await page.goto('http://127.0.0.1:4173');
  await page.waitForFunction(()=>document.getElementById('message').textContent.includes('チェックできません'));
  await page.locator('#input').fill('口');
  assert.equal(await page.locator('#summary').textContent(),'—');
  assert.equal(await page.locator('#message').getAttribute('role'),'alert');
  console.log('PASS dictionary load failure: explicit error, never shown as zero matches');
} finally { await browser.close(); }
