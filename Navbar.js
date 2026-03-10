import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function Navbar() {
  const { pathname } = useLocation();
  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">VALYANA <span>DASH</span></Link>
      <div className="nav-links">
        <Link to="/" className={`nav-link ${pathname === '/' ? 'active' : ''}`}>Home</Link>
        <Link to="/sales" className={`nav-link ${pathname === '/sales' ? 'active' : ''}`}>Sales</Link>
        <Link to="/jars" className={`nav-link ${pathname === '/jars' ? 'active' : ''}`}>Jars</Link>
        <Link to="/incentive" className={`nav-link ${pathname === '/incentive' ? 'active' : ''}`}>Incentive</Link>
      </div>
    </nav>
  );
}
