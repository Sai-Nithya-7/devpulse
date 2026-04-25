function deltaDisplay(delta, lowerIsBetter = true) {
  if (delta === 0 || delta === undefined) return null;
  const improved = lowerIsBetter ? delta < 0 : delta > 0;
  const color = improved ? 'var(--green)' : 'var(--red)';
  const arrow = delta > 0 ? '▲' : '▼';
  return <span style={{ color, fontSize: '12px', fontWeight: 600 }}>{arrow} {Math.abs(delta)}</span>;
}

function getAccentColor(status) {
  if (status === 'good') return 'var(--green)';
  if (status === 'warn') return 'var(--amber)';
  if (status === 'bad')  return 'var(--red)';
  return 'var(--blue)';
}

export default function MetricCard({ label, value, unit = '', delta, lowerIsBetter = true, status = 'neutral', subtext }) {
  const accent = getAccentColor(status);

  return (
    <div style={{
      background: 'var(--surface)', border: '1px solid var(--border)',
      borderTop: `3px solid ${accent}`,
      borderRadius: 'var(--radius)', padding: '20px',
      display: 'flex', flexDirection: 'column', gap: '8px',
      minWidth: '160px', flex: 1,
    }}>
      <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
        {label}
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
        <span style={{ fontSize: '28px', fontWeight: 700, color: accent, lineHeight: 1 }}>
          {value}
        </span>
        {unit && <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{unit}</span>}
        {deltaDisplay(delta, lowerIsBetter)}
      </div>
      {subtext && (
        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{subtext}</div>
      )}
    </div>
  );
}