import React from 'react';
import { Link } from 'react-router-dom';

const reports = [
  { to: '/sales', icon: '📈', title: 'SALES REPORT', desc: 'Revenue, new customers & daily performance' },
  { to: '/jars', icon: '🫙', title: 'JARS REPORT', desc: 'Deliveries, stock levels & jar tracking' },
  { to: '/incentive', icon: '🏆', title: 'STAFF INCENTIVE', desc: 'Sales performance & incentive calculations' },
];

export default function Home() {
  return (
    <main className="page">
      <section className="home-hero">
        <div className="home-hero-content">
          <h1 className="home-title">VALYANA<br /><span>DASHBOARD</span></h1>
          <p className="home-subtitle">Business Intelligence Platform</p>
          <div className="home-cards">
            {reports.map(r => (
              <Link key={r.to} to={r.to} className="home-card">
                <span className="home-card-icon">{r.icon}</span>
                <span className="home-card-title">{r.title}</span>
                <span className="home-card-desc">{r.desc}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
