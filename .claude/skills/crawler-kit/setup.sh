#!/usr/bin/env bash
# crawler-kit 설치 (idempotent). 설치 위치: ~/.crawler-kit (저장소 밖, 세션마다 1회 실행)
set -euo pipefail
KIT="${CRAWLER_KIT_HOME:-$HOME/.crawler-kit}"
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
mkdir -p "$KIT"

# Windows 로그의 fastuuid(pyo3) 빌드 실패 대응: 최신 파이썬에서도 ABI3 빌드 허용
export PYO3_USE_ABI3_FORWARD_COMPATIBILITY=1
export PYTHONUTF8=1

if [ ! -x "$KIT/venv/bin/python" ]; then python3 -m venv "$KIT/venv"; fi
"$KIT/venv/bin/python" -m pip install -q --upgrade pip
"$KIT/venv/bin/python" -m pip install -q crawl4ai scrapy playwright

# 브라우저: 클라우드 사전설치 Chromium 우선 사용, 없을 때만 다운로드
if [ -z "${CHROMIUM_PATH:-}" ] && [ -x /opt/pw-browsers/chromium ]; then
  echo "export CHROMIUM_PATH=/opt/pw-browsers/chromium" > "$KIT/env.sh"
else
  "$KIT/venv/bin/python" -m playwright install chromium
  : > "$KIT/env.sh"
fi

# Crawlee (node): crawlee_fetch.mjs 가 import 하도록 같은 폴더에 설치
if [ ! -d "$KIT/node/node_modules/crawlee" ]; then
  mkdir -p "$KIT/node" && (cd "$KIT/node" && npm init -y >/dev/null && npm i --silent crawlee playwright)
fi
cp "$HERE/crawlee_fetch.mjs" "$KIT/node/crawlee_fetch.mjs"
echo "crawler-kit ready: $KIT"
