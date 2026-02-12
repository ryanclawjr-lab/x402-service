const express = require("express");
const { paymentMiddleware } = require("x402-express");

const app = express();
app.use(express.json());

// Your wallet address for receiving payments
const PAY_TO = "0x71f08aEfe062d28c7AD37344dC0D64e0adF8941E";

// x402 payment middleware
const payment = paymentMiddleware(PAY_TO, {
  "GET /api/status": {
    price: "$0.001",
    network: "base",
    config: {
      description: "Agent status check - returns identity and capabilities",
    },
  },
  "POST /api/memory-query": {
    price: "$0.005",
    network: "base",
    config: {
      description: "Query memory store for relevant context",
      inputSchema: {
        bodyType: "json",
        bodyFields: {
          query: { type: "string", description: "Search query" },
        },
      },
    },
  },
  "GET /api/verify-agent": {
    price: "$0.01",
    network: "base",
    config: {
      description: "Verify ERC-8004 agent identity and reputation",
      inputSchema: {
        queryParams: {
          agentId: { type: "string", description: "Agent ID to verify" },
        },
      },
    },
  },
});

// Health check (free)
app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "hawkeye-agent-api" });
});

// Protected endpoints
app.get("/api/status", payment, (req, res) => {
  res.json({
    service: "Hawkeye Agent API",
    version: "1.0.0",
    agentId: "2079",
    capabilities: ["security-audit", "memory-storage", "contract-verification"],
  });
});

app.post("/api/memory-query", payment, (req, res) => {
  const { query } = req.body;
  res.json({
    query,
    result: "Memory query processed",
    credits: "This is a placeholder for memory search functionality",
  });
});

app.get("/api/verify-agent", payment, (req, res) => {
  const { agentId } = req.query;
  res.json({
    agentId,
    verified: true,
    reputation: "pending",
    timestamp: new Date().toISOString(),
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Hawkeye API running on port ${PORT}`);
  console.log(`Payments go to: ${PAY_TO}`);
});
