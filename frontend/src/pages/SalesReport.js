import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const API = process.env.REACT_APP_API_URL || '';
const TARGET = 3000;
const MEDALS = ["🥇","🥈","🥉"];
const BAR_COLORS = ["#f59e0b","#22c55e","#1e5fcf","#3b82f6","#60a5fa","#94a3b8","#f97316","#a78bfa","#34d399","#fb7185","#facc15","#38bdf8","#4ade80","#c084fc","#f472b6"];

function getStatus(pct) {
  if (pct >= 100) return { label: "Target Achieved!", color: "#22c55e", bg: "#dcfce7", dot: "🟢" };
  if (pct >= 70)  return { label: "On Track",         color: "#f59e0b", bg: "#fef9c3", dot: "🟡" };
  return                 { label: "Behind Target",    color: "#ef4444", bg: "#fee2e2", dot: "🔴" };
}

function AnimatedRing({ pct, color, size = 180 }) {
  const [progress, setProgress] = useState(0);
  const radius = 72, stroke = 13;
  const circ = 2 * Math.PI * radius;
  const clamped = Math.min(pct, 100);

  useEffect(() => {
    let frame, start = null;
    const animate = (ts) => {
      if (!start) start = ts;
      const t = Math.min((ts - start) / 1200, 1);
      const ease = 1 - Math.pow(1 - t, 3);
      setProgress(ease * clamped);
      if (t < 1) frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [clamped]);

  const filled = (progress / 100) * circ;
  return (
    <svg width={size} height={size} viewBox="0 0 180 180">
      <circle cx="90" cy="90" r={radius} fill="none" stroke="#e8f0fe" strokeWidth={stroke} />
      <circle cx="90" cy="90" r={radius} fill="none" stroke={color} strokeWidth={stroke}
        strokeDasharray={`${filled} ${circ}`} strokeLinecap="round" transform="rotate(-90 90 90)" />
      <circle cx="90" cy="90" r={radius} fill="none" stroke={color} strokeWidth={stroke * 0.35}
        strokeDasharray={`${filled} ${circ}`} strokeLinecap="round" transform="rotate(-90 90 90)"
        opacity="0.25" style={{ filter: "blur(3px)" }} />
      <text x="90" y="82" textAnchor="middle" fill="#0a1628" fontSize="28" fontWeight="800"
        fontFamily="'Bebas Neue',sans-serif" letterSpacing="2">{Math.round(progress)}%</text>
      <text x="90" y="104" textAnchor="middle" fill="#4b6b99" fontSize="9"
        fontFamily="'DM Sans',sans-serif" letterSpacing="1.5">OF TARGET</text>
    </svg>
  );
}

function StaffDetail({ s, onBack }) {
  const pct = Math.round((s.jarsSold / TARGET) * 100);
  const st = getStatus(pct);
  const remaining = Math.max(0, TARGET - s.jarsSold);
  const fmt = n => Number(n)?.toLocaleString() ?? "—";
  const bonuses = s.incentive.bonus500 + s.incentive.bonus1000 + s.incentive.bonus3000;

  return (
    <div className="report-wrap">
      <button className="report-back" onClick={onBack}>← Back to Sales Report</button>

      {/* HERO */}
      <div style={{ background: "linear-gradient(135deg,#0a1628,#1a3a6b)", borderRadius: "14px", padding: "2rem", marginBottom: "1.5rem", marginTop: "0.5rem", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: "-40px", right: "-40px", width: "180px", height: "180px", borderRadius: "50%", background: "rgba(59,130,246,0.1)" }} />
        <div style={{ position: "relative" }}>
          <div style={{ fontSize: "2rem", marginBottom: "0.3rem" }}>{MEDALS[s.rank - 1] || `#${s.rank}`}</div>
          <h1 className="report-title" style={{ color: "#fff", textTransform: "capitalize" }}>{s.name}</h1>
          <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap", marginTop: "0.8rem" }}>
            <span style={{ background: "#dbeafe", color: "#1e5fcf", padding: "0.25rem 0.9rem", borderRadius: "20px", fontSize: "0.72rem", fontWeight: 700 }}>Rank #{s.rank} on team</span>
            <span style={{ background: st.bg, color: st.color, padding: "0.25rem 0.9rem", borderRadius: "20px", fontSize: "0.72rem", fontWeight: 700 }}>{st.dot} {st.label}</span>
            <span style={{ background: "#f0fdf4", color: "#16a34a", padding: "0.25rem 0.9rem", borderRadius: "20px", fontSize: "0.72rem", fontWeight: 700 }}>💰 {fmt(s.incentive.total)} K total</span>
          </div>
        </div>
      </div>

      {/* STATS */}
      <div className="stats-grid">
        <div className="stat-card green-card">
          <div className="stat-label">Jars Sold</div>
          <div className="stat-value" style={{ color: st.color }}>{fmt(s.jarsSold)}</div>
          <div className="stat-sub">Target: {fmt(TARGET)} jars</div>
          <div style={{ width: "100%", background: "#e8f0fe", borderRadius: "99px", height: "8px", overflow: "hidden", marginTop: "0.5rem" }}>
            <div style={{ width: `${Math.min(pct,100)}%`, background: st.color, height: "100%", borderRadius: "99px", transition: "width 1.2s" }} />
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Jars Remaining</div>
          <div className="stat-value" style={{ color: remaining === 0 ? "#22c55e" : "#ef4444" }}>{remaining === 0 ? "✅ Done!" : fmt(remaining)}</div>
          <div className="stat-sub">{remaining === 0 ? "Target smashed!" : "still needed"}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Base Earnings</div>
          <div className="stat-value">{fmt(s.incentive.base)} K</div>
          <div className="stat-sub">1.5K × {fmt(s.jarsSold)} jars</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total Earnings</div>
          <div className="stat-value" style={{ color: "#22c55e" }}>{fmt(s.incentive.total)} K</div>
          <div className="stat-sub">base + all bonuses</div>
        </div>
      </div>

      {/* RING */}
      <div className="section-label">🎯 TARGET ACHIEVEMENT</div>
      <div className="chart-card" style={{ textAlign: "center", padding: "2rem", marginBottom: "2rem" }}>
        <div className="chart-title">Jars Target Progress</div>
        <div style={{ display: "flex", justifyContent: "center", margin: "1rem 0" }}>
          <AnimatedRing pct={pct} color={st.color} />
        </div>
        <div style={{ display: "flex", justifyContent: "space-around", borderTop: "1px solid #c5d8f5", paddingTop: "1rem" }}>
          {[["Sold", fmt(s.jarsSold), st.color], ["Target", fmt(TARGET), "#0a1628"], ["Remaining", remaining === 0 ? "✅" : fmt(remaining), remaining === 0 ? "#22c55e" : "#ef4444"]].map(([label, val, color]) => (
            <div key={label} style={{ textAlign: "center" }}>
              <div style={{ fontSize: "0.63rem", color: "#4b6b99", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px" }}>{label}</div>
              <div style={{ fontFamily: "'Bebas Neue'", fontSize: "1.5rem", color, marginTop: "0.2rem" }}>{val}</div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: "1rem", background: st.bg, borderRadius: "10px", padding: "0.65rem 1rem", color: st.color, fontWeight: 700, fontSize: "0.86rem" }}>
          {st.dot} {st.label} — {pct}% of {fmt(TARGET)} jar target
        </div>
      </div>

      {/* INCENTIVE BREAKDOWN */}
      <div className="section-label">💰 INCENTIVE BREAKDOWN</div>
      <div className="table-card" style={{ marginBottom: "2rem" }}>
        <div className="table-header-row">
          <span className="table-title">Earnings Breakdown</span>
          <span className="table-badge">Kwacha</span>
        </div>
        <table className="data-table">
          <thead><tr><th>Type</th><th>Condition</th><th>Status</th><th>Amount</th></tr></thead>
          <tbody>
            <tr>
              <td>Base Pay</td>
              <td>1.5K × every jar</td>
              <td><span style={{ background: "#dcfce7", color: "#22c55e", padding: "0.2rem 0.7rem", borderRadius: "20px", fontSize: "0.72rem", fontWeight: 700 }}>✅ Earned</span></td>
              <td className="td-highlight">{fmt(s.incentive.base)} K</td>
            </tr>
            {[
              { label: "Bonus — Tier 1", cond: "Sell 500+ jars",            earned: s.incentive.bonus500  > 0, amount: "500 K"   },
              { label: "Bonus — Tier 2", cond: "Sell 1,000+ jars",          earned: s.incentive.bonus1000 > 0, amount: "1,000 K" },
              { label: "Bonus — Tier 3", cond: "Sell 3,000+ jars (target)", earned: s.incentive.bonus3000 > 0, amount: "2,500 K" },
            ].map(row => (
              <tr key={row.label} style={{ background: row.earned ? "#f0fdf4" : "#fff9f9" }}>
                <td>{row.label}</td>
                <td>{row.cond}</td>
                <td><span style={{ background: row.earned ? "#dcfce7" : "#fee2e2", color: row.earned ? "#22c55e" : "#ef4444", padding: "0.2rem 0.7rem", borderRadius: "20px", fontSize: "0.72rem", fontWeight: 700 }}>{row.earned ? "✅ Earned" : "❌ Not Yet"}</span></td>
                <td className="td-highlight">{row.earned ? row.amount : "0 K"}</td>
              </tr>
            ))}
            <tr style={{ background: "#f8faff" }}>
              <td style={{ fontWeight: 700 }}>TOTAL</td><td /><td />
              <td style={{ color: "#22c55e", fontWeight: 800, fontSize: "1rem" }}>{fmt(s.incentive.total)} K</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* SUMMARY CARD */}
      <div className="ai-card">
        <div className="ai-inner">
          <div className="ai-header">
            <span className="ai-badge">PERFORMANCE SUMMARY</span>
            <span className="ai-dot" />
            <span className="ai-title" style={{ textTransform: "capitalize" }}>{s.name}</span>
          </div>
          <p className="ai-text">
            <strong style={{ color: "#93c5fd", textTransform: "capitalize" }}>{s.name}</strong> has sold{" "}
            <strong style={{ color: "#93c5fd" }}>{fmt(s.jarsSold)} jars</strong> — {pct}% of the {fmt(TARGET)} jar monthly target.{" "}
            {s.incentive.bonus3000 > 0
              ? `🎉 Full target achieved! Total earnings: ${fmt(s.incentive.total)} K (max payout).`
              : s.incentive.bonus1000 > 0
              ? `Tier 2 bonus unlocked. ${fmt(remaining)} more jars needed for the full 2,500 K bonus. Current earnings: ${fmt(s.incentive.total)} K.`
              : s.incentive.bonus500 > 0
              ? `Tier 1 bonus unlocked. ${fmt(remaining)} more jars to Tier 2. Current earnings: ${fmt(s.incentive.total)} K.`
              : `No bonus yet. Sell ${fmt(500 - s.jarsSold)} more jars to unlock the first 500 K bonus. Current earnings: ${fmt(s.incentive.total)} K.`}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function SalesReport() {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const navigate = useNavigate();
  const fmt = n => Number(n)?.toLocaleString() ?? "—";

  useEffect(() => {
    fetch(`${API}/api/staff-jars`)
      .then(r => r.json())
      .then(d => { setStaff(d.staff || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  // Show individual staff detail
  if (selected) return <StaffDetail s={selected} onBack={() => setSelected(null)} />;

  const totalJars     = staff.reduce((s, m) => s + m.jarsSold, 0);
  const totalEarnings = staff.reduce((s, m) => s + m.incentive.total, 0);
  const achieved      = staff.filter(m => m.jarsSold >= TARGET).length;
  const top           = staff[0];

  return (
    <div className="report-wrap">
      <div className="report-header">
        <div>
          <button className="report-back" onClick={() => navigate("/")}>← Back to Home</button>
          <h1 className="report-title">SALES <span>REPORT</span></h1>
        </div>
      </div>

      {loading ? <div className="loading">⏳ Loading staff data...</div> : (
        <>
          {/* TEAM STATS */}
          <div className="section-label"><span className="today-dot" /> TEAM OVERVIEW</div>
          <div className="stats-grid">
            <div className="stat-card green-card">
              <div className="stat-label">Total Jars Sold</div>
              <div className="stat-value">{fmt(totalJars)}</div>
              <div className="stat-sub">by all {staff.length} staff</div>
            </div>
            <div className="stat-card green-card">
              <div className="stat-label">Total Incentive Payout</div>
              <div className="stat-value">{fmt(Math.round(totalEarnings))} K</div>
              <div className="stat-sub">across all staff</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">🏆 Top Performer</div>
              <div className="stat-value" style={{ fontSize: "1.4rem", textTransform: "capitalize" }}>🥇 {top?.name || "—"}</div>
              <div className="stat-sub">{fmt(top?.jarsSold)} jars sold</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Targets Achieved</div>
              <div className="stat-value">{achieved} / {staff.length}</div>
              <div className="stat-sub">staff hit 3,000 jar target</div>
            </div>
          </div>

          {/* LEADERBOARD */}
          <div className="section-label">🏆 LEADERBOARD — Click a name to view full profile</div>
          <div className="table-card" style={{ marginBottom: "2rem" }}>
            <div className="table-header-row">
              <span className="table-title">Staff Jars Performance</span>
              <span className="table-badge">{staff.length} staff</span>
            </div>
            <div style={{ overflowX: "auto" }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Rank</th><th>Name</th><th>Jars Sold</th>
                    <th>Target Progress</th><th>Status</th>
                    <th>Base Pay</th><th>Bonuses</th><th>Total Earnings</th>
                  </tr>
                </thead>
                <tbody>
                  {staff.map((s, i) => {
                    const pct = Math.round((s.jarsSold / TARGET) * 100);
                    const st = getStatus(pct);
                    const bonuses = s.incentive.bonus500 + s.incentive.bonus1000 + s.incentive.bonus3000;
                    return (
                      <tr key={i} style={i === 0 ? { background: "#fffbeb" } : {}}>
                        <td style={{ fontSize: "1.2rem" }}>{MEDALS[i] || `#${s.rank}`}</td>
                        <td>
                          <button onClick={() => setSelected(s)} style={{ background: "none", border: "none", cursor: "pointer", color: "#1e5fcf", fontWeight: 700, fontSize: "0.88rem", textTransform: "capitalize", fontFamily: "DM Sans", textDecoration: "underline", textDecorationStyle: "dotted", padding: 0 }}>
                            {s.name} →
                          </button>
                        </td>
                        <td className="td-highlight">{fmt(s.jarsSold)}</td>
                        <td>
                          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                            <div style={{ flex: 1, background: "#e8f0fe", borderRadius: "99px", height: "8px", minWidth: "80px" }}>
                              <div style={{ width: `${Math.min(pct,100)}%`, background: st.color, height: "100%", borderRadius: "99px" }} />
                            </div>
                            <span style={{ fontSize: "0.75rem", fontWeight: 700, color: st.color }}>{pct}%</span>
                          </div>
                        </td>
                        <td><span style={{ background: st.bg, color: st.color, padding: "0.2rem 0.7rem", borderRadius: "20px", fontSize: "0.72rem", fontWeight: 700 }}>{st.dot} {st.label}</span></td>
                        <td>{fmt(s.incentive.base)} K</td>
                        <td style={{ color: bonuses > 0 ? "#22c55e" : "#94a3b8", fontWeight: bonuses > 0 ? 700 : 400 }}>{bonuses > 0 ? `+${fmt(bonuses)} K` : "—"}</td>
                        <td style={{ fontWeight: 800 }}>{fmt(s.incentive.total)} K</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* BAR CHART */}
          <div className="section-label">📊 JARS SOLD COMPARISON</div>
          <div className="chart-card" style={{ marginBottom: "2rem" }}>
            <div className="chart-title">Jars Sold by Staff vs Target (3,000)</div>
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={staff} margin={{ top: 10, right: 30, left: 10, bottom: 70 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e8f0fe" />
                <XAxis dataKey="name" tick={{ fontSize: 11, textTransform: "capitalize" }} angle={-35} textAnchor="end" interval={0} />
                <YAxis tick={{ fontSize: 10 }} tickFormatter={v => v.toLocaleString()} />
                <Tooltip formatter={(v, n) => [v.toLocaleString(), n]} />
                <Bar dataKey="jarsSold" name="Jars Sold" radius={[6,6,0,0]}>
                  {staff.map((s, i) => <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </div>
  );
}
