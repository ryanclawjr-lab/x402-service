# Quick Deploy to Railway

## Option 1: CLI (Requires Login)

```bash
cd /workspace/x402-service

# Install Railway CLI
npm i -g railway

# Login (interactive - opens browser)
railway login

# Initialize project
railway init

# Set environment variable
railway variables set PAY_TO="0x71f08aEfe062d28c7AD37344dC0D64e0adF8941E"

# Deploy
railway up
```

## Option 2: GitHub Integration (No CLI)

1. Push this folder to GitHub:
   ```bash
   cd /workspace/x402-service
   git init
   git add -A
   git commit -m "Initial x402 service"
   git remote add origin https://github.com/YOUR_USERNAME/x402-service.git
   git push -u origin main
   ```

2. Connect to Railway:
   - Go to https://railway.app
   - "New Project" → "Deploy from GitHub"
   - Select this repository
   - Add environment variable: `PAY_TO=0x71f08aEfe062d28c7AD37344dC0D64e0adF8941E`

## Option 3: Deploy Now (Button)

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/new?template=https://github.com/your-username/x402-service)

## After Deployment

Announce your service:
```bash
npx awal@latest x402 bazaar announce https://your-domain.com/api/status
```

## Check Earnings

```bash
npx awal@latest balance
```

## Service URL Format

```
https://[railway-app-name].railway.app/api/status
https://[railway-app-name].railway.app/api/verify-agent
https://[railway-app-name].railway.app/api/memory-query
```
