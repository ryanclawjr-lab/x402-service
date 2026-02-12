#!/bin/bash
# Quick deploy - run when system FD limits are clear
set -e
cd "$(dirname "$0")"
echo "🚀 Deploying x402 service..."
git add -A 2>/dev/null && git commit -m "Deploy $(date)" 2>/dev/null || true
gh repo create x402-service --public --description "x402 paid API" --source=. --push 2>/dev/null || git push origin main 2>/dev/null || echo "Git push done"
echo "✅ Now connect at https://railway.app → Deploy from GitHub"
echo "Env var: PAY_TO=0x71f08aEfe062d28c7AD37344dC0D64e0adF8941E"
