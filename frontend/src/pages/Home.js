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
        <div style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.8rem", letterSpacing: "3px", textTransform: "uppercase", marginBottom: "1rem" }}>
          Business Intelligence Platform
        </div>

        <h1 className="home-title">VALYANA<br /><span>DASHBOARD</span></h1>

        <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.9rem", letterSpacing: "2px", textTransform: "uppercase", marginBottom: "2.5rem" }}>
          Real-time data · AI insights · Google Sheets
        </p>

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
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "2.2rem", color: "#fff", letterSpacing: "2px" }}>{fmt(stats.totalRevenue)}</div>
              <div style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.72rem", letterSpacing: "1.5px", textTransform: "uppercase" }}>Total Revenue</div>
            </div>
            <div style={{ width: "1px", background: "rgba(255,255,255,0.15)" }} />
            <div style={{ textAlign: "center" }}>
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "2.2rem", color: "#fff", letterSpacing: "2px" }}>{fmt(stats.totalNewCustomers)}</div>
              <div style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.72rem", letterSpacing: "1.5px", textTransform: "uppercase" }}>Total Customers</div>
            </div>
            <div style={{ width: "1px", background: "rgba(255,255,255,0.15)" }} />
            <div style={{ textAlign: "center" }}>
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "2.2rem", color: "#fff", letterSpacing: "2px" }}>{fmt(stats.avgDailyRevenue)}</div>
              <div style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.72rem", letterSpacing: "1.5px", textTransform: "uppercase" }}>Daily Avg Revenue</div>
            </div>
            <div style={{ width: "1px", background: "rgba(255,255,255,0.15)" }} />
            <div style={{ textAlign: "center" }}>
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "2.2rem", color: "#fff", letterSpacing: "2px" }}>{stats.totalDays}</div>
              <div style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.72rem", letterSpacing: "1.5px", textTransform: "uppercase" }}>Days Tracked</div>
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

        <div style={{ color: "rgba(255,255,255,0.35)", fontSize: "0.78rem", marginTop: "2.5rem", letterSpacing: "1px" }}>
          📅 {today}
        </div>
      </div>
    </div>
  );
}
