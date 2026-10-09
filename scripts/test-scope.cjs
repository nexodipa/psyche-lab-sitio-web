const assert = require('node:assert/strict');
const path = require('node:path');
const fs = require('node:fs');
const { pathToFileURL } = require('node:url');
const { chromium } = require('playwright');

(async () => {
  const root = path.resolve(__dirname, '..');
  const source = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  assert.ok(!source.includes('Soy psicologo'));
  assert.ok(!source.includes('article-date'));
  assert.ok(!source.includes('Mas solicitado'));
  assert.ok(!source.includes('<span>Foto</span>'));
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  try {
    const page = await browser.newPage();
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    for (const lang of ['es','en']) {
      await page.goto(pathToFileURL(path.join(root, 'index.html')).href + '?lang=' + lang);
      assert.ok((await page.locator('#sobre-mi').innerText()).includes('Edwin Josué Puglla Gangotena'));
      assert.ok(!(await page.locator('#sobre-mi').innerText()).includes('Soy psicologo'));
      for (const width of [390,1440]) {
        await page.setViewportSize({ width, height: 900 });
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), true);
        await page.locator('#sobre-mi').scrollIntoViewIfNeeded();
        if (process.env.PSYCHE_QA_OUTPUT) {
          fs.mkdirSync(process.env.PSYCHE_QA_OUTPUT,{recursive:true});
          await page.screenshot({path:path.join(process.env.PSYCHE_QA_OUTPUT,`psyche-${lang}-${width}.png`)});
        }
      }
    }
    assert.deepEqual(errors, []);
    console.log('PASS: identity, removed placeholder/article dates/unsupported title, ES/EN, desktop/mobile, no JS errors.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
