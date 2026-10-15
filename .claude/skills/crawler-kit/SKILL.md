---
name: crawler-kit
description: Web crawling kit (Crawl4AI + Crawlee + Scrapy + Playwright). Use to fetch pages that need JS rendering, scrape sites to markdown/HTML/screenshots/image URLs, or crawl a site to a given depth. 웹 크롤링·스크래핑·페이지 수집·이미지 URL 추출 요청 시 사용 (crawler_kit).
---

# crawler-kit

User's crawling toolkit, ported from the Windows desktop install (`crawler_kit`) to run in cloud sessions too.

## Setup (once per session)

```bash
bash .claude/skills/crawler-kit/setup.sh
source ~/.crawler-kit/env.sh   # sets CHROMIUM_PATH if the preinstalled Chromium is used
```

Installs into `~/.crawler-kit` (outside the repo): a Python venv with `crawl4ai scrapy playwright`, and a Node folder with `crawlee`.

## Tools

| Need | Command |
|---|---|
| Page to markdown (LLM-ready) | `~/.crawler-kit/venv/bin/python -m crawl4ai.cli crawl URL -o markdown` or the `AsyncWebCrawler` Python API |
| Browser-rendered HTML + full-page screenshot + image URLs + text, optional depth | `node ~/.crawler-kit/node/crawlee_fetch.mjs URL OUTDIR [DEPTH]` (Crawlee fallback; max 60 pages, same hostname) |
| Large structured crawls | Scrapy (`~/.crawler-kit/venv/bin/scrapy`) |

`crawlee_fetch.mjs` outputs to OUTDIR: `crawlee_<hash>.html`, `crawlee_<hash>.png`, `crawlee_pages.json` (url, title, images, text).

## Notes

- Cloud network policy applies; a blocked host returns proxy 403. See the environment network docs, do not bypass TLS verification.
- Respect robots.txt and site terms; keep concurrency low (the script uses 1).
- Windows-side history: `fastuuid` (pyo3) failed to build on Python 3.15 until `PYO3_USE_ABI3_FORWARD_COMPATIBILITY=1` was set; `setup.sh` sets it.
