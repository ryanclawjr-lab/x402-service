const express = require("express");
const { paymentMiddleware } = require("x402-express");
const axios = require("axios");

const app = express();
app.use(express.json());

// ============================================================
// PRODUCTION CONFIGURATION
// ============================================================

// Your wallet address for receiving payments
const PAY_TO = "0x71f08aEfe062d28c7AD37344dC0D64e0adF8941E";

// ERC-8004 Registry on Base
const ERC8004_REGISTRY = "0x8004A818BFB912233c491871b3d84c89A494BD9e";

// ============================================================
// MIDDLEWARE: CORS, Logging, Rate Limiting
// ============================================================

// CORS headers
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Payment");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

// Request logging with timestamps
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.path}`);
  next();
});

// Simple in-memory rate limiting
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX = 30; // 30 requests per minute

function rateLimitMiddleware(req, res, next) {
  const ip = req.ip || req.connection.remoteAddress || "unknown";
  const now = Date.now();
  
  if (!rateLimitMap.has(ip)) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return next();
  }
  
  const record = rateLimitMap.get(ip);
  
  if (now > record.resetTime) {
    record.count = 1;
    record.resetTime = now + RATE_LIMIT_WINDOW;
    return next();
  }
  
  if (record.count >= RATE_LIMIT_MAX) {
    return res.status(429).json({ 
      error: "Rate limit exceeded", 
      retryAfter: Math.ceil((record.resetTime - now) / 1000) 
    });
  }
  
  record.count++;
  next();
}

app.use(rateLimitMiddleware);

// ============================================================
// INPUT VALIDATION
// ============================================================

function validateRequired(obj, fields) {
  const missing = [];
  for (const field of fields) {
    if (!obj[field]) missing.push(field);
  }
  return missing.length > 0 ? `Missing required fields: ${missing.join(", ")}` : null;
}

// ============================================================
// x402 PAYMENT MIDDLEWARE
// ============================================================

const payment = paymentMiddleware(PAY_TO, {
  "GET /api/status": {
    price: "$0.001",
    network: "base",
    config: { description: "Agent status check" },
  },
  "POST /api/memory-query": {
    price: "$0.005",
    network: "base",
    config: {
      description: "Query memory store for relevant context",
      inputSchema: { bodyType: "json", bodyFields: { query: { type: "string" } } },
    },
  },
  "GET /api/verify-agent": {
    price: "$0.01",
    network: "base",
    config: {
      description: "Verify ERC-8004 agent identity on-chain",
      inputSchema: { queryParams: { agentId: { type: "string" } } },
    },
  },
  "POST /api/security-audit": {
    price: "$0.05",
    network: "base",
    config: {
      description: "Audit Solidity contract for vulnerabilities",
      inputSchema: { bodyType: "json", bodyFields: { code: { type: "string" } } },
    },
  },
});

// ============================================================
// ERROR HANDLING
// ============================================================

// Global error handler
app.use((err, req, res, next) => {
  console.error(`[ERROR] ${new Date().toISOString()}:`, err.message);
  res.status(500).json({ 
    error: "Internal server error",
    message: process.env.NODE_ENV === "development" ? err.message : "Something went wrong"
  });
});

// ============================================================
// ENDPOINTS
// ============================================================

// Free root endpoint
app.get("/", (req, res) => {
  res.json({ service: "RyanClaw Agent API", version: "2.0.0", endpoints: ["/health", "/test", "/api/status", "/api/verify-agent", "/api/memory-query", "/api/security-audit"] });
});

// Debug test endpoint (no payment)
app.get("/test", (req, res) => {
  res.json({ test: "works", timestamp: new Date().toISOString() });
});

// Free health check (no payment required)
app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "RyanClaw Agent API", version: "2.0.0" });
});

// Protected: Status
app.get("/api/status", payment, (req, res) => {
  res.json({
    service: "RyanClaw Agent API",
    version: "2.0.0",
    agentId: "2079",
    network: "base",
    capabilities: ["security-audit", "memory-query", "agent-verification", "onchain-query"],
    paymentAddress: PAY_TO,
  });
});

// Protected: Memory Query
app.post("/api/memory-query", payment, async (req, res) => {
  try {
    // Input validation
    const validationError = validateRequired(req.body, ["query"]);
    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    const { query } = req.body;
    
    // Validate query is a string
    if (typeof query !== "string" || query.trim().length === 0) {
      return res.status(400).json({ error: "Query must be a non-empty string" });
    }

    // Limit query length
    if (query.length > 500) {
      return res.status(400).json({ error: "Query too long (max 500 characters)" });
    }

    // Try Nemp (structured memory)
    const nempPath = "/Users/ryanthawks/.openclaw/workspace/.nemp/memories.json";
    const fs = require("fs");
    
    if (fs.existsSync(nempPath)) {
      const nemp = JSON.parse(fs.readFileSync(nempPath, "utf8"));
      const results = nemp.filter(m => 
        JSON.stringify(m).toLowerCase().includes(query.toLowerCase())
      ).slice(0, 5);
      if (results.length > 0) {
        return res.json({ query, results, source: "nemp" });
      }
    }
    return res.json({ query, result: "No matches found", source: "local" });
  } catch (e) {
    console.error(`[ERROR] memory-query: ${e.message}`);
    return res.status(500).json({ error: "Failed to query memory", details: e.message });
  }
});

// Protected: Agent Verification
app.get("/api/verify-agent", payment, async (req, res) => {
  try {
    // Input validation
    const validationError = validateRequired(req.query, ["agentId"]);
    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    const { agentId } = req.query;

    // Validate agentId format
    if (typeof agentId !== "string" || !/^\d+$/.test(agentId)) {
      return res.status(400).json({ error: "agentId must be a numeric string" });
    }

    // Query ERC-8004 registry for agent
    const agentIdNum = parseInt(agentId);
    const paddedId = agentIdNum.toString(16).padStart(32, '0');
    
    // Call Base RPC
    const response = await axios.post("https://mainnet.base.org", {
      jsonrpc: "2.0",
      method: "eth_call",
      params: [{
        to: ERC8004_REGISTRY,
        data: "0x" + paddedId
      }, "latest"],
      id: 1
    }, { timeout: 10000 });

    const data = response.data.result;
    if (data === "0x" || !data) {
      return res.json({ agentId, verified: false, reason: "Not registered" });
    }

    return res.json({
      agentId,
      verified: true,
      registry: ERC8004_REGISTRY,
      network: "base",
      timestamp: new Date().toISOString()
    });
  } catch (e) {
    console.error(`[ERROR] verify-agent: ${e.message}`);
    // If on-chain fails, return pending (don't expose internal errors)
    return res.json({ agentId: req.query.agentId, verified: false, error: "Verification service unavailable" });
  }
});

// Protected: Security Audit
app.post("/api/security-audit", payment, async (req, res) => {
  try {
    // Input validation
    const validationError = validateRequired(req.body, ["code"]);
    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    const { code } = req.body;

    // Validate code is a string
    if (typeof code !== "string" || code.trim().length === 0) {
      return res.status(400).json({ error: "Code must be a non-empty string" });
    }

    // Limit code length
    if (code.length > 50000) {
      return res.status(400).json({ error: "Code too long (max 50000 characters)" });
    }

    // Basic security checks
    const issues = [];
    
    if (code.includes("delegatecall") && !code.includes("/* safe */") && !code.includes("// safe")) {
      issues.push({ severity: "high", issue: "delegatecall without safety check" });
    }
    if (code.includes("tx.origin")) {
      issues.push({ severity: "medium", issue: "tx.origin used (use msg.sender)" });
    }
    if (code.includes("selfdestruct") || code.includes("suicide")) {
      issues.push({ severity: "high", issue: "selfdestruct found" });
    }
    if (!code.includes("require(") && !code.includes("revert")) {
      issues.push({ severity: "medium", issue: "No validation checks found" });
    }
    if (code.includes("public") && code.includes("IERC20")) {
      issues.push({ severity: "low", issue: "Consider using internal for token functions" });
    }
    if (code.includes("block.timestamp") || code.includes("block.number")) {
      issues.push({ severity: "low", issue: "Timestamp/block number dependencies may affect portability" });
    }
    if (code.match(/abi\.encodePacked\s*\([^)]+,[^)]+\)/)) {
      issues.push({ severity: "medium", issue: "abi.encodePacked with dynamic types - hash collision risk" });
    }

    res.json({
      issues,
      summary: issues.length === 0 ? "No issues found" : `${issues.length} potential issues`,
      scannedAt: new Date().toISOString()
    });
  } catch (e) {
    console.error(`[ERROR] security-audit: ${e.message}`);
    return res.status(500).json({ error: "Failed to perform security audit", details: e.message });
  }
});

// ============================================================
// SERVER STARTUP
// ============================================================

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`[${new Date().toISOString()}] RyanClaw API v2.0 running on port ${PORT}`);
  console.log(`[${new Date().toISOString()}] Payments go to: ${PAY_TO}`);
  console.log(`[${new Date().toISOString()}] Rate limit: ${RATE_LIMIT_MAX} requests per minute`);
});
