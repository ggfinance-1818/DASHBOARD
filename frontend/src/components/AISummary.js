import React, { useEffect, useState } from 'react';

const API = process.env.REACT_APP_API_URL || '';

export default function AISummary({ data, reportType }) {
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!data) return;
    const generate = async () => {
      setLoading(true);
      setSummary('');
      try {
        const res = await fetch(`${API}/api/ai-summary`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ data, reportType }),
        });
        const json = await res.json();
        setSummary(json.summary || 'No summary available.');
      } catch (e) {
        setSummary('AI summary unavailable — check API connection.');
      }
      setLoading(false);
    };
    generate();
  }, [data, reportType]);

  return (
    <div className="ai-card">
      <div className="ai-header">
        <span className="ai-badge">AI INSIGHT</span>
        <span className="ai-title">Valyana Intelligence Summary</span>
      </div>
      {loading
        ? <p className="ai-loading">✦ Analyzing your data...</p>
        : <p className="ai-text">{summary}</p>
      }
    </div>
  );
}
