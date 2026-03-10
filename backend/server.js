require("dotenv").config();
const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();
app.use(cors({ origin: "*", methods: ["GET", "POST", "OPTIONS"], allowedHeaders: ["Content-Type", "Authorization"] }));
app.use(express.json());

const SHEET_ID = process.env.SHEET_ID || "1pEo8w5LkuKh7lBpioWPcq9imXBPKGN8pWGcr4QGLlcg";
const LOW_STOCK_THRESHOLD = 1000;

async function fetchSheet(sheetName) {
  const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(sheetName)}`;
  const response = await axios.get(url);
  const lines = response.data.trim().split("\n");
  const headers = lines[0].split(",").map(h => h.replace(/"/g, "").trim().toLowerCase());
  return lines.slice(1).map(line => {
    const values = line.match(/(".*?"|[^,]+)(?=,|$)/g) || [];
    const obj = {};
    headers.forEach((h, i) => {
      const val = (values[i] || "").replace(/"/g, "").trim();
      obj[h] = isNaN(val) || val === "" ? val : Number(val);
    });
    return obj;
  }).filter(row => Object.values(row).some(v => v !== "" && v !== null && v !== undefined));
}

function getField(row, ...keys) {
  for (const key of keys) {
    const k = key.toLowerCase().trim();
    if (row[k] !== undefined && row[k] !== "") return row[k];
    const found = Object.keys(row).find(r => r.includes(k) || k.includes(r));
    if (found && row[found] !== undefined && row[found] !== "") return row[found];
  }
  return null;
}

function filterByDate(rows, startDate, endDate) {
  if (!startDate && !endDate) return rows;
  return rows.filter(row => {
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

// ── DEBUG ENDPOINT — shows exactly what's in the staff sheet ─────────────────
app.get("/api/debug-staff", async (req, res) => {
  const results = {};
  const tabsToTry = ["staff report", "Staff Report", "staff_report", "Staff Incentive", "staff incentive", "StaffReport"];
  for (const tab of tabsToTry) {
    try {
      const rows = await fetchSheet(tab);
      results[tab] = { success: true, rowCount: rows.length, firstRow: rows[0] || null, headers: rows[0] ? Object.keys(rows[0]) : [] };
    } catch (e) {
      results[tab] = { success: false, error: e.message };
    }
  }
  res.json(results);
});

// ── ALERTS ───────────────────────────────────────────────────────────────────
app.get("/api/alerts", async (req, res) => {
  try {
    const rows = await fetchSheet("Daily Metrics");
    const latest = rows[rows.length - 1] || {};
    const alerts = [];
    const emptyStock = Number(getField(latest, "empty jars in stock", "empty jars") || 0);

    if (emptyStock > 0 && emptyStock < LOW_STOCK_THRESHOLD) {
      alerts.push({ type: "danger", icon: "🚨", title: "Critical Low Stock", message: `Only ${emptyStock.toLocaleString()} empty jars remaining — below the 1,000 threshold. Restock immediately!` });
    } else if (emptyStock > 0 && emptyStock < LOW_STOCK_THRESHOLD * 2) {
      alerts.push({ type: "warning", icon: "⚠️", title: "Stock Running Low", message: `${emptyStock.toLocaleString()} empty jars in stock — approaching low threshold. Consider restocking soon.` });
    }

    if (rows.length >= 2) {
      const today = rows[rows.length - 1];
      const yesterday = rows[rows.length - 2];
      if (today.revenue && yesterday.revenue) {
        const drop = ((yesterday.revenue - today.revenue) / yesterday.revenue) * 100;
        if (drop > 40) {
          alerts.push({ type: "warning", icon: "📉", title: "Revenue Drop Detected", message: `Today's revenue (${today.revenue.toLocaleString()}) is ${Math.round(drop)}% lower than yesterday (${yesterday.revenue.toLocaleString()}).` });
        }
      }
    }

    if (alerts.length === 0) {
      alerts.push({ type: "success", icon: "✅", title: "All Systems Normal", message: "Stock levels and revenue are healthy. Keep up the great work!" });
    }

    res.json({ alerts, latestDate: latest.date || "N/A", emptyStock });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch alerts", details: err.message });
  }
});

// ── SALES ────────────────────────────────────────────────────────────────────
app.get("/api/sales", async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const all = await fetchSheet("Daily Metrics");
    const rows = filterByDate(all, startDate, endDate);
    const totalRevenue = rows.reduce((s, r) => s + (r.revenue || 0), 0);
    const totalNewCustomers = rows.reduce((s, r) => s + (Number(getField(r, "new customers", "customers")) || 0), 0);
    const avgDailyRevenue = rows.length ? Math.round(totalRevenue / rows.length) : 0;
    const peakDay = rows.reduce((best, r) => (!best || r.revenue > best.revenue ? r : best), null);
    res.json({
      summary: { totalRevenue, totalNewCustomers, avgDailyRevenue, totalDays: rows.length, peakDay },
      daily: rows.map(r => ({ date: r.date, revenue: r.revenue, newCustomers: Number(getField(r, "new customers", "customers") || 0) })),
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch sales data", details: err.message });
  }
});

// ── JARS ─────────────────────────────────────────────────────────────────────
app.get("/api/jars", async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const all = await fetchSheet("Daily Metrics");
    const rows = filterByDate(all, startDate, endDate);
    const totalDelivered = rows.reduce((s, r) => s + (Number(getField(r, "jars delivered", "delivered")) || 0), 0);
    const latestRow = rows[rows.length - 1] || {};
    const emptyStock = Number(getField(latestRow, "empty jars in stock", "empty jars") || 0);
    const withCustomers = Number(getField(latestRow, "jars with customers", "with customers") || 0);
    res.json({
      summary: {
        totalDelivered, currentEmptyStock: emptyStock, currentWithCustomers: withCustomers,
        totalDays: rows.length,
        lowStockAlert: emptyStock > 0 && emptyStock < LOW_STOCK_THRESHOLD,
        lowStockWarning: emptyStock > 0 && emptyStock < LOW_STOCK_THRESHOLD * 2,
      },
      daily: rows.map(r => ({
        date: r.date,
        jarsDelivered: Number(getField(r, "jars delivered", "delivered") || 0),
        emptyInStock: Number(getField(r, "empty jars in stock", "empty jars") || 0),
        withCustomers: Number(getField(r, "jars with customers", "with customers") || 0),
      })),
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch jars data", details: err.message });
  }
});

// ── STAFF INCENTIVE ───────────────────────────────────────────────────────────
app.get("/api/incentive", async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const metricsRows = filterByDate(await fetchSheet("Daily Metrics"), startDate, endDate);
    const totalRevenue = metricsRows.reduce((s, r) => s + (r.revenue || 0), 0);
    const totalNewCustomers = metricsRows.reduce((s, r) => s + (Number(getField(r, "new customers", "customers")) || 0), 0);

    let staff = [];
    // Try every possible tab name variation
    const tabNames = ["staff report", "Staff Report", "staff_report", "Staff Incentive", "staff incentive"];
    for (const tab of tabNames) {
      try {
        const raw = await fetchSheet(tab);
        if (raw.length > 0) {
          staff = raw.map((r, i) => {
            const name = String(getField(r, "staff name", "name", "staff") || `Staff ${i+1}`);
            const salesFeb   = Number(getField(r, "total sales feb", "sales feb", "feb", "february") || 0);
            const salesMarch = Number(getField(r, "total sales march", "sales march", "march") || 0);
            const incentiveType = String(getField(r, "incentive", "incentive type", "reward") || "TBD");
            return { name, salesFeb, salesMarch, totalSales: salesFeb + salesMarch, incentiveType, rank: 0 };
          });
          staff.sort((a, b) => b.totalSales - a.totalSales);
          staff.forEach((s, i) => s.rank = i + 1);
          console.log(`✅ Staff loaded from tab: "${tab}" — ${staff.length} members`);
          break;
        }
      } catch (e) {
        console.log(`❌ Tab "${tab}" failed: ${e.message}`);
      }
    }

    res.json({
      summary: {
        totalRevenue, totalNewCustomers,
        estimatedIncentivePool: Math.round(totalRevenue * 0.05),
        totalDays: metricsRows.length,
        staffCount: staff.length,
        topPerformer: staff[0]?.name || null,
      },
      daily: metricsRows.map(r => ({
        date: r.date, revenue: r.revenue,
        newCustomers: Number(getField(r, "new customers", "customers") || 0),
        incentiveEarned: Math.round((r.revenue || 0) * 0.05),
      })),
      staff,
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch incentive data", details: err.message });
  }
});

// ── AI SUMMARY ───────────────────────────────────────────────────────────────
app.post("/api/ai-summary", async (req, res) => {
  try {
    const { data, reportType } = req.body;
    const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
    if (!ANTHROPIC_API_KEY) return res.json({ summary: "AI summary unavailable — API key not configured." });

    let prompt = "";
    if (reportType === "sales") {
      prompt = `You are a business analyst for Valyana, a water/beverage jar delivery company. Analyze: Total Revenue: ${data.summary.totalRevenue?.toLocaleString()}, New Customers: ${data.summary.totalNewCustomers}, Avg Daily: ${data.summary.avgDailyRevenue?.toLocaleString()}, Days: ${data.summary.totalDays}, Peak: ${data.summary.peakDay?.date} at ${data.summary.peakDay?.revenue?.toLocaleString()}. Give 3-4 sentence insight. No bullet points.`;
    } else if (reportType === "jars") {
      prompt = `You are a logistics analyst for Valyana. Analyze: Delivered: ${data.summary.totalDelivered}, Stock: ${data.summary.currentEmptyStock}, With Customers: ${data.summary.currentWithCustomers}, Days: ${data.summary.totalDays}. ${data.summary.lowStockAlert ? "URGENT: Stock critically low!" : ""} Give 3-4 sentence insight. No bullet points.`;
    } else {
      const topStaff = data.staff?.slice(0,3).map(s => `${s.name}: ${s.totalSales?.toLocaleString()}`).join(", ") || "N/A";
      prompt = `You are a sales analyst for Valyana. Staff: ${data.summary.staffCount}, Top performers: ${topStaff}. Revenue: ${data.summary.totalRevenue?.toLocaleString()}, Incentive Pool: ${data.summary.estimatedIncentivePool?.toLocaleString()}. Give 3-4 motivating sentence insight. No bullet points.`;
    }

    const response = await axios.post("https://api.anthropic.com/v1/messages", {
      model: "claude-sonnet-4-20250514", max_tokens: 1000,
      messages: [{ role: "user", content: prompt }],
    }, { headers: { "Content-Type": "application/json", "x-api-key": ANTHROPIC_API_KEY, "anthropic-version": "2023-06-01" } });

    res.json({ summary: response.data.content?.map(b => b.text || "").join("") || "No summary." });
  } catch (err) {
    console.error("AI error:", err.message);
    res.json({ summary: "AI summary temporarily unavailable." });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, "0.0.0.0", () => console.log(`Valyana Backend running on port ${PORT}`));
