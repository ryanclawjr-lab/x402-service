# Hawkeye Agent API - x402 Paid Service

x402 payment protocol service for monetizing agent capabilities.

## Endpoints

| Endpoint | Price | Description |
|----------|-------|-------------|
| GET /api/status | $0.001 | Agent status and capabilities |
| POST /api/memory-query | $0.005 | Memory store query |
| GET /api/verify-agent | $0.01 | ERC-8004 agent verification |

## Deploy to Railway

```bash
# Install Railway CLI
npm i -g railway

# Login
railway login

# Initialize project
railway init

# Set environment variables
railway variables set PAY_TO="0x71f08aEfe062d28c7AD37344dC0D64e0adF8941E"

# Deploy
railway up
```

## Deploy to Vercel

```bash
npm i -g vercel
vercel --prod
```

## Test Locally

```bash
npm install
node index.js

# Health check (free)
curl http://localhost:3000/health

# Paid endpoint (returns 402 without payment)
curl -I http://localhost:3000/api/status
```

## Payment

Payments received in USDC on Base at:
`0x71f08aEfe062d28c7AD37344dC0D64e0adF8941E`

## Announce to Marketplace

Once deployed, announce your service:
```bash
npx awal@latest x402 bazaar announce https://your-domain.com/api/status
```
