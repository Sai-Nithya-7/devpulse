export default function NextSteps({ steps }) {
  return (
    <div style={{
      background: 'var(--surface)', border: '1px solid var(--border)',
      borderRadius: 'var(--radius)', padding: '24px',
    }}>
      <div style={{
        fontSize: '11px', color: 'var(--text-muted)',
        textTransform: 'uppercase', letterSpacing: '0.5px',
        marginBottom: '16px', fontWeight: 600,
      }}>
        Recommended next steps
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {steps.map((step, i) => (
          <div key={i} style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
            <span style={{
              background: 'var(--blue-dim)', color: 'var(--blue)',
              borderRadius: '50%', width: '24px', height: '24px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '12px', fontWeight: 700, flexShrink: 0, marginTop: '1px',
            }}>
              {i + 1}
            </span>
            <p style={{ fontSize: '14px', lineHeight: '1.6', color: 'var(--text)' }}>{step}</p>
          </div>
        ))}
      </div>
    </div>
  );
}