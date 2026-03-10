import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import DateFilter from '../components/DateFilter';
import AISummary from '../components/AISummary';

const API = process.env.REACT_APP_API_URL || '';

export default function SalesReport() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dates, setDates] = useState({ start: '', end: '' });

  const fetchData = useCallback(async (start, end) => {
    setLoading(true); setError('');
    try {
      const params = new URLSearchParams();
      if (start) params.append('startDate', start);
      if (end) params.append('endDate', end);
      const res = await fetch(`${API}/api/sales?${params}`);
      if (!res.ok) throw new Error('API error');
      setData(await res.json());
    } catch (e) { setError('Could not load sales data. Make sure the backend is running.'); }
    setLoading(false);
  }, []);

  useEffect(() => { fetchData('', ''); }, [fetchData]);

  const handleApply = (s, e) => { setDates({ start: s, end: e }); fetchData(s, e); };

  const fmt = n => n?.toLocaleString() ?? '—';

  return (
    <div className="page">
      <div className="report-page">
        <div className="report-header">
          <div className="report-title-group">
            <Link to="/" className="report-back">← Back to Home</Link>
            <h1 className="report-title">SALES <span>REPORT</span></h1>
          </div>
          <DateFilter onApply={handleApply} />
        </div>

        {loading && <div className="loading-state"><div className="spinner" /><p>Loading sales data...</p></div>}
        {error && <div className="error-state">⚠ {error}</div>}

        {data && !loading && (
          <>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-label">Total Revenue</div>
                <div className="stat-value">{fmt(data.summary.totalRevenue)}</div>
                <div className="stat-sub">across {data.summary.totalDays} days</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">New Customers</div>
                <div className="stat-value">{fmt(data.summary.totalNewCustomers)}</div>
                <div className="stat-sub">total acquired</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Avg Daily Revenue</div>
                <div className="stat-value">{fmt(data.summary.avgDailyRevenue)}</div>
                <div className="stat-sub">per day average</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Peak Day</div>
                <div className="stat-value">{fmt(data.summary.peakDay?.revenue)}</div>
                <div className="stat-sub">{data.summary.peakDay?.date}</div>
              </div>
            </div>

            <AISummary data={data} reportType="sales" />

            <div className="charts-grid">
              <div className="chart-card">
                <div className="chart-title">Daily Revenue Trend</div>
                <ResponsiveContainer width="100%" height={240}>
                  <LineChart data={data.daily}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0eaf8" />
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={d => d?.slice(5)} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip formatter={v => v?.toLocaleString()} />
                    <Line type="monotone" dataKey="revenue" stroke="#1e5fcf" strokeWidth={2.5} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="chart-card">
                <div className="chart-title">New Customers Per Day</div>
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={data.daily}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0eaf8" />
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={d => d?.slice(5)} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip />
                    <Bar dataKey="newCustomers" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="table-card">
              <div className="table-header-row">
                <span className="table-title">Daily Sales Breakdown</span>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{data.daily.length} records</span>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table className="data-table">
                  <thead><tr><th>Date</th><th>Revenue</th><th>New Customers</th></tr></thead>
                  <tbody>
                    {data.daily.map((r, i) => (
                      <tr key={i}>
                        <td>{r.date}</td>
                        <td>{r.revenue?.toLocaleString()}</td>
                        <td>{r.newCustomers}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
