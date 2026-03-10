import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import DateFilter from '../components/DateFilter';
import AISummary from '../components/AISummary';

const API = process.env.REACT_APP_API_URL || '';

export default function JarsReport() {
  const [data, setData] = useState(null);
  const [todayData, setTodayData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isFiltered, setIsFiltered] = useState(false);

  const fetchToday = useCallback(async () => {
    try {
      const today = new Date().toISOString().slice(0, 10);
      const res = await fetch(`${API}/api/jars?startDate=${today}&endDate=${today}`);
      if (!res.ok) throw new Error('API error');
      setTodayData(await res.json());
    } catch (e) { console.error('Today fetch failed', e); }
  }, []);

  const fetchData = useCallback(async (start, end) => {
    setLoading(true); setError('');
    try {
      const params = new URLSearchParams();
      if (start) params.append('startDate', start);
      if (end) params.append('endDate', end);
      const res = await fetch(`${API}/api/jars?${params}`);
      if (!res.ok) throw new Error('API error');
      setData(await res.json());
      setIsFiltered(!!(start || end));
    } catch (e) { setError('Could not load jars data. Make sure the backend is running.'); }
    setLoading(false);
  }, []);

  useEffect(() => { fetchToday(); fetchData('', ''); }, [fetchToday, fetchData]);

  const fmt = n => n?.toLocaleString() ?? '—';
  const todayRow = todayData?.daily?.[0];

  return (
    <div className="page">
      <div className="report-page">
        <div className="report-header">
          <div className="report-title-group">
            <Link to="/" className="report-back">← Back to Home</Link>
            <h1 className="report-title">JARS <span>REPORT</span></h1>
          </div>
          <DateFilter onApply={(s, e) => fetchData(s, e)} />
        </div>

        {loading && <div className="loading-state"><div className="spinner" /><p>Loading jars data...</p></div>}
        {error && <div className="error-state">⚠ {error}</div>}

        {data && !loading && (
          <>
            {!isFiltered && (
              <>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '2px', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
                  📅 TODAY — {new Date().toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
                <div className="stats-grid" style={{ marginBottom: '1rem' }}>
                  <div className="stat-card">
                    <div className="stat-label">Today's Jars Delivered</div>
                    <div className="stat-value">{todayRow ? fmt(todayRow.jarsDelivered) : '—'}</div>
                    <div className="stat-sub">{todayRow ? 'delivered today' : 'no data yet today'}</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-label">Today's Empty Stock</div>
                    <div className="stat-value">{todayRow ? fmt(todayRow.emptyInStock) : '—'}</div>
                    <div className="stat-sub">{todayRow ? 'in warehouse today' : 'no data yet today'}</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-label">Jars With Customers</div>
                    <div className="stat-value">{fmt(data.summary.currentWithCustomers)}</div>
                    <div className="stat-sub">latest reading</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-label">Total Delivered (All Time)</div>
                    <div className="stat-value">{fmt(data.summary.totalDelivered)}</div>
                    <div className="stat-sub">across {data.summary.totalDays} days</div>
                  </div>
                </div>
              </>
            )}

            {isFiltered && (
              <>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '2px', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
                  📊 FILTERED RESULTS — {data.summary.totalDays} days selected
                </div>
                <div className="stats-grid" style={{ marginBottom: '1rem' }}>
                  <div className="stat-card">
                    <div className="stat-label">Total Delivered</div>
                    <div className="stat-value">{fmt(data.summary.totalDelivered)}</div>
                    <div className="stat-sub">in selected period</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-label">Empty in Stock</div>
                    <div className="stat-value">{fmt(data.summary.currentEmptyStock)}</div>
                    <div className="stat-sub">latest in period</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-label">With Customers</div>
                    <div className="stat-value">{fmt(data.summary.currentWithCustomers)}</div>
                    <div className="stat-sub">latest in period</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-label">Avg Delivered/Day</div>
                    <div className="stat-value">{data.summary.totalDays ? Math.round(data.summary.totalDelivered / data.summary.totalDays) : '—'}</div>
                    <div className="stat-sub">daily average</div>
                  </div>
                </div>
              </>
            )}

            <AISummary data={data} reportType="jars" />

            <div className="charts-grid">
              <div className="chart-card">
                <div className="chart-title">Jars Delivered Per Day</div>
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={data.daily}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0eaf8" />
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={d => d?.slice(5)} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip />
                    <Bar dataKey="jarsDelivered" fill="#1e5fcf" radius={[4,4,0,0]} name="Jars Delivered" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="chart-card">
                <div className="chart-title">Stock Levels Over Time</div>
                <ResponsiveContainer width="100%" height={240}>
                  <AreaChart data={data.daily}>
                    <defs>
                      <linearGradient id="emptyGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0eaf8" />
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={d => d?.slice(5)} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip />
                    <Legend />
                    <Area type="monotone" dataKey="emptyInStock" stroke="#3b82f6" fill="url(#emptyGrad)" name="Empty Stock" />
                    <Area type="monotone" dataKey="withCustomers" stroke="#1e5fcf" fill="url(#emptyGrad)" name="With Customers" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="table-card">
              <div className="table-header-row">
                <span className="table-title">Daily Jars Breakdown</span>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{data.daily.length} records</span>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table className="data-table">
                  <thead><tr><th>Date</th><th>Jars Delivered</th><th>Empty in Stock</th><th>With Customers</th></tr></thead>
                  <tbody>
                    {data.daily.map((r, i) => (
                      <tr key={i}>
                        <td>{r.date}</td>
                        <td>{r.jarsDelivered}</td>
                        <td>{r.emptyInStock?.toLocaleString()}</td>
                        <td>{r.withCustomers?.toLocaleString()}</td>
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
