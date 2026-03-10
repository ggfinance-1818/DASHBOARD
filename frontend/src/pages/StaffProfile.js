import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";

const API = process.env.REACT_APP_API_URL || "http://localhost:4000";
const TARGET = 60000;
const MEDALS = ["🥇", "🥈", "🥉"];

function getStatus(pct) {
  if (pct >= 100) return { label: "Target Achieved!", color: "#22c55e", bg: "#dcfce7", dot: "🟢" };
  if (pct >= 70)  return { label: "On Track",         color: "#f59e0b", bg: "#fef9c3", dot: "🟡" };
  return                 { label: "Behind Target",    color: "#ef4444", bg: "#fee2e2", dot: "🔴" };
}

function AnimatedRing({ pct, color, size = 200 }) {
  const [progress, setProgress] = useState(0);
  const radius = 78, stroke = 14;
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
    <svg width={size} height={size} viewBox="0 0 200 200">
      <circle cx="100" cy="100" r={radius} fill="none" stroke="#e8f0fe" strokeWidth={stroke} />
      <circle cx="100" cy="100" r={radius} fill="none" stroke={color} strokeWidth={stroke}
        strokeDasharray={`${filled} ${circ}`} strokeLinecap="round"
        transform="rotate(-90 100 100)" />
      <circle cx="100" cy="100" r={radius} fill="none" stroke={color} strokeWidth={stroke * 0.35}
        strokeDasharray={`${filled} ${circ}`} strokeLinecap="round"
        transform="rotate(-90 100 100)" opacity="0.25"
        style={{ filter: "blur(3px)" }} />
      <text x="100" y="88" textAnchor="middle" fill="#0a1628" fontSize="30" fontWeight="800"
        fontFamily="'Bebas Neue', sans-serif" letterSpacing="2">
        {Math.round(progress)}%
      </text>
      <text x="100" y="112" textAnchor="middle" fill="#4b6b99" fontSize="10"
        fontFamily="'DM Sans', sans-serif" letterSpacing="1.5">OF TARGET</text>
    </svg>
  );
}

function MiniProgressBar({ value, target, color }) {
  const pct = Math.min((value / target) * 100, 100);
  return (
    <div style={{ width: "100%", background: "#e8f0fe", borderRadius: "99px", height: "8px", overflow: "hidden", marginTop: "0.5rem" }}>
      <div style={{ width: `${pct}%`, background: color, height: "100%", borderRadius: "99px", transition: "width 1.2s cubic-bezier(0.4,0,0.2,1)" }} />
    </div>
  );
}

export default function StaffProfile() {
  const { name } = useParams();
  const navigate = useNavigate();
  const [staffData, setStaffData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API}/api/incentive`)
      .then(r => r.json())
      .then(d => {
        const member = d.staff?.find(s => s.name.toLowerCase() === decodeURIComponent(name).toLowerCase());
        setStaffData(member || null);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [name]);

  if (loading) return (
    <div className="report-wrap" style={{ textAlign: "center", paddingTop: "5rem" }}>
      <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>⏳</div>
      <div style={{ color: "#4b6b99" }}>Loading profile...</div>
    </div>
  );

  if (!staffData) return (
    <div className="report-wrap" style={{ textAlign: "center", paddingTop: "5rem" }}>
      <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>😕</div>
      <div style={{ color: "#4b6b99", marginBottom: "1rem" }}>Staff member not found.</div>
      <button className="btn-apply" onClick={() => navigate("/incentive")}>← Back to Incentive</button>
    </div>
  );

  const marchPct = Math.round((staffData.salesMarch / TARGET) * 100);
  const febPct   = Math.round((staffData.salesFeb   / TARGET) * 100);
  const mSt = getStatus(marchPct);
  const fSt = getStatus(febPct);
  const marchRem = Math.max(0, TARGET - staffData.salesMarch);
  const febRem   = Math.max(0, TARGET - staffData.salesFeb);
  const medal = MEDALS[staffData.rank - 1] || `#${staffData.rank}`;
  const fmt = n => n?.toLocaleString() ?? "—";

  return (
    <div className="report-wrap">

      {/* HEADER */}
      <button className="report-back" onClick={() => navigate("/incentive")}>← Back to Incentive</button>

      <div style={{ background: "linear-gradient(135deg,#0a1628,#1a3a6b)", borderRadius: "14px", padding: "2rem", marginBottom: "1.5rem", marginTop: "0.5rem", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: "-40px", right: "-40px", width: "180px", height: "180px", borderRadius: "50%", background: "rgba(59,130,246,0.1)" }} />
        <div style={{ position: "relative" }}>
          <div style={{ fontSize: "2.5rem", marginBottom: "0.3rem" }}>{medal}</div>
          <h1 className="report-title" style={{ color: "#fff", textTransform: "capitalize" }}>{staffData.name}</h1>
          <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap", marginTop: "0.8rem" }}>
            <span style={{ background: "#dbeafe", color: "#1e5fcf", padding: "0.25rem 0.9rem", borderRadius: "20px", fontSize: "0.72rem", fontWeight: 700 }}>Rank #{staffData.rank} on team</span>
            <span style={{ background: mSt.bg, color: mSt.color, padding: "0.25rem 0.9rem", borderRadius: "20px", fontSize: "0.72rem", fontWeight: 700 }}>{mSt.dot} {mSt.label} (March)</span>
            <span style={{ background: "#f0fdf4", color: "#16a34a", padding: "0.25rem 0.9rem", borderRadius: "20px", fontSize: "0.72rem", fontWeight: 700, textTransform: "capitalize" }}>🎁 {staffData.incentiveType || "TBD"}</span>
          </div>
        </div>
      </div>

      {/* STAT CARDS */}
      <div className="stats-grid">
        <div className="stat-card green-card">
          <div className="stat-label">March Sales (Current)</div>
          <div className="stat-value" style={{ color: mSt.color }}>{fmt(staffData.salesMarch)}</div>
          <div className="stat-sub">Target: {fmt(TARGET)}</div>
          <MiniProgressBar value={staffData.salesMarch} target={TARGET} color={mSt.color} />
          <span className="stat-tag" style={{ color: mSt.color, background: mSt.bg, marginTop: "0.5rem" }}>{mSt.dot} {mSt.label}</span>
        </div>
        <div className="stat-card">
          <div className="stat-label">February Sales</div>
          <div className="stat-value" style={{ color: fSt.color }}>{fmt(staffData.salesFeb)}</div>
          <div className="stat-sub">Target: {fmt(TARGET)}</div>
          <MiniProgressBar value={staffData.salesFeb} target={TARGET} color={fSt.color} />
          <span className="stat-tag" style={{ color: fSt.color, background: fSt.bg, marginTop: "0.5rem" }}>{fSt.dot} {fSt.label}</span>
        </div>
        <div className="stat-card">
          <div className="stat-label">March Gap to Target</div>
          <div className="stat-value" style={{ color: marchRem === 0 ? "#22c55e" : "#ef4444" }}>
            {marchRem === 0 ? "✅ Done!" : fmt(marchRem)}
          </div>
          <div className="stat-sub">{marchRem === 0 ? "Target smashed!" : "still needed this month"}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total Sales (Both Months)</div>
          <div className="stat-value">{fmt(staffData.totalSales)}</div>
          <div className="stat-sub">Feb + March combined</div>
        </div>
      </div>

      {/* RINGS */}
      <div className="section-label">🎯 TARGET ACHIEVEMENT TRACKER</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", marginBottom: "2rem" }}>

        {/* MARCH */}
        <div className="chart-card" style={{ textAlign: "center", padding: "2rem" }}>
          <div className="chart-title">🟢 March — Current Month</div>
          <div style={{ display: "flex", justifyContent: "center", margin: "1rem 0" }}>
            <AnimatedRing pct={marchPct} color={mSt.color} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-around", borderTop: "1px solid #c5d8f5", paddingTop: "1rem" }}>
            {[["Achieved", fmt(staffData.salesMarch), mSt.color], ["Target", fmt(TARGET), "#0a1628"], ["Remaining", marchRem === 0 ? "✅" : fmt(marchRem), marchRem === 0 ? "#22c55e" : "#ef4444"]].map(([label, val, color]) => (
              <div key={label} style={{ textAlign: "center" }}>
                <div style={{ fontSize: "0.63rem", color: "#4b6b99", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px" }}>{label}</div>
                <div style={{ fontFamily: "'Bebas Neue'", fontSize: "1.5rem", color, marginTop: "0.2rem" }}>{val}</div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: "1rem", background: mSt.bg, borderRadius: "10px", padding: "0.65rem 1rem", color: mSt.color, fontWeight: 700, fontSize: "0.86rem" }}>
            {mSt.dot} {mSt.label} — {marchPct}% of monthly target
          </div>
        </div>

        {/* FEBRUARY */}
        <div className="chart-card" style={{ textAlign: "center", padding: "2rem" }}>
          <div className="chart-title">📅 February — Previous Month</div>
          <div style={{ display: "flex", justifyContent: "center", margin: "1rem 0" }}>
            <AnimatedRing pct={febPct} color={fSt.color} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-around", borderTop: "1px solid #c5d8f5", paddingTop: "1rem" }}>
            {[["Achieved", fmt(staffData.salesFeb), fSt.color], ["Target", fmt(TARGET), "#0a1628"], ["Remaining", febRem === 0 ? "✅" : fmt(febRem), febRem === 0 ? "#22c55e" : "#ef4444"]].map(([label, val, color]) => (
              <div key={label} style={{ textAlign: "center" }}>
                <div style={{ fontSize: "0.63rem", color: "#4b6b99", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px" }}>{label}</div>
                <div style={{ fontFamily: "'Bebas Neue'", fontSize: "1.5rem", color, marginTop: "0.2rem" }}>{val}</div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: "1rem", background: fSt.bg, borderRadius: "10px", padding: "0.65rem 1rem", color: fSt.color, fontWeight: 700, fontSize: "0.86rem" }}>
            {fSt.dot} {fSt.label} — {febPct}% of monthly target
          </div>
        </div>
      </div>

      {/* REWARD */}
      <div className="ai-card">
        <div className="ai-inner">
          <div className="ai-header">
            <span className="ai-badge">INCENTIVE REWARD</span>
            <span className="ai-dot" />
            <span className="ai-title" style={{ textTransform: "capitalize" }}>{staffData.name}'s Reward</span>
          </div>
          <p className="ai-text">
            Based on performance, <strong style={{ color: "#93c5fd", textTransform: "capitalize" }}>{staffData.name}</strong> is eligible for a{" "}
            <strong style={{ color: "#fbbf24", textTransform: "capitalize" }}>{staffData.incentiveType || "TBD"}</strong> incentive reward.
            March achievement: <strong style={{ color: "#93c5fd" }}>{marchPct}%</strong> of the {fmt(TARGET)} target.{" "}
            {marchPct >= 100
              ? "🎉 Outstanding — target fully achieved this month!"
              : marchPct >= 70
              ? `Keep pushing — only ${fmt(marchRem)} more needed to hit the full target!`
              : `Needs significant effort — ${fmt(marchRem)} remaining to reach target.`}
          </p>
        </div>
      </div>

    </div>
  );
}
