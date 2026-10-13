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
  assert.ok(!source.includes('No como promesa principal'));
  assert.ok(!source.includes('Agendar una sesion'));
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  try {
    const page = await browser.newPage();
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    for (const lang of ['es','en','de','fr','pt','it','ru','cs','zh','ja','he','ar']) {
      await page.goto(pathToFileURL(path.join(root, 'index.html')).href + '?lang=' + lang);
      assert.equal(await page.locator('html').getAttribute('lang'), lang);
      assert.equal(await page.locator('html').getAttribute('dir'), ['he', 'ar'].includes(lang) ? 'rtl' : 'ltr');
      assert.equal(await page.locator('[name="service"] option').count(), 4);
      assert.equal(await page.locator('a[href$=".pdf"]').count(), 0);
      assert.equal(await page.locator('meta[name="description"]').getAttribute('content'), (await page.locator('.hero-lead').innerText()).trim());
      assert.equal(await page.locator('meta[property="og:title"]').getAttribute('content'), await page.title());
      assert.deepEqual(await page.evaluate(() => [...document.querySelectorAll('a[href^="#"]')].map(a => a.getAttribute('href').slice(1)).filter(id => !document.getElementById(id))), []);
      if (lang !== 'es') {
        const missing = await page.evaluate(lang => {
          const ignored = new Set(['PL', 'FAQ', 'PDF']);
          const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
          const missing = [];
          while (walker.nextNode()) {
            const node = walker.currentNode;
            if (node.parentElement.closest('script, style, [translate="no"], [aria-hidden="true"]')) continue;
            const key = node.originalTrimmed;
            if (key && !ignored.has(key) && !window.PSYCHE_TRANSLATIONS[lang][key]) missing.push(key);
          }
          return [...new Set(missing)];
        }, lang);
        assert.deepEqual(missing, [], 'Missing translations: ' + lang);
      }
      assert.ok((await page.locator('#sobre-mi').innerText()).includes('Edwin Josué Puglla Gangotena'));
      assert.ok(!(await page.locator('#sobre-mi').innerText()).includes('Soy psicologo'));
      assert.equal(await page.locator('[name="message"]').getAttribute('aria-describedby'), 'contact-scope');
      assert.ok((await page.locator('#contact-scope').innerText()).length > 20);
      if (lang !== 'es') assert.ok(!(await page.locator('.hero-lead').innerText()).includes('No ofrecemos diagnóstico ni psicoterapia.'));
      for (const width of [360,390,768,1440]) {
        await page.setViewportSize({ width, height: 900 });
        await page.evaluate(() => { document.documentElement.style.scrollBehavior = 'auto'; window.scrollTo(0, 0); });
        await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
        const overflow = await page.evaluate(() => ({
          width: innerWidth, scroll: document.documentElement.scrollWidth,
          elements: [...document.querySelectorAll('body *')].filter(e => e.getBoundingClientRect().right > innerWidth + 1).map(e => e.tagName + '.' + e.className)
        }));
        assert.ok(overflow.scroll <= overflow.width + 1, lang + ' at ' + width + ': ' + JSON.stringify(overflow));
        await page.locator('#sobre-mi').scrollIntoViewIfNeeded();
        if (process.env.PSYCHE_QA_OUTPUT) {
          fs.mkdirSync(process.env.PSYCHE_QA_OUTPUT,{recursive:true});
          await page.screenshot({path:path.join(process.env.PSYCHE_QA_OUTPUT,`psyche-${lang}-${width}.png`)});
        }
      }
      await page.selectOption('#language-select', 'en');
      await page.selectOption('#language-select', lang);
      assert.equal(await page.locator('html').getAttribute('lang'), lang);
    }
    assert.deepEqual(errors, []);
    console.log('PASS: identity, scope and contact notices, 12 languages, desktop/mobile, no JS errors.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
