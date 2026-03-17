import React from 'react';
import { NavLink } from 'react-router-dom';

export default function Navbar() {
  return (
    <nav className="navbar">
      <NavLink to="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "0.75rem" }}>
        {/* Mini V emblem */}
        <div style={{
          width: "36px", height: "36px", borderRadius: "50%",
          border: "1px solid rgba(255,255,255,0.3)",
          display: "flex", alignItems: "center", justifyContent: "center",
          background: "rgba(255,255,255,0.05)", flexShrink: 0
        }}>
          <span style={{ fontFamily: "Georgia, serif", fontSize: "1.1rem", color: "#fff", lineHeight: 1 }}>V</span>
        </div>
        {/* Brand text */}
        <div>
          <div style={{ fontFamily: "Georgia, 'Times New Roman', serif", fontSize: "1rem", color: "#fff", letterSpacing: "4px", textTransform: "uppercase", lineHeight: 1.2 }}>VALYANA WATERS</div>
          <div style={{ fontFamily: "Georgia, serif", fontSize: "0.5rem", color: "rgba(255,255,255,0.45)", letterSpacing: "3px", textTransform: "uppercase" }}>PURE · DELIVERED · DAILY</div>
        </div>
      </NavLink>

      <div className="nav-links">
        <NavLink to="/"          className={({ isActive }) => "nav-link" + (isActive ? " active" : "")} end>Home</NavLink>
        <NavLink to="/sales"     className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}>Sales</NavLink>
        <NavLink to="/jars"      className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}>Jars</NavLink>
        <NavLink to="/incentive" className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}>Incentive</NavLink>
      </div>
    </nav>
  );
}
