import React, { useEffect, useState } from 'react';

export default function AISummary({ data, reportType }) {
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!data) return;
    const generate = async () => {
      setLoading(true);
      setSummary('');
      try {
        const prompt = buildPrompt(data, reportType);
        const res = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: 'claude-sonnet-4-20250514',
            max_tokens: 1000,
            messages: [{ role: 'user', content: prompt }],
          }),
        });
        const json = await res.json();
        const text = json.content?.map(b => b.text || '').join('') || 'No summary available.';
        setSummary(text);
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

function buildPrompt(data, type) {
  const { summary, daily } = data;
  if (type === 'sales') {
    return `You are a business analyst for Valyana, a water/beverage jar delivery company. Analyze this sales data and give a clear, helpful 3-4 sentence business insight. Be specific about numbers.

Data Summary:
- Total Revenue: ${summary.totalRevenue?.toLocaleString()}
- Total New Customers: ${summary.totalNewCustomers}
- Average Daily Revenue: ${summary.avgDailyRevenue?.toLocaleString()}
- Days Tracked: ${summary.totalDays}
- Peak Day: ${summary.peakDay?.date} with revenue ${summary.peakDay?.revenue?.toLocaleString()}

Daily breakdown (last 5 days): ${JSON.stringify(daily?.slice(-5))}

Give actionable insights in plain English. No bullet points, just concise paragraphs.`;
  }
  if (type === 'jars') {
    return `You are a logistics analyst for Valyana. Analyze this jars report and give a clear 3-4 sentence operational insight.

Data Summary:
- Total Jars Delivered: ${summary.totalDelivered}
- Current Empty Stock: ${summary.currentEmptyStock}
- Currently With Customers: ${summary.currentWithCustomers}
- Days Tracked: ${summary.totalDays}

Daily breakdown (last 5 days): ${JSON.stringify(daily?.slice(-5))}

Focus on inventory health, delivery trends, and any operational concerns. Plain English, no bullet points.`;
  }
  if (type === 'incentive') {
    return `You are a sales performance analyst for Valyana. Analyze this incentive report and give motivating, data-backed insights in 3-4 sentences.

Data Summary:
- Total Revenue Generated: ${summary.totalRevenue?.toLocaleString()}
- Total New Customers Acquired: ${summary.totalNewCustomers}
- Estimated Incentive Pool (5%): ${summary.estimatedIncentivePool?.toLocaleString()}
- Days Tracked: ${summary.totalDays}

Give insights on team performance and what it means for incentives. Plain English, encouraging tone, no bullet points.`;
  }
  return `Analyze this business data and give 3-4 sentences of insight: ${JSON.stringify(data.summary)}`;
}
