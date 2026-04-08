// ─────────────────────────────────────────────────────────────────────────────
// App.jsx — Financial Analyst AI Agent
//
// Architecture:
//  1. On mount (and every 60 min), fetchTop10ByVolume() pulls data from
//     Nasdaq Datalink (or returns mock data if no key is set).
//  2. The top 10 are rendered in a vertical bar chart via VolumeChart.
//  3. The top 3 tickers are passed to analyzeTop3() which calls Claude API
//     and returns bullet-point explanations per ticker.
//  4. AnalysisPanel renders the AI explanations below the chart.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState, useEffect, useCallback } from 'react';
import VolumeChart from './components/VolumeChart';
import AnalysisPanel from './components/AnalysisPanel';
import { fetchTop10ByVolume, getMockData } from './nasdaqService';
import { analyzeTop3 } from './claudeService';

const REFRESH_INTERVAL_MS = 60 * 60 * 1000; // 1 hour
const HAS_NASDAQ_KEY = !!process.env.REACT_APP_NASDAQ_API_KEY;
const HAS_ANTHROPIC_KEY = !!process.env.REACT_APP_ANTHROPIC_API_KEY;

export default function App() {
  const [volumeData, setVolumeData] = useState([]);
  const [analysis, setAnalysis] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [dataError, setDataError] = useState(null);
  const [analysisError, setAnalysisError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [nextRefreshIn, setNextRefreshIn] = useState(REFRESH_INTERVAL_MS);

  const loadData = useCallback(async () => {
    setDataLoading(true);
    setDataError(null);
    setAnalysisError(null);

    try {
      // Step 1: Fetch volume data
      let data;
      if (HAS_NASDAQ_KEY) {
        data = await fetchTop10ByVolume();
      } else {
        // No key set — use mock data for demo purposes
        await new Promise((r) => setTimeout(r, 800)); // simulate latency
        data = getMockData();
      }
      setVolumeData(data);
      setLastUpdated(new Date());
      setNextRefreshIn(REFRESH_INTERVAL_MS);

      // Step 2: Analyze top 3 with Claude
      const top3 = data.slice(0, 3);
      setAnalysisLoading(true);
      const aiAnalysis = await analyzeTop3(top3);
      setAnalysis(aiAnalysis);
    } catch (err) {
      setDataError(err.message);
    } finally {
      setDataLoading(false);
      setAnalysisLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Auto-refresh every hour
  useEffect(() => {
    const refreshTimer = setInterval(loadData, REFRESH_INTERVAL_MS);
    return () => clearInterval(refreshTimer);
  }, [loadData]);

  // Countdown display
  useEffect(() => {
    const countdownTimer = setInterval(() => {
      setNextRefreshIn((prev) => Math.max(0, prev - 1000));
    }, 1000);
    return () => clearInterval(countdownTimer);
  }, [lastUpdated]);

  const formatCountdown = (ms) => {
    const totalSec = Math.floor(ms / 1000);
    const m = Math.floor(totalSec / 60).toString().padStart(2, '0');
    const s = (totalSec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div style={styles.app}>
      <style>{globalStyles}</style>

      {/* Header */}
      <header style={styles.header}>
        <div style={styles.headerLeft}>
          <div style={styles.logoMark}>▲</div>
          <div>
            <h1 style={styles.title}>Financial Analyst Agent</h1>
            <p style={styles.subtitle}>Top 10 Equities by Trade Volume · Powered by Claude AI</p>
          </div>
        </div>
        <div style={styles.headerRight}>
          {lastUpdated && (
            <div style={styles.metaBlock}>
              <span style={styles.metaLabel}>LAST UPDATE</span>
              <span style={styles.metaValue}>
                {lastUpdated.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          )}
          <div style={styles.metaBlock}>
            <span style={styles.metaLabel}>NEXT REFRESH</span>
            <span style={{ ...styles.metaValue, color: '#2DD4BF' }}>
              {formatCountdown(nextRefreshIn)}
            </span>
          </div>
          <button
            onClick={loadData}
            disabled={dataLoading}
            style={{
              ...styles.refreshBtn,
              opacity: dataLoading ? 0.5 : 1,
              cursor: dataLoading ? 'not-allowed' : 'pointer',
            }}
          >
            {dataLoading ? '...' : '↻ Refresh'}
          </button>
        </div>
      </header>

      {/* Demo mode banner */}
      {(!HAS_NASDAQ_KEY || !HAS_ANTHROPIC_KEY) && (
        <div style={styles.demoBanner}>
          <span style={{ color: '#F5C842' }}>◈ DEMO MODE</span>
          <span style={styles.demoText}>
            {!HAS_NASDAQ_KEY && 'REACT_APP_NASDAQ_API_KEY not set — using mock volume data. '}
            {!HAS_ANTHROPIC_KEY && 'REACT_APP_ANTHROPIC_API_KEY not set — using mock AI analysis.'}
            {' '}Add your keys to <code style={styles.code}>.env</code> to enable live data.
          </span>
        </div>
      )}

      {/* Main content */}
      <main style={styles.main}>

        {/* Chart section */}
        <section style={styles.section}>
          <div style={styles.sectionHeader}>
            <span style={styles.sectionLabel}>VOLUME RANKING</span>
            <span style={styles.sectionSub}>Top 10 equities · shares traded</span>
          </div>

          {dataLoading ? (
            <div style={styles.chartPlaceholder}>
              <div style={styles.shimmerBar} />
              <p style={styles.loadingLabel}>Fetching market data...</p>
            </div>
          ) : dataError ? (
            <div style={styles.errorBox}>
              <span style={{ color: '#f87171' }}>⚠ Data error:</span>{' '}
              <span style={{ color: '#94a3b8' }}>{dataError}</span>
            </div>
          ) : (
            <VolumeChart data={volumeData} />
          )}
        </section>

        {/* Legend */}
        {!dataLoading && !dataError && (
          <div style={styles.legend}>
            <LegendItem color="#F5C842" label="Top 3 — AI analysed" />
            <LegendItem color="#2DD4BF" label="Rank 4–7" />
            <LegendItem color="#64748B" label="Rank 8–10" />
          </div>
        )}

        {/* AI Analysis section */}
        {!dataLoading && !dataError && (
          <AnalysisPanel
            analysis={analysis}
            loading={analysisLoading}
            error={analysisError}
          />
        )}
      </main>

      {/* Footer */}
      <footer style={styles.footer}>
        <span>Built with Claude API + Recharts + Nasdaq Datalink</span>
        <span style={styles.footerDot}>·</span>
        <span>Data refreshes every 60 minutes</span>
        <span style={styles.footerDot}>·</span>
        <span style={{ color: '#475569' }}>Not financial advice</span>
      </footer>
    </div>
  );
}

function LegendItem({ color, label }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
      <div style={{ width: 10, height: 10, borderRadius: 2, background: color }} />
      <span style={{ fontFamily: "'DM Mono', monospace", fontSize: '11px', color: '#475569' }}>
        {label}
      </span>
    </div>
  );
}

const styles = {
  app: {
    minHeight: '100vh',
    background: '#020817',
    color: '#e2e8f0',
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '24px 40px',
    borderBottom: '1px solid #0f172a',
    background: '#020817',
    flexWrap: 'wrap',
    gap: '16px',
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
  },
  logoMark: {
    fontSize: '28px',
    color: '#F5C842',
    lineHeight: 1,
  },
  title: {
    fontFamily: "'Syne', sans-serif",
    fontSize: '22px',
    fontWeight: 700,
    color: '#f1f5f9',
    margin: 0,
    letterSpacing: '-0.01em',
  },
  subtitle: {
    fontFamily: "'DM Mono', monospace",
    fontSize: '11px',
    color: '#475569',
    margin: '3px 0 0',
    letterSpacing: '0.03em',
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    flexWrap: 'wrap',
  },
  metaBlock: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
  },
  metaLabel: {
    fontFamily: "'DM Mono', monospace",
    fontSize: '9px',
    color: '#334155',
    letterSpacing: '0.08em',
  },
  metaValue: {
    fontFamily: "'DM Mono', monospace",
    fontSize: '15px',
    fontWeight: 500,
    color: '#e2e8f0',
  },
  refreshBtn: {
    fontFamily: "'DM Mono', monospace",
    fontSize: '12px',
    color: '#94a3b8',
    background: 'transparent',
    border: '1px solid #1e293b',
    borderRadius: '6px',
    padding: '8px 14px',
    transition: 'all 0.15s',
  },
  demoBanner: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    background: '#1a1200',
    borderBottom: '1px solid #422006',
    padding: '10px 40px',
    fontFamily: "'DM Mono', monospace",
    fontSize: '12px',
    flexWrap: 'wrap',
  },
  demoText: {
    color: '#78716c',
  },
  code: {
    background: '#292524',
    color: '#d6d3d1',
    padding: '1px 5px',
    borderRadius: '4px',
    fontFamily: "'DM Mono', monospace",
  },
  main: {
    flex: 1,
    padding: '36px 40px',
    maxWidth: '1100px',
    width: '100%',
    margin: '0 auto',
    boxSizing: 'border-box',
  },
  section: {
    marginBottom: '12px',
  },
  sectionHeader: {
    display: 'flex',
    alignItems: 'baseline',
    gap: '12px',
    marginBottom: '20px',
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
  chartPlaceholder: {
    height: '380px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '16px',
  },
  shimmerBar: {
    width: '100%',
    height: '320px',
    background: 'linear-gradient(90deg, #0f172a 25%, #1e293b 50%, #0f172a 75%)',
    backgroundSize: '200% 100%',
    animation: 'shimmer 1.5s infinite',
    borderRadius: '8px',
  },
  loadingLabel: {
    fontFamily: "'DM Mono', monospace",
    fontSize: '12px',
    color: '#334155',
    margin: 0,
  },
  errorBox: {
    background: '#1c0a0a',
    border: '1px solid #7f1d1d',
    borderRadius: '8px',
    padding: '14px 18px',
    fontFamily: "'DM Mono', monospace",
    fontSize: '13px',
  },
  legend: {
    display: 'flex',
    gap: '20px',
    marginTop: '8px',
    marginBottom: '4px',
    paddingLeft: '52px',
    flexWrap: 'wrap',
  },
  footer: {
    borderTop: '1px solid #0f172a',
    padding: '16px 40px',
    fontFamily: "'DM Mono', monospace",
    fontSize: '11px',
    color: '#334155',
    display: 'flex',
    gap: '10px',
    flexWrap: 'wrap',
  },
  footerDot: {
    color: '#1e293b',
  },
};

const globalStyles = `
  *, *::before, *::after { box-sizing: border-box; }
  body { margin: 0; background: #020817; }
  @keyframes shimmer {
    0% { background-position: -200% 0; }
    100% { background-position: 200% 0; }
  }
`;
