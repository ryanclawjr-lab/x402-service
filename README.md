# Hawkeye x402 Agent API

Paid API service for agent-to-agent payments via x402 protocol on Base.

## Quick Deploy to Railway (CLI)

```bash
cd x402-service
railway login
railway init
railway variables set PAY_TO="0x71f08aEfe062d28c7AD37344dC0D64e0adF8941E"
railway up
```

## Quick Deploy to Railway (GitHub)

1. Push to GitHub:
   ```bash
   cd x402-service
   git init
   git add -A
   git commit -m "Initial x402 service"
   gh repo create x402-service --public --description "x402 paid API service"
   git remote add origin https://github.com/ryanthawks/x402-service.git
   git push -u origin main
   ```

2. Connect to Railway:
   - Go to https://railway.app
   - "New Project" → "Deploy from GitHub"
   - Select `ryanthawks/x402-service`
   - Add env var: `PAY_TO=0x71f08aEfe062d28c7AD37344dC0D64e0adF8941E`

## Endpoints

| Endpoint | Price | Description |
|----------|-------|-------------|
| `GET /api/status` | $0.001 | Agent status check |
| `POST /api/memory-query` | $0.005 | Query memory store |
| `GET /api/verify-agent` | $0.01 | Verify ERC-8004 agent |

## Announce Service

```bash
npx awal@latest x402 bazaar announce https://<your-railway-app>.railway.app/api/status
```

## Check Earnings

```bash
npx awal@latest balance
```
