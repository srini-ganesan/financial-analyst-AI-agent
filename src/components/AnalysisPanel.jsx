// ─────────────────────────────────────────────────────────────────────────────
// AnalysisPanel.jsx
//
// Renders the AI-generated bullet-point analysis for the top 3 equities.
// ─────────────────────────────────────────────────────────────────────────────

import React from 'react';

const RANK_LABELS = ['#1', '#2', '#3'];
const RANK_COLORS = ['#F5C842', '#94a3b8', '#b45309'];

export default function AnalysisPanel({ analysis, loading, error }) {
  if (loading) {
    return (
      <div style={styles.loadingWrapper}>
        <div style={styles.pulse}>
          <span style={styles.dot} />
          <span style={{ ...styles.dot, animationDelay: '0.2s' }} />
          <span style={{ ...styles.dot, animationDelay: '0.4s' }} />
        </div>
        <p style={styles.loadingText}>Claude is analyzing volume drivers...</p>
        <style>{dotAnimation}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.errorBox}>
        <span style={{ color: '#f87171' }}>⚠ Analysis error:</span>{' '}
        <span style={{ color: '#94a3b8' }}>{error}</span>
      </div>
    );
  }

  if (!analysis || analysis.length === 0) return null;

  return (
    <div style={styles.wrapper}>
      <div style={styles.sectionHeader}>
        <span style={styles.sectionLabel}>AI ANALYSIS</span>
        <span style={styles.sectionSub}>Why are these equities leading volume?</span>
      </div>

      <div style={styles.grid}>
        {analysis.map((item, idx) => (
          <div key={item.ticker} style={styles.card}>
            <div style={styles.cardHeader}>
              <span style={{ ...styles.rank, color: RANK_COLORS[idx] }}>
                {RANK_LABELS[idx]}
              </span>
              <span style={styles.ticker}>{item.ticker}</span>
            </div>
            <ul style={styles.bulletList}>
              {item.bullets.map((bullet, bi) => (
                <li key={bi} style={styles.bullet}>
                  <span style={styles.bulletDot}>›</span>
                  <span>{bullet}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  wrapper: {
    marginTop: '36px',
  },
  sectionHeader: {
    display: 'flex',
    alignItems: 'baseline',
    gap: '12px',
    marginBottom: '16px',
    paddingBottom: '10px',
    borderBottom: '1px solid #1e293b',
  },
  sectionLabel: {
    fontFamily: "'DM Mono', monospace",
    fontSize: '11px',
    fontWeight: 500,
    color: '#F5C842',
    letterSpacing: '0.1em',
  },
  sectionSub: {
    fontFamily: "'Syne', sans-serif",
    fontSize: '14px',
    color: '#475569',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
    gap: '16px',
  },
  card: {
    background: '#0f172a',
    border: '1px solid #1e293b',
    borderRadius: '10px',
    padding: '18px 20px',
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'baseline',
    gap: '10px',
    marginBottom: '14px',
  },
  rank: {
    fontFamily: "'DM Mono', monospace",
    fontSize: '12px',
    fontWeight: 500,
  },
  ticker: {
    fontFamily: "'Syne', sans-serif",
    fontSize: '20px',
    fontWeight: 700,
    color: '#e2e8f0',
    letterSpacing: '0.02em',
  },
  bulletList: {
    margin: 0,
    padding: 0,
    listStyle: 'none',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  bullet: {
    display: 'flex',
    gap: '8px',
    fontFamily: "'DM Mono', monospace",
    fontSize: '12px',
    color: '#94a3b8',
    lineHeight: '1.6',
  },
  bulletDot: {
    color: '#2DD4BF',
    flexShrink: 0,
    marginTop: '1px',
  },
  loadingWrapper: {
    marginTop: '36px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px',
    padding: '40px 0',
  },
  pulse: {
    display: 'flex',
    gap: '6px',
    alignItems: 'center',
  },
  dot: {
    display: 'inline-block',
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    background: '#F5C842',
    animation: 'pulse 1.2s ease-in-out infinite',
  },
  loadingText: {
    fontFamily: "'DM Mono', monospace",
    fontSize: '13px',
    color: '#475569',
    margin: 0,
  },
  errorBox: {
    marginTop: '24px',
    background: '#1c0a0a',
    border: '1px solid #7f1d1d',
    borderRadius: '8px',
    padding: '14px 18px',
    fontFamily: "'DM Mono', monospace",
    fontSize: '13px',
  },
};

const dotAnimation = `
@keyframes pulse {
  0%, 80%, 100% { opacity: 0.2; transform: scale(0.8); }
  40% { opacity: 1; transform: scale(1); }
}
`;
