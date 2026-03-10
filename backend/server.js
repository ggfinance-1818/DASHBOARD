require("dotenv").config();
const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();
app.use(cors({ origin: "*", methods: ["GET", "POST", "OPTIONS"], allowedHeaders: ["Content-Type", "Authorization"] }));
app.use(express.json());

const SHEET_ID = process.env.SHEET_ID || "1pEo8w5LkuKh7lBpioWPcq9imXBPKGN8pWGcr4QGLlcg";
const SHEET_NAME = "Daily Metrics";

async function fetchSheetData() {
  const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(SHEET_NAME)}`;
  const response = await axios.get(url);
  const raw = response.data;
  const lines = raw.trim().split("\n");
  const headers = lines[0].split(",").map((h) => h.replace(/"/g, "").trim());
  const rows = lines.slice(1).map((line) => {
    const values = line.match(/(".*?"|[^,]+)(?=,|$)/g) || [];
    const obj = {};
    headers.forEach((h, i) => {
      const val = (values[i] || "").replace(/"/g, "").trim();
      obj[h] = isNaN(val) || val === "" ? val : Number(val);
    });
    return obj;
  });
  return rows;
}

// FIXED date filter - handles date format properly
function filterByDate(rows, startDate, endDate) {
  if (!startDate && !endDate) return rows;
  return rows.filter((row) => {
    const d = String(row.date || "").trim().slice(0, 10);
    if (!d) return false;
    const start = startDate ? String(startDate).trim().slice(0, 10) : null;
    const end = endDate ? String(endDate).trim().slice(0, 10) : null;
    if (start && d < start) return false;
    if (end && d > end) return false;
    return true;
  });
}

app.get("/api/health", (req, res) => res.json({ status: "ok", timestamp: new Date().toISOString() }));

app.get("/api/sales", async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const all = await fetchSheetData();
    const rows = filterByDate(all, startDate, endDate);
    const totalRevenue = rows.reduce((sum, r) => sum + (r.revenue || 0), 0);
    const totalNewCustomers = rows.reduce((sum, r) => sum + (r["new customers"] || 0), 0);
    const avgDailyRevenue = rows.length ? Math.round(totalRevenue / rows.length) : 0;
    const peakDay = rows.reduce((best, r) => (!best || r.revenue > best.revenue ? r : best), null);
    res.json({
      summary: { totalRevenue, totalNewCustomers, avgDailyRevenue, totalDays: rows.length, peakDay },
      daily: rows.map((r) => ({ date: r.date, revenue: r.revenue, newCustomers: r["new customers"] })),
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch sales data", details: err.message });
  }
});

app.get("/api/jars", async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const all = await fetchSheetData();
    const rows = filterByDate(all, startDate, endDate);
    const totalDelivered = rows.reduce((sum, r) => sum + (r["jars delivered"] || 0), 0);
    const latestRow = rows[rows.length - 1] || {};
    res.json({
      summary: { totalDelivered, currentEmptyStock: latestRow["Empty jars in stock"] || 0, currentWithCustomers: latestRow["Jars with customers"] || 0, totalDays: rows.length },
      daily: rows.map((r) => ({ date: r.date, jarsDelivered: r["jars delivered"], emptyInStock: r["Empty jars in stock"], withCustomers: r["Jars with customers"] })),
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch jars data", details: err.message });
  }
});

app.get("/api/incentive", async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const all = await fetchSheetData();
    const rows = filterByDate(all, startDate, endDate);
    const totalRevenue = rows.reduce((sum, r) => sum + (r.revenue || 0), 0);
    const totalNewCustomers = rows.reduce((sum, r) => sum + (r["new customers"] || 0), 0);
    res.json({
      summary: { totalRevenue, totalNewCustomers, estimatedIncentivePool: Math.round(totalRevenue * 0.05), totalDays: rows.length },
      daily: rows.map((r) => ({ date: r.date, revenue: r.revenue, newCustomers: r["new customers"], incentiveEarned: Math.round((r.revenue || 0) * 0.05) })),
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch incentive data", details: err.message });
  }
});

app.post("/api/ai-summary", async (req, res) => {
  try {
    const { data, reportType } = req.body;
    const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
    if (!ANTHROPIC_API_KEY) return res.json({ summary: "AI summary unavailable — API key not configured." });

    let prompt = "";
    if (reportType === "sales") {
      prompt = `You are a business analyst for Valyana, a water/beverage jar delivery company. Analyze this sales data and give a clear, helpful 3-4 sentence business insight. Total Revenue: ${data.summary.totalRevenue?.toLocaleString()}, New Customers: ${data.summary.totalNewCustomers}, Avg Daily Revenue: ${data.summary.avgDailyRevenue?.toLocaleString()}, Days: ${data.summary.totalDays}, Peak Day: ${data.summary.peakDay?.date} at ${data.summary.peakDay?.revenue?.toLocaleString()}. No bullet points, plain English.`;
    } else if (reportType === "jars") {
      prompt = `You are a logistics analyst for Valyana. Analyze: Total Delivered: ${data.summary.totalDelivered}, Empty Stock: ${data.summary.currentEmptyStock}, With Customers: ${data.summary.currentWithCustomers}, Days: ${data.summary.totalDays}. Give 3-4 sentence operational insight. No bullet points.`;
    } else {
      prompt = `You are a sales analyst for Valyana. Analyze: Total Revenue: ${data.summary.totalRevenue?.toLocaleString()}, New Customers: ${data.summary.totalNewCustomers}, Incentive Pool: ${data.summary.estimatedIncentivePool?.toLocaleString()}, Days: ${data.summary.totalDays}. Give 3-4 sentence motivating insight. No bullet points.`;
    }

    const response = await axios.post("https://api.anthropic.com/v1/messages", {
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      messages: [{ role: "user", content: prompt }],
    }, {
      headers: { "Content-Type": "application/json", "x-api-key": ANTHROPIC_API_KEY, "anthropic-version": "2023-06-01" },
    });

    const text = response.data.content?.map(b => b.text || "").join("") || "No summary available.";
    res.json({ summary: text });
  } catch (err) {
    console.error("AI error:", err.message);
    res.json({ summary: "AI summary temporarily unavailable." });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, "0.0.0.0", () => console.log(`Valyana Backend running on port ${PORT}`));
