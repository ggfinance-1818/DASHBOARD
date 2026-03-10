import React from "react";
import { BrowserRouter, Routes, Route, NavLink } from "react-router-dom";
import Home from "./pages/Home";
import SalesReport from "./pages/SalesReport";
import JarsReport from "./pages/JarsReport";
import IncentiveReport from "./pages/IncentiveReport";
import StaffProfile from "./pages/StaffProfile";

function Navbar() {
  return (
    <nav className="navbar">
      <NavLink to="/" className="navbar-brand">VALYANA <span>DASH</span></NavLink>
      <div className="nav-links">
        <NavLink to="/"         className={({isActive}) => "nav-link" + (isActive ? " active" : "")} end>Home</NavLink>
        <NavLink to="/sales"    className={({isActive}) => "nav-link" + (isActive ? " active" : "")}>Sales</NavLink>
        <NavLink to="/jars"     className={({isActive}) => "nav-link" + (isActive ? " active" : "")}>Jars</NavLink>
        <NavLink to="/incentive" className={({isActive}) => "nav-link" + (isActive ? " active" : "")}>Incentive</NavLink>
      </div>
    </nav>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/"               element={<Home />} />
        <Route path="/sales"          element={<SalesReport />} />
        <Route path="/jars"           element={<JarsReport />} />
        <Route path="/incentive"      element={<IncentiveReport />} />
        <Route path="/staff/:name"    element={<StaffProfile />} />
      </Routes>
    </BrowserRouter>
  );
}
