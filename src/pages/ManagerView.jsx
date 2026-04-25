import { useState } from 'react';
import { developers } from '../data';
import { computeMetrics, classifyPattern } from '../logic/reasoningEngine';
import ManagerTable from '../components/ManagerTable';

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

export default function ManagerView() {
  const [managerId, setManagerId] = useState('MGR-01');
  const [month, setMonth] = useState('2026-04');

  const teamDevs = developers.filter(d => d.manager_id === managerId);
  const manager = managers.find(m => m.id === managerId);

  const rows = teamDevs.map(dev => {
    const metrics = computeMetrics(dev.developer_id, month);
    const pattern = classifyPattern(metrics);
    return {
      developer_name: dev.developer_name,
      team_name: dev.team_name,
      avg_lead_time_days: metrics.avg_lead_time_days,
      avg_cycle_time_days: metrics.avg_cycle_time_days,
      bug_rate_pct: metrics.bug_rate_pct,
      prod_deps: metrics.prod_deps,
      pattern,
    };
  }).filter(r => r.prod_deps > 0);

  const teamBugRate = rows.length ? rows.reduce((s, r) => s + r.bug_rate_pct, 0) / rows.length : 0;
    const teamLeadTime = rows.length ? rows.reduce((s, r) => s + r.avg_lead_time_days, 0) / rows.length : 0;

    const signalPriority = { 'Quality Watch': 3, 'Watch Bottlenecks': 2, 'Needs Review': 1, 'Healthy Flow': 0 };
    const teamSignal = rows.reduce((worst, r) =>
    signalPriority[r.pattern] > signalPriority[worst] ? r.pattern : worst
    , 'Healthy Flow');

  const signalColor = {
    'Healthy Flow': 'var(--green)',
    'Watch Bottlenecks': 'var(--amber)',
    'Quality Watch': 'var(--red)',
  }[teamSignal];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

      <div>
        <h1 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '4px' }}>Manager View</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
          Team-level summary across all developers for the selected month.
        </p>
      </div>

      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Manager</label>
          <select value={managerId} onChange={e => setManagerId(e.target.value)} style={selectStyle}>
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
          background: 'var(--surface)', border: `1px solid ${signalColor}55`,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '2px' }}>
              {manager?.name} · {manager?.team} · {rows.length} developers
            </div>
            <div style={{ fontSize: '16px', fontWeight: 700, color: signalColor }}>
              Team Signal: {teamSignal}
            </div>
          </div>
          <div style={{ display: 'flex', gap: '24px', fontSize: '13px', color: 'var(--text-muted)' }}>
            <span>Avg Lead Time <strong style={{ color: 'var(--text)' }}>{teamLeadTime.toFixed(1)}d</strong></span>
            <span>Avg Bug Rate <strong style={{ color: 'var(--text)' }}>{teamBugRate.toFixed(1)}%</strong></span>
          </div>
        </div>
      )}

      {rows.length > 0
        ? <ManagerTable rows={rows} />
        : <div style={{
            background: 'var(--surface)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius)', padding: '48px',
            textAlign: 'center', color: 'var(--text-muted)',
          }}>
            <p>No data available for this team in the selected month.</p>
          </div>
      }
    </div>
  );
}