import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API = process.env.REACT_APP_API_URL || "http://localhost:4000";

export default function Home() {
  const navigate = useNavigate();
  const [alerts, setAlerts] = useState([]);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetch(`${API}/api/alerts`)
      .then(r => r.json())
      .then(d => setAlerts(d.alerts || []))
      .catch(() => {});

    fetch(`${API}/api/sales`)
      .then(r => r.json())
      .then(d => setStats(d.summary))
      .catch(() => {});
  }, []);

  const fmt = n => n?.toLocaleString() ?? "—";
  const today = new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  return (
    <div className="home-hero">
      <div className="home-hero-content">

        {/* LOGO EMBLEM */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: "2rem" }}>
          {/* Circle with V */}
          <div style={{
            width: "90px", height: "90px", borderRadius: "50%",
            border: "2px solid rgba(255,255,255,0.4)",
            display: "flex", alignItems: "center", justifyContent: "center",
            marginBottom: "1rem", position: "relative",
            background: "rgba(255,255,255,0.05)",
            boxShadow: "0 0 40px rgba(96,165,250,0.15)"
          }}>
            {/* Water wave lines */}
            <svg width="90" height="90" viewBox="0 0 90 90" style={{ position: "absolute", top: 0, left: 0 }}>
              <circle cx="45" cy="45" r="43" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="1"/>
              {/* Wave */}
              <path d="M20 52 Q27 46 34 52 Q41 58 48 52 Q55 46 62 52 Q69 58 70 54" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="1.2"/>
              <path d="M22 57 Q29 51 36 57 Q43 63 50 57 Q57 51 64 57 Q68 61 70 58" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1"/>
            </svg>
            <span style={{
              fontFamily: "'Georgia', 'Times New Roman', serif",
              fontSize: "2.2rem", color: "#fff", fontWeight: 400,
              letterSpacing: "2px", position: "relative", zIndex: 1,
              textShadow: "0 2px 12px rgba(96,165,250,0.4)"
            }}>V</span>
          </div>

          {/* Brand Name */}
          <h1 style={{
            fontFamily: "'Georgia', 'Times New Roman', serif",
            fontSize: "clamp(1.8rem, 4vw, 2.8rem)",
            color: "#ffffff",
            letterSpacing: "8px",
            fontWeight: 400,
            textTransform: "uppercase",
            marginBottom: "0.5rem",
            textShadow: "0 2px 20px rgba(0,0,0,0.3)"
          }}>VALYANA DASHBOARD</h1>

          {/* Tagline */}
          <p style={{
            color: "rgba(255,255,255,0.55)",
            fontSize: "0.75rem",
            letterSpacing: "5px",
            textTransform: "uppercase",
            fontFamily: "'Georgia', serif",
            fontWeight: 400,
          }}>PURE · DELIVERED · DAILY</p>
        </div>

        {/* Divider */}
        <div style={{ width: "60px", height: "1px", background: "rgba(255,255,255,0.2)", margin: "0 auto 2rem" }} />

        {/* ALERTS */}
        {alerts.length > 0 && (
          <div className="alerts-panel">
            {alerts.map((a, i) => (
              <div key={i} className={`alert-item alert-${a.type}`}>
                <span className="alert-icon">{a.icon}</span>
                <div>
                  <div className="alert-title">{a.title}</div>
                  <div className="alert-msg">{a.message}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* QUICK STATS */}
        {stats && (
          <div style={{ display: "flex", gap: "2.5rem", justifyContent: "center", flexWrap: "wrap", marginBottom: "3rem" }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "2rem", color: "#fff", letterSpacing: "2px" }}>{fmt(stats.totalRevenue)}</div>
              <div style={{ color: "rgba(255,255,255,0.45)", fontSize: "0.65rem", letterSpacing: "2px", textTransform: "uppercase", fontFamily: "Georgia, serif" }}>Total Revenue</div>
            </div>
            <div style={{ width: "1px", background: "rgba(255,255,255,0.15)" }} />
            <div style={{ textAlign: "center" }}>
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "2rem", color: "#fff", letterSpacing: "2px" }}>{fmt(stats.totalNewCustomers)}</div>
              <div style={{ color: "rgba(255,255,255,0.45)", fontSize: "0.65rem", letterSpacing: "2px", textTransform: "uppercase", fontFamily: "Georgia, serif" }}>Customers</div>
            </div>
            <div style={{ width: "1px", background: "rgba(255,255,255,0.15)" }} />
            <div style={{ textAlign: "center" }}>
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "2rem", color: "#fff", letterSpacing: "2px" }}>{fmt(stats.avgDailyRevenue)}</div>
              <div style={{ color: "rgba(255,255,255,0.45)", fontSize: "0.65rem", letterSpacing: "2px", textTransform: "uppercase", fontFamily: "Georgia, serif" }}>Daily Avg</div>
            </div>
            <div style={{ width: "1px", background: "rgba(255,255,255,0.15)" }} />
            <div style={{ textAlign: "center" }}>
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "2rem", color: "#fff", letterSpacing: "2px" }}>{stats.totalDays}</div>
              <div style={{ color: "rgba(255,255,255,0.45)", fontSize: "0.65rem", letterSpacing: "2px", textTransform: "uppercase", fontFamily: "Georgia, serif" }}>Days Tracked</div>
            </div>
          </div>
        )}

        {/* REPORT CARDS */}
        <div className="home-cards">
          <div className="home-card" onClick={() => navigate("/sales")}>
            <span className="home-card-icon">📈</span>
            <span className="home-card-title">SALES REPORT</span>
            <span className="home-card-desc">Revenue, customers & daily performance</span>
          </div>
          <div className="home-card" onClick={() => navigate("/jars")}>
            <span className="home-card-icon">🫙</span>
            <span className="home-card-title">JARS REPORT</span>
            <span className="home-card-desc">Deliveries, stock levels & tracking</span>
          </div>
          <div className="home-card" onClick={() => navigate("/incentive")}>
            <span className="home-card-icon">🏆</span>
            <span className="home-card-title">STAFF INCENTIVE</span>
            <span className="home-card-desc">Performance & incentive calculations</span>
          </div>
        </div>

        <div style={{ color: "rgba(255,255,255,0.25)", fontSize: "0.72rem", marginTop: "2.5rem", letterSpacing: "1.5px", fontFamily: "Georgia, serif" }}>
          📅 {today}
        </div>

      </div>
    </div>
  );
}
