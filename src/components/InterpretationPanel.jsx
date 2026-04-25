export default function InterpretationPanel({ text }) {
  return (
    <div style={{
      background: 'var(--surface)', border: '1px solid var(--border)',
      borderRadius: 'var(--radius)', padding: '24px',
    }}>
      <div style={{
        fontSize: '11px', color: 'var(--text-muted)',
        textTransform: 'uppercase', letterSpacing: '0.5px',
        marginBottom: '12px', fontWeight: 600,
      }}>
        What this means
      </div>
      <p style={{ fontSize: '15px', lineHeight: '1.75', color: 'var(--text)' }}>
        {text}
      </p>
    </div>
  );
}