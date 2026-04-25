const config = {
  'Healthy Flow': { bg: 'var(--green-dim)',  border: 'var(--green)',  icon: '🟢', color: 'var(--green)' },
  'Quality Watch':      { bg: 'var(--red-dim)',    border: 'var(--red)',    icon: '🔴', color: 'var(--red)' },
  'Quality Watch : Improving': { bg: 'var(--amber-dim)', border: 'var(--amber)', icon: '🟠', color: 'var(--amber)' },
  'Watch Bottlenecks': { bg: 'var(--amber-dim)',  border: 'var(--amber)',  icon: '🟡', color: 'var(--amber)' },
  'Needs Review': { bg: 'var(--blue-dim)',   border: 'var(--blue)',   icon: '🔵', color: 'var(--blue)' },
};

export default function PatternBanner({ pattern }) {
  const c = config[pattern] || config['Healthy Flow'];
  return (
    <div style={{
      background: c.bg, border: `1px solid ${c.border}`,
      borderRadius: 'var(--radius)', padding: '16px 20px',
      display: 'flex', alignItems: 'center', gap: '12px',
    }}>
      <span style={{ fontSize: '24px' }}>{c.icon}</span>
      <div>
        <div style={{ fontSize: '11px', color: c.color, textTransform: 'uppercase', letterSpacing: '0.8px', fontWeight: 600 }}>
          Pattern Detected
        </div>
        <div style={{ fontSize: '18px', fontWeight: 700, color: c.color }}>
          {pattern}
        </div>
      </div>
    </div>
  );
}