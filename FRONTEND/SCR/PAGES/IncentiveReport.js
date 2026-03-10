import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import DateFilter from '../components/DateFilter';
import AISummary from '../components/AISummary';

const API = process.env.REACT_APP_API_URL || '';

export default function IncentiveReport() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = useCallback(async (start, end) => {
    setLoading(true); setError('');
    try {
      const params = new URLSearchParams();
      if (start) params.append('startDate', start);
      if (end) params.append('endDate', end);
      const res = await fetch(`${API}/api/incentive?${params}`);
      if (!res.ok) throw new Error('API error');
      setData(await res.json());
    } catch (e) { setError('Could not load incentive data. Make sure the backend is running.'); }
    setLoading(false);
  }, []);

  useEffect(() => { fetchData('', ''); }, [fetchData]);

  const fmt = n => n?.toLocaleString() ?? '—';

  return (
    <div className="page">
      <div className="report-page">
        <div className="report-header">
          <div className="report-title-group">
            <Link to="/" className="report-back">← Back to Home</Link>
            <h1 className="report-title">STAFF <span>INCENTIVE</span></h1>
          </div>
          <DateFilter onApply={(s, e) => fetchData(s, e)} />
        </div>

        {/* Notice about staff sheet */}
        <div style={{
          background: '#fffbeb', border: '1px solid #fcd34d', borderRadius: '10px',
          padding: '0.85rem 1.25rem', marginBottom: '1.5rem', fontSize: '0.82rem', color: '#92400e',
          display: 'flex', alignItems: 'center', gap: '0.5rem'
        }}>
          <span>ℹ️</span>
          <span>Currently showing estimated incentives based on revenue (5%). To see individual staff incentives, add a "Staff" sheet to your Google Sheets with columns: name, sales_amount, target.</span>
        </div>

        {loading && <div className="loading-state"><div className="spinner" /><p>Loading incentive data...</p></div>}
        {error && <div className="error-state">⚠ {error}</div>}

        {data && !loading && (
          <>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-label">Total Revenue</div>
                <div className="stat-value">{fmt(data.summary.totalRevenue)}</div>
                <div className="stat-sub">base for incentives</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">New Customers</div>
                <div className="stat-value">{fmt(data.summary.totalNewCustomers)}</div>
                <div className="stat-sub">team acquired</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Incentive Pool</div>
                <div className="stat-value">{fmt(data.summary.estimatedIncentivePool)}</div>
                <div className="stat-sub">est. 5% of revenue</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Days Tracked</div>
                <div className="stat-value">{data.summary.totalDays}</div>
                <div className="stat-sub">in selected period</div>
              </div>
            </div>

            <AISummary data={data} reportType="incentive" />

            <div className="charts-grid">
              <div className="chart-card">
                <div className="chart-title">Daily Revenue (Incentive Base)</div>
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={data.daily}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0eaf8" />
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={d => d?.slice(5)} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip formatter={v => v?.toLocaleString()} />
                    <Bar dataKey="revenue" fill="#1e5fcf" radius={[4,4,0,0]} name="Revenue" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="chart-card">
                <div className="chart-title">Daily Estimated Incentive Earned</div>
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={data.daily}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0eaf8" />
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={d => d?.slice(5)} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip formatter={v => v?.toLocaleString()} />
                    <Bar dataKey="incentiveEarned" fill="#3b82f6" radius={[4,4,0,0]} name="Incentive" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="table-card">
              <div className="table-header-row">
                <span className="table-title">Daily Incentive Breakdown</span>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{data.daily.length} records</span>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table className="data-table">
                  <thead><tr><th>Date</th><th>Revenue</th><th>New Customers</th><th>Est. Incentive (5%)</th></tr></thead>
                  <tbody>
                    {data.daily.map((r, i) => (
                      <tr key={i}>
                        <td>{r.date}</td>
                        <td>{r.revenue?.toLocaleString()}</td>
                        <td>{r.newCustomers}</td>
                        <td style={{ color: 'var(--blue-bright)', fontWeight: 600 }}>{r.incentiveEarned?.toLocaleString()}</td>
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
