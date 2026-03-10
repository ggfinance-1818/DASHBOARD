import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './index.css';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import SalesReport from './pages/SalesReport';
import JarsReport from './pages/JarsReport';
import IncentiveReport from './pages/IncentiveReport';

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/sales" element={<SalesReport />} />
        <Route path="/jars" element={<JarsReport />} />
        <Route path="/incentive" element={<IncentiveReport />} />
      </Routes>
    </BrowserRouter>
  );
}
