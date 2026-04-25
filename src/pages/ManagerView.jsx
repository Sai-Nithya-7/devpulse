import { useState } from 'react';
import { developers } from '../data';
import {
  computeMetrics, classifyPattern,
  generateInterpretation, generateNextSteps,
  computeTeamBenchmark
} from '../logic/reasoningEngine';

const managers = [
  { id: 'MGR-01', name: 'Rina Kapoor',  team: 'Payments API' },
  { id: 'MGR-02', name: 'Samir Gupta',  team: 'Checkout Web' },
  { id: 'MGR-03', name: 'Priya Nair',   team: 'Mobile Growth' }
];

const months = [
  { value: '2026-03', label: 'March 2026' },
  { value: '2026-04', label: 'April 2026' }
];

const selectStyle = {
  background: 'var(--surface-2)', border: '1px solid var(--border)',
  color: 'var(--text)', borderRadius: 'var(--radius-sm)',
  padding: '10px 14px', fontSize: '14px', minWidth: '200px', outline: 'none'
};

const signalColors = {
  'Healthy Flow': 'var(--green)',
  'Watch Bottlenecks': 'var(--amber)',
  'Quality Watch': 'var(--red)',
  'Quality Watch : Improving': 'var(--amber)',
  'Needs Review': 'var(--blue)'
};

function SignalBadge({ pattern }) {
  const color = signalColors[pattern] || 'var(--text-muted)';
  return (
    <span style={{
      color, fontSize: '12px', fontWeight: 600,
      background: color + '22', padding: '3px 10px',
      borderRadius: '20px', border: `1px solid ${color}55`,
      whiteSpace: 'nowrap'
    }}>
      {pattern}
    </span>
  );
}

function TeamInsight({ rows }) {
  const total = rows.length;
  const counts = rows.reduce((acc, r) => {
    acc[r.pattern] = (acc[r.pattern] || 0) + 1;
    return acc;
  }, {});

  const qualityWatch = (counts['Quality Watch'] || 0) + (counts['Quality Watch : Improving'] || 0);
  const bottlenecks  = counts['Watch Bottlenecks'] || 0;
  const needsReview  = counts['Needs Review'] || 0;
  const healthy      = counts['Healthy Flow'] || 0;

  let summary = '';
  if (qualityWatch === total) {
    summary = `All ${total} developers have bugs escaping to production this month. Quality is the team's primary risk. Speed targets should be secondary until the escape rate drops.`;
  } else if (qualityWatch > 0 && bottlenecks > 0) {
    summary = `${qualityWatch} developer${qualityWatch > 1 ? 's' : ''} have quality issues and ${bottlenecks} ${bottlenecks > 1 ? 'are' : 'is'} hitting delivery bottlenecks. The team is dealing with both speed and quality pressure simultaneously.`;
  } else if (qualityWatch > 0) {
    summary = `${qualityWatch} of ${total} developers have bugs escaping to production. ${healthy > 0 ? `${healthy} ${healthy > 1 ? 'are' : 'is'} tracking healthy. The quality issue is not team-wide.` : 'This is a team-wide quality signal worth addressing before the next sprint.'}`;
  } else if (bottlenecks > 0) {
    summary = `${bottlenecks} developer${bottlenecks > 1 ? 's are' : ' is'} hitting delivery bottlenecks this month. No quality issues, the team is shipping safely but slower than ideal.`;
  } else if (needsReview > 0) {
    summary = `No quality or speed issues, but ${needsReview} developer${needsReview > 1 ? 's' : ''} show PR discipline concerns worth watching before they affect quality.`;
  } else {
    summary = `All ${total} developers are in Healthy Flow this month. Delivery is balanced and no bugs escaped to production. Worth documenting what's working.`;
  }

  return (
    <div style={{
      background: 'var(--surface)', border: '1px solid var(--border)',
      borderRadius: 'var(--radius)', padding: '20px 24px',
      display: 'flex', flexDirection: 'column', gap: '14px'
    }}>
      <div style={{
        fontSize: '11px', color: 'var(--text-muted)',
        textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600
      }}>
        Team Diagnosis
      </div>
      <p style={{ fontSize: '15px', lineHeight: '1.7', color: 'var(--text)' }}>
        {summary}
      </p>
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {Object.entries(counts).map(([pattern, count]) => (
          <div key={pattern} style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            background: 'var(--surface-2)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius-sm)', padding: '6px 12px'
          }}>
            <span style={{
              width: '8px', height: '8px', borderRadius: '50%',
              background: signalColors[pattern] || 'var(--text-muted)',
              flexShrink: 0
            }} />
            <span style={{ fontSize: '12px', color: 'var(--text)' }}>
              {count} x {pattern}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function DevRow({ row, isExpanded, onToggle }) {
  const color = signalColors[row.pattern] || 'var(--text-muted)';
  return (
    <>
      <tr
        onClick={onToggle}
        style={{ cursor: 'pointer', transition: 'background 0.1s' }}
        onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-2)'}
        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
      >
        <td style={{ padding: '14px 16px', fontSize: '13px', borderBottom: isExpanded ? 'none' : '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{
              fontSize: '10px', color: 'var(--text-muted)',
              transition: 'transform 0.2s',
              transform: isExpanded ? 'rotate(90deg)' : 'none',
            }}>▶</span>
            {row.developer_name}
          </div>
        </td>
        <td style={{ padding: '14px 16px', fontSize: '13px', color: 'var(--text-muted)', borderBottom: isExpanded ? 'none' : '1px solid var(--border)' }}>{row.team_name}</td>
        <td style={{ padding: '14px 16px', fontSize: '13px', borderBottom: isExpanded ? 'none' : '1px solid var(--border)' }}>{row.avg_lead_time_days}d</td>
        <td style={{ padding: '14px 16px', fontSize: '13px', borderBottom: isExpanded ? 'none' : '1px solid var(--border)' }}>{row.avg_cycle_time_days}d</td>
        <td style={{ padding: '14px 16px', fontSize: '13px', borderBottom: isExpanded ? 'none' : '1px solid var(--border)' }}>{row.bug_rate_pct}%</td>
        <td style={{ padding: '14px 16px', fontSize: '13px', borderBottom: isExpanded ? 'none' : '1px solid var(--border)' }}>{row.prod_deps}</td>
        <td style={{ padding: '14px 16px', borderBottom: isExpanded ? 'none' : '1px solid var(--border)' }}>
          <SignalBadge pattern={row.pattern} />
        </td>
      </tr>

      {isExpanded && (
        <tr>
          <td colSpan={7} style={{
            padding: '0 16px 20px 36px',
            borderBottom: '1px solid var(--border)',
            background: 'var(--surface-2)',
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', paddingTop: '12px' }}>

              <div style={{
                background: 'var(--surface)', border: '1px solid var(--border)',
                borderLeft: `4px solid ${color}`,
                borderRadius: 'var(--radius-sm)', padding: '14px 18px',
              }}>
                <div style={{
                  fontSize: '11px', color: 'var(--text-muted)',
                  textTransform: 'uppercase', letterSpacing: '0.5px',
                  fontWeight: 600, marginBottom: '8px',
                }}>
                  What's happening
                </div>
                <p style={{ fontSize: '13px', lineHeight: '1.7', color: 'var(--text)' }}>
                  {row.interpretation}
                </p>
              </div>

              <div style={{
                background: 'var(--surface)', border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)', padding: '14px 18px',
              }}>
                <div style={{
                  fontSize: '11px', color: 'var(--text-muted)',
                  textTransform: 'uppercase', letterSpacing: '0.5px',
                  fontWeight: 600, marginBottom: '10px',
                }}>
                  Suggested actions
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {row.nextSteps.map((step, i) => (
                    <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                      <span style={{
                        background: color + '22', color,
                        borderRadius: '50%', width: '20px', height: '20px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '11px', fontWeight: 700, flexShrink: 0, marginTop: '1px',
                      }}>
                        {i + 1}
                      </span>
                      <p style={{ fontSize: '13px', lineHeight: '1.6', color: 'var(--text)' }}>{step}</p>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </td>
        </tr>
      )}
    </>
  );
}

export default function ManagerView({ lockedManagerId }) {
  const [managerId, setManagerId] = useState(lockedManagerId || 'MGR-01');
  const [month, setMonth] = useState('2026-04');
  const [expandedDev, setExpandedDev] = useState(null);

  const manager = managers.find(m => m.id === managerId);
  const teamDevs = developers.filter(d => d.manager_id === managerId);

  const rows = teamDevs.map(dev => {
    const metrics = computeMetrics(dev.developer_id, month);
    const benchmark = computeTeamBenchmark(dev.developer_id, month);
    const pattern = classifyPattern(metrics, null);
    const interpretation = generateInterpretation(metrics, pattern, benchmark);
    const nextSteps = generateNextSteps(metrics, pattern);
    return {
      developer_id: dev.developer_id,
      developer_name: dev.developer_name,
      team_name: dev.team_name,
      avg_lead_time_days: metrics.avg_lead_time_days,
      avg_cycle_time_days: metrics.avg_cycle_time_days,
      bug_rate_pct: metrics.bug_rate_pct,
      prod_deps: metrics.prod_deps,
      pattern,
      interpretation,
      nextSteps,
    };
  }).filter(r => r.prod_deps > 0);

  const signalPriority = { 'Quality Watch': 4, 'Quality Watch : Improving': 3, 'Watch Bottlenecks': 2, 'Needs Review': 1, 'Healthy Flow': 0 };
  const teamSignal = rows.reduce((worst, r) =>
    signalPriority[r.pattern] > signalPriority[worst] ? r.pattern : worst
  , 'Healthy Flow');

  const teamSignalColor = signalColors[teamSignal];
  const teamLeadTime = rows.length
    ? (rows.reduce((s, r) => s + r.avg_lead_time_days, 0) / rows.length).toFixed(1) : 0;
  const teamBugRate = rows.length
    ? (rows.reduce((s, r) => s + r.bug_rate_pct, 0) / rows.length).toFixed(1) : 0;

  const headers = ['Developer', 'Team', 'Lead Time', 'Cycle Time', 'Bug Rate', 'Deploys', 'Signal'];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

      <div>
        <h1 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '4px' }}>Manager View</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
          Click any developer row to see their diagnosis and suggested actions.
        </p>
      </div>

      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Manager</label>
          <select
            value={managerId}
            onChange={e => !lockedManagerId && setManagerId(e.target.value)}
            style={lockedManagerId ? { ...selectStyle, opacity: 0.6, cursor: 'not-allowed' } : selectStyle}
            disabled={!!lockedManagerId}
          >
            {managers.map(m => (
              <option key={m.id} value={m.id}>{m.name} : {m.team}</option>
            ))}
          </select>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Month</label>
          <select value={month} onChange={e => setMonth(e.target.value)} style={selectStyle}>
            {months.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
          </select>
        </div>
      </div>

      {rows.length > 0 && (
        <div style={{
          padding: '14px 20px', borderRadius: 'var(--radius)',
          background: 'var(--surface)', border: `1px solid ${teamSignalColor}55`,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          flexWrap: 'wrap', gap: '12px',
        }}>
          <div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '2px' }}>
              {manager?.name} · {manager?.team} · {rows.length} developers
            </div>
            <div style={{ fontSize: '16px', fontWeight: 700, color: teamSignalColor }}>
              Team Signal: {teamSignal}
            </div>
          </div>
          <div style={{ display: 'flex', gap: '24px', fontSize: '13px', color: 'var(--text-muted)' }}>
            <span>Avg Lead Time <strong style={{ color: 'var(--text)' }}>{teamLeadTime}d</strong></span>
            <span>Avg Bug Rate <strong style={{ color: 'var(--text)' }}>{teamBugRate}%</strong></span>
          </div>
        </div>
      )}

      {rows.length > 0 && <TeamInsight rows={rows} />}

      {rows.length > 0 ? (
        <div style={{
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius)', overflow: 'hidden',
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--surface-2)' }}>
                {headers.map(h => (
                  <th key={h} style={{
                    padding: '12px 16px', fontSize: '11px', fontWeight: 600,
                    color: 'var(--text-muted)', textTransform: 'uppercase',
                    letterSpacing: '0.5px', textAlign: 'left',
                    borderBottom: '1px solid var(--border)',
                  }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map(row => (
                <DevRow
                  key={row.developer_id}
                  row={row}
                  isExpanded={expandedDev === row.developer_id}
                  onToggle={() => setExpandedDev(
                    expandedDev === row.developer_id ? null : row.developer_id
                  )}
                />
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div style={{
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius)', padding: '48px',
          textAlign: 'center', color: 'var(--text-muted)',
        }}>
          <p>No data available for this team in the selected month.</p>
        </div>
      )}
    </div>
  );
}