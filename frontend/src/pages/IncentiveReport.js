import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DateFilter from "../components/DateFilter";
import AISummary from "../components/AISummary";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";

const API = process.env.REACT_APP_API_URL || "http://localhost:4000";
const TARGET = 60000;
const MEDALS = ["🥇", "🥈", "🥉"];
const BAR_COLORS = ["#f59e0b", "#94a3b8", "#b45309", "#1e5fcf", "#3b82f6", "#60a5fa"];

function getStatus(pct) {
  if (pct >= 100) return { label: "Achieved", color: "#22c55e", bg: "#dcfce7", dot: "🟢" };
  if (pct >= 70)  return { label: "On Track", color: "#f59e0b", bg: "#fef9c3", dot: "🟡" };
  return { label: "Behind", color: "#ef4444", bg: "#fee2e2", dot: "🔴" };
}

export default function IncentiveReport() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filtered, setFiltered] = useState(false);
  const navigate = useNavigate();

  const load = async (from = "", to = "") => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (from) params.append("startDate", from);
      if (to) params.append("endDate", to);
      const res = await fetch(`${API}/api/incentive?${params}`);
      setData(await res.json());
      setFiltered(!!(from || to));
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const fmt = n => n?.toLocaleString() ?? "—";
  const today = data?.daily?.[data.daily.length - 1];

  return (
    <div className="report-wrap">
      <div className="report-header">
        <div>
          <button className="report-back" onClick={() => window.history.back()}>← Back</button>
          <h1 className="report-title">STAFF <span>INCENTIVE</span></h1>
        </div>
        <DateFilter onApply={(f, t) => load(f, t)} />
      </div>

      {filtered && (
        <div className="filter-banner">
          📅 Filtered view &nbsp;—&nbsp;
          <button className="btn-link" onClick={() => load()}>Clear filter</button>
        </div>
      )}

      {loading ? <div className="loading">⏳ Loading staff data...</div> : (
        <>
          <div className="section-label">
            {filtered ? "📊 FILTERED PERIOD" : <><span className="today-dot" /> TODAY</>}
          </div>

          {/* SUMMARY STATS */}
          <div className="stats-grid">
            <div className={`stat-card ${!filtered ? "green-card" : ""}`}>
              <div className="stat-label">{filtered ? "Total Revenue" : "Today's Revenue"}</div>
              <div className="stat-value">{filtered ? fmt(data?.summary?.totalRevenue) : fmt(today?.revenue)}</div>
              <div className="stat-sub">{filtered ? `${data?.summary?.totalDays} days` : "today"}</div>
            </div>
            <div className={`stat-card ${!filtered ? "green-card" : ""}`}>
              <div className="stat-label">{filtered ? "Total Incentive Pool" : "Today's Incentive"}</div>
              <div className="stat-value">{filtered ? fmt(data?.summary?.estimatedIncentivePool) : fmt(today ? Math.round(today.revenue * 0.05) : null)}</div>
              <div className="stat-sub">5% of revenue</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">🏆 Top Performer</div>
              <div className="stat-value" style={{ fontSize: "1.5rem", textTransform: "capitalize" }}>
                🥇 {data?.summary?.topPerformer || "—"}
              </div>
              <div className="stat-sub">highest total sales</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Total Staff</div>
              <div className="stat-value">{data?.summary?.staffCount || 0}</div>
              <div className="stat-sub">active team members</div>
            </div>
          </div>

          <AISummary data={data} reportType="incentive" />

          {/* STAFF LEADERBOARD */}
          {data?.staff?.length > 0 && (
            <>
              <div className="section-label">🏆 STAFF LEADERBOARD — Click a name to view profile</div>
              <div className="table-card" style={{ marginBottom: "2rem" }}>
                <div className="table-header-row">
                  <span className="table-title">Individual Performance</span>
                  <span className="table-badge">{data.staff.length} staff</span>
                </div>
                <div style={{ overflowX: "auto" }}>
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Rank</th>
                        <th>Staff Name</th>
                        <th>Feb Sales</th>
                        <th>March Sales</th>
                        <th>Total Sales</th>
                        <th>March Target</th>
                        <th>Status</th>
                        <th>Incentive</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.staff.map((s, i) => {
                        const pct = Math.round((s.salesMarch / TARGET) * 100);
                        const status = getStatus(pct);
                        return (
                          <tr key={i} style={i === 0 ? { background: "#fffbeb" } : {}}>
                            <td style={{ fontSize: "1.3rem" }}>{MEDALS[i] || `#${s.rank}`}</td>
                            <td>
                              {/* CLICKABLE NAME */}
                              <button
                                onClick={() => navigate(`/staff/${encodeURIComponent(s.name)}`)}
                                style={{
                                  background: "none", border: "none", cursor: "pointer",
                                  color: "#1e5fcf", fontWeight: 700, fontSize: "0.92rem",
                                  textTransform: "capitalize", fontFamily: "DM Sans",
                                  textDecoration: "underline", textDecorationStyle: "dotted",
                                  padding: 0
                                }}
                              >
                                {s.name} →
                              </button>
                            </td>
                            <td>{fmt(s.salesFeb)}</td>
                            <td className="td-highlight">{fmt(s.salesMarch)}</td>
                            <td style={{ fontWeight: 700 }}>{fmt(s.totalSales)}</td>
                            <td>
                              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                <div style={{ flex: 1, background: "#e8f0fe", borderRadius: "99px", height: "8px", minWidth: "60px" }}>
                                  <div style={{ width: `${Math.min(pct, 100)}%`, background: status.color, height: "100%", borderRadius: "99px" }} />
                                </div>
                                <span style={{ fontSize: "0.75rem", fontWeight: 700, color: status.color }}>{pct}%</span>
                              </div>
                            </td>
                            <td>
                              <span style={{ background: status.bg, color: status.color, padding: "0.2rem 0.7rem", borderRadius: "20px", fontSize: "0.72rem", fontWeight: 700 }}>
                                {status.dot} {status.label}
                              </span>
                            </td>
                            <td>
                              <span style={{ background: "#dbeafe", color: "#1e5fcf", padding: "0.2rem 0.7rem", borderRadius: "20px", fontSize: "0.72rem", fontWeight: 700, textTransform: "capitalize" }}>
                                🎁 {s.incentiveType}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* CHARTS */}
              <div className="charts-grid">
                <div className="chart-card">
                  <div className="chart-title">Total Sales by Staff</div>
                  <ResponsiveContainer width="100%" height={240}>
                    <BarChart data={data.staff} layout="vertical" margin={{ left: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e8f0fe" horizontal={false} />
                      <XAxis type="number" tick={{ fontSize: 10 }} tickFormatter={v => v.toLocaleString()} />
                      <YAxis type="category" dataKey="name" tick={{ fontSize: 11, textTransform: "capitalize" }} width={55} />
                      <Tooltip formatter={v => v.toLocaleString()} />
                      <Bar dataKey="totalSales" radius={[0,6,6,0]}>
                        {data.staff.map((_, i) => <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="chart-card">
                  <div className="chart-title">Feb vs March per Staff</div>
                  <ResponsiveContainer width="100%" height={240}>
                    <BarChart data={data.staff}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e8f0fe" />
                      <XAxis dataKey="name" tick={{ fontSize: 10, textTransform: "capitalize" }} />
                      <YAxis tick={{ fontSize: 10 }} tickFormatter={v => v.toLocaleString()} />
                      <Tooltip formatter={v => v.toLocaleString()} />
                      <Bar dataKey="salesFeb" name="Feb" fill="#1e5fcf" radius={[4,4,0,0]} />
                      <Bar dataKey="salesMarch" name="March" fill="#22c55e" radius={[4,4,0,0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </>
          )}

          {/* DAILY TABLE */}
          <div className="section-label">📅 DAILY BREAKDOWN</div>
          <div className="table-card">
            <div className="table-header-row">
              <span className="table-title">Daily Incentive Breakdown</span>
              <span className="table-badge">{data?.daily?.length} records</span>
            </div>
            <div style={{ overflowX: "auto" }}>
              <table className="data-table">
                <thead><tr><th>Date</th><th>Revenue</th><th>New Customers</th><th>Incentive (5%)</th></tr></thead>
                <tbody>
                  {data?.daily?.map((r, i) => (
                    <tr key={i}>
                      <td>{r.date}</td>
                      <td>{fmt(r.revenue)}</td>
                      <td>{r.newCustomers}</td>
                      <td className="td-highlight">{fmt(r.incentiveEarned)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
