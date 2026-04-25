import { useState } from 'react';

function Row({ label, value, note }) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '10px 0', borderBottom: '1px solid var(--border)',
    }}>
      <div>
        <span style={{ fontSize: '13px', color: 'var(--text)' }}>{label}</span>
        {note && <span style={{ fontSize: '12px', color: 'var(--text-muted)', marginLeft: '8px' }}>{note}</span>}
      </div>
      <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--blue)' }}>{value}</span>
    </div>
  );
}

export default function DrillDown({ metrics }) {
  const [open, setOpen] = useState(false);
  const { avg_review_wait_hours, avg_lines_changed, avg_review_rounds, hotfix_count, prod_deps } = metrics;

  return (
    <div style={{
      background: 'var(--surface)', border: '1px solid var(--border)',
      borderRadius: 'var(--radius)', overflow: 'hidden',
    }}>
      <button onClick={() => setOpen(o => !o)} style={{
        width: '100%', padding: '16px 24px', background: 'none',
        border: 'none', color: 'var(--text-muted)', fontSize: '13px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        fontWeight: 500,
      }}>
        <span>Sub-metric breakdown</span>
        <span style={{ fontSize: '18px', transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'none' }}>⌄</span>
      </button>

      {open && (
        <div style={{ padding: '0 24px 16px' }}>
          <Row label="Avg review wait"   value={`${avg_review_wait_hours}h`}  note="from PR open to first review" />
          <Row label="Avg PR size"        value={`${avg_lines_changed} lines`} note="lines changed per PR" />
          <Row label="Avg review rounds"  value={avg_review_rounds}            note="back-and-forth per PR" />
          <Row label="Hotfix deployments" value={`${hotfix_count} / ${prod_deps}`} note="of total prod deployments" />
        </div>
      )}
    </div>
  );
}