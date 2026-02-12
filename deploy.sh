#!/bin/bash
# x402-service Deployment Script
# Run this when you have Railway access

set -e

echo "🚀 Deploying Hawkeye x402 Service to Railway..."

# 1. Login to Railway
echo "1. Login to Railway..."
railway login

# 2. Initialize project
echo "2. Initializing Railway project..."
railway init

# 3. Set environment variable
echo "3. Setting PAY_TO address..."
railway variables set PAY_TO="0x71f08aEfe062d28c7AD37344dC0D64e0adF8941E"

# 4. Deploy
echo "4. Deploying to Railway..."
railway up

# 5. Get the URL
echo "5. Getting service URL..."
railway status

echo "✅ Deployment complete!"
echo ""
echo "Announce your service:"
echo 'npx awal@latest x402 bazaar announce https://<railway-app-name>.railway.app/api/status'

# Check wallet status
echo ""
echo "Checking wallet..."
npx awal@latest status
