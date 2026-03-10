import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API = process.env.REACT_APP_API_URL || "http://localhost:4000";

export default function Home() {
  const navigate = useNavigate();
  const [alerts, setAlerts] = useState([]);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    // Fetch alerts
    fetch(`${API}/api/alerts`)
      .then(r => r.json())
      .then(d => setAlerts(d.alerts || []))
      .catch(() => {});

    // Fetch quick stats
    fetch(`${API}/api/sales`)
      .then(r => r.json())
      .then(d => setStats(d.summary))
      .catch(() => {});
  }, []);

  const fmt = n => n?.toLocaleString() ?? "—";
  const today = new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  return (
    <div className="home-hero">
      <div className="grid-overlay" />
      <div className="home-content">
        <div className="home-eyebrow">Business Intelligence Platform</div>
        <h1 className="home-title">VALYANA<br /><span>DASHBOARD</span></h1>
        <p className="home-sub">Real-time data · AI insights · Google Sheets</p>

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
          <div className="home-stats">
            <div className="home-stat">
              <div className="home-stat-val">{fmt(stats.totalRevenue)}</div>
              <div className="home-stat-label">Total Revenue</div>
            </div>
            <div className="home-stat">
              <div className="home-stat-val">{fmt(stats.totalNewCustomers)}</div>
              <div className="home-stat-label">Total Customers</div>
            </div>
            <div className="home-stat">
              <div className="home-stat-val">{fmt(stats.avgDailyRevenue)}</div>
              <div className="home-stat-label">Daily Avg Revenue</div>
            </div>
            <div className="home-stat">
              <div className="home-stat-val">{stats.totalDays}</div>
              <div className="home-stat-label">Days Tracked</div>
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

        <div className="home-date">📅 {today}</div>
      </div>
    </div>
  );
}
