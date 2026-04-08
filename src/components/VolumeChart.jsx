// ─────────────────────────────────────────────────────────────────────────────
// VolumeChart.jsx
//
// Renders a vertical bar chart of the top 10 equities by trade volume
// using Recharts. Styled to match the dark terminal-finance aesthetic.
// ─────────────────────────────────────────────────────────────────────────────

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

// Color ramp: top 3 get accent gold, rest get muted teal
const BAR_COLORS = [
  '#F5C842', '#F5C842', '#F5C842', // top 3 — gold
  '#2DD4BF', '#2DD4BF', '#2DD4BF', '#2DD4BF', // 4-7 — teal
  '#64748B', '#64748B', '#64748B', // 8-10 — slate
];

function formatMillions(value) {
  if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(1)}B`;
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(0)}K`;
  return value;
}

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: '#0f172a',
        border: '1px solid #1e3a5f',
        borderRadius: '6px',
        padding: '10px 14px',
        fontFamily: "'DM Mono', monospace",
        fontSize: '13px',
      }}>
        <p style={{ color: '#F5C842', margin: '0 0 4px', fontWeight: 500 }}>{label}</p>
        <p style={{ color: '#94a3b8', margin: 0 }}>
          Volume:{' '}
          <span style={{ color: '#e2e8f0' }}>
            {new Intl.NumberFormat('en-US').format(payload[0].value)}
          </span>
        </p>
      </div>
    );
  }
  return null;
};

export default function VolumeChart({ data }) {
  return (
    <div style={{ width: '100%', height: 380 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 10, right: 20, left: 10, bottom: 5 }}
          barCategoryGap="28%"
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#1e293b"
            vertical={false}
          />
          <XAxis
            dataKey="ticker"
            tick={{
              fill: '#94a3b8',
              fontFamily: "'DM Mono', monospace",
              fontSize: 13,
              fontWeight: 500,
            }}
            axisLine={{ stroke: '#1e293b' }}
            tickLine={false}
          />
          <YAxis
            tickFormatter={formatMillions}
            tick={{
              fill: '#64748b',
              fontFamily: "'DM Mono', monospace",
              fontSize: 11,
            }}
            axisLine={false}
            tickLine={false}
            width={52}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
          <Bar dataKey="volume" radius={[4, 4, 0, 0]} maxBarSize={52}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={BAR_COLORS[index] || '#64748B'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
