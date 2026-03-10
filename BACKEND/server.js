require("dotenv").config();
const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();
app.use(cors());
app.use(express.json());

const SHEET_ID = process.env.SHEET_ID || "1pEo8w5LkuKh7lBpioWPcq9imXBPKGN8pWGcr4QGLlcg";
const SHEET_NAME = "Daily Metrics";

// Fetch all data from Google Sheets (public CSV export)
async function fetchSheetData() {
  const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(SHEET_NAME)}`;
  const response = await axios.get(url);
  const raw = response.data;

  // Parse CSV
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

// Filter rows by date range
function filterByDate(rows, startDate, endDate) {
  if (!startDate && !endDate) return rows;
  return rows.filter((row) => {
    const d = row.date;
    if (!d) return false;
    if (startDate && d < startDate) return false;
    if (endDate && d > endDate) return false;
    return true;
  });
}

// GET /api/sales - Sales Report
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
      daily: rows.map((r) => ({
        date: r.date,
        revenue: r.revenue,
        newCustomers: r["new customers"],
      })),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch sales data", details: err.message });
  }
});

// GET /api/jars - Jars Report
app.get("/api/jars", async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const all = await fetchSheetData();
    const rows = filterByDate(all, startDate, endDate);

    const totalDelivered = rows.reduce((sum, r) => sum + (r["jars delivered"] || 0), 0);
    const latestRow = rows[rows.length - 1] || {};
    const emptyInStock = latestRow["Empty jars in stock"] || 0;
    const withCustomers = latestRow["Jars with customers"] || 0;

    res.json({
      summary: {
        totalDelivered,
        currentEmptyStock: emptyInStock,
        currentWithCustomers: withCustomers,
        totalDays: rows.length,
      },
      daily: rows.map((r) => ({
        date: r.date,
        jarsDelivered: r["jars delivered"],
        emptyInStock: r["Empty jars in stock"],
        withCustomers: r["Jars with customers"],
      })),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch jars data", details: err.message });
  }
});

// GET /api/incentive - Sales Staff Incentive Report (placeholder - ready for staff sheet)
app.get("/api/incentive", async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const all = await fetchSheetData();
    const rows = filterByDate(all, startDate, endDate);

    // Derived incentive data from sales (until staff sheet is connected)
    const totalRevenue = rows.reduce((sum, r) => sum + (r.revenue || 0), 0);
    const totalNewCustomers = rows.reduce((sum, r) => sum + (r["new customers"] || 0), 0);

    res.json({
      summary: {
        totalRevenue,
        totalNewCustomers,
        estimatedIncentivePool: Math.round(totalRevenue * 0.05),
        note: "Connect staff sheet to see individual incentives",
      },
      daily: rows.map((r) => ({
        date: r.date,
        revenue: r.revenue,
        newCustomers: r["new customers"],
        incentiveEarned: Math.round((r.revenue || 0) * 0.05),
      })),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch incentive data", details: err.message });
  }
});

// GET /api/health
app.get("/api/health", (req, res) => res.json({ status: "ok", timestamp: new Date().toISOString() }));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Valyana Backend running on port ${PORT}`));
