# RyanClaw x402 Service

Payment-enabled agent API running on Base network with x402 protocol.

## Quick Start

```bash
cd ~/.openclaw/workspace/x402-service
npm install
npm start
```

## API Endpoints

### GET /health
Free health check (no payment required)

**Response:**
```json
{
  "status": "ok",
  "service": "RyanClaw Agent API",
  "version": "2.0.0"
}
```

---

### GET /api/status
Check agent status and capabilities.

**Price:** $0.001

**Response:**
```json
{
  "service": "RyanClaw Agent API",
  "version": "2.0.0",
  "agentId": "2079",
  "network": "base",
  "capabilities": ["security-audit", "memory-query", "agent-verification", "onchain-query"],
  "paymentAddress": "0x71f08aEfe062d28c7AD37344dC0D64e0adF8941E"
}
```

---

### POST /api/memory-query
Query the local memory store for relevant context.

**Price:** $0.005

**Request Body:**
```json
{
  "query": "search term"
}
```

**Response:**
```json
{
  "query": "search term",
  "results": [...],
  "source": "nemp"
}
```

---

### GET /api/verify-agent
Verify an ERC-8004 agent identity on-chain.

**Price:** $0.01

**Query Parameters:**
- `agentId` (required): Numeric agent ID

**Response:**
```json
{
  "agentId": "1234",
  "verified": true,
  "registry": "0x8004A818BFB912233c491871b3d84c89A494BD9e",
  "network": "base",
  "timestamp": "2026-02-15T14:10:00.000Z"
}
```

---

### POST /api/security-audit
Audit Solidity smart contracts for common vulnerabilities.

**Price:** $0.05

**Request Body:**
```json
{
  "code": "contract MyContract { ... }"
}
```

**Response:**
```json
{
  "issues": [
    { "severity": "high", "issue": "delegatecall without safety check" }
  ],
  "summary": "1 potential issues",
  "scannedAt": "2026-02-15T14:10:00.000Z"
}
```

**Detected Issues:**
- High: `delegatecall` without safety comments
- High: `selfdestruct` / `suicide` calls
- Medium: Use of `tx.origin` (should use `msg.sender`)
- Medium: No validation checks (`require`/`revert`)
- Medium: `abi.encodePacked` with dynamic types (hash collision risk)
- Low: Timestamp/block number dependencies

---

## Payment

All protected endpoints use x402 payment protocol:

1. Client sends request
2. Server responds with HTTP 402 (Payment Required)
3. Client pays via facilitator
4. Client retries with payment proof
5. Server verifies and processes

## Rate Limiting

- **Limit:** 30 requests per minute per IP
- **Response:** HTTP 429 when exceeded

## Production Features

- ✅ CORS enabled
- ✅ Request logging with timestamps
- ✅ Rate limiting (in-memory)
- ✅ Input validation
- ✅ Error handling
- ✅ x402 payment middleware
