// Crawlee 폴백: 브라우저(Playwright)로 렌더링, 스크린샷+HTML+이미지 URL 저장.
// 사용: node crawlee_fetch.mjs URL OUTDIR [DEPTH]
import { PlaywrightCrawler, Configuration } from 'crawlee';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

Configuration.getGlobalConfig().set('persistStorage', false);
const [url, out, depthArg] = process.argv.slice(2);
const maxDepth = Number(depthArg || 0);
fs.mkdirSync(out, { recursive: true });
const host = new URL(url).host;
const pages = [];

const crawler = new PlaywrightCrawler({
  maxRequestsPerCrawl: 60,
  requestHandlerTimeoutSecs: 90,
  maxConcurrency: 1,
  maxRequestRetries: 1,
  launchContext: process.env.CHROMIUM_PATH ? { launchOptions: { executablePath: process.env.CHROMIUM_PATH } } : {},
  async requestHandler({ page, request, enqueueLinks }) {
    await page.waitForLoadState('networkidle', { timeout: 20000 }).catch(() => {});
    // 지연 로딩 이미지를 위해 끝까지 스크롤
    await page.evaluate(async () => {
      for (let y = 0; y < document.body.scrollHeight; y += 700) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 150)); }
    });
    const h = crypto.createHash('md5').update(request.url).digest('hex').slice(0, 8);
    fs.writeFileSync(path.join(out, `crawlee_${h}.html`), await page.content());
    await page.screenshot({ path: path.join(out, `crawlee_${h}.png`), fullPage: true }).catch(() => {});
    const images = await page.$$eval('img', els => els.map(e => e.currentSrc || e.src || e.dataset.src).filter(Boolean));
    const title = await page.title();
    const text = await page.evaluate(() => document.body.innerText);
    pages.push({ url: request.url, title, images, text });
    const depth = request.userData.depth || 0;
    if (depth < maxDepth) {
      await enqueueLinks({ strategy: 'same-hostname', userData: { depth: depth + 1 } });
    }
  },
});

await crawler.run([{ url, userData: { depth: 0 } }]);
fs.writeFileSync(path.join(out, 'crawlee_pages.json'), JSON.stringify(pages, null, 1));
console.log(`crawlee: ${pages.length} page(s)`);
