import { developers } from '../data';

const months = [
  { value: '2026-03', label: 'March 2026' },
  { value: '2026-04', label: 'April 2026' }
];

const selectStyle = {
  background: 'var(--surface-2)', border: '1px solid var(--border)',
  color: 'var(--text)', borderRadius: 'var(--radius-sm)',
  padding: '10px 14px', fontSize: '14px', minWidth: '200px', outline: 'none'
};

const lockedStyle = {...selectStyle, opacity: 0.6, cursor: 'not-allowed', pointerEvents: 'none'};

export default function DeveloperSelector({ developerId, month, onDevChange, onMonthChange, locked }) {
  return (
    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <label style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Developer {locked && <span style={{ color: 'var(--blue)', marginLeft: '4px' }}>· Locked to your profile</span>}
        </label>
        <select
          value={developerId}
          onChange={e => onDevChange && onDevChange(e.target.value)}
          style={locked ? lockedStyle : selectStyle}
          disabled={locked}
        >
          <option value="">— Select —</option>
          {developers.map(d => (
            <option key={d.developer_id} value={d.developer_id}>
              {d.developer_name} · {d.team_name}
            </option>
          ))}
        </select>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <label style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Month
        </label>
        <select value={month} onChange={e => onMonthChange(e.target.value)} style={selectStyle}>
          {months.map(m => (
            <option key={m.value} value={m.value}>{m.label}</option>
          ))}
        </select>
      </div>
    </div>
  );
}