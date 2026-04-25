const signalColors = {
  'Healthy Flow':      'var(--green)',
  'Watch Bottlenecks': 'var(--amber)',
  'Quality Watch':     'var(--red)',
};

function Cell({ children, muted }) {
  return (
    <td style={{
      padding: '14px 16px', fontSize: '13px',
      color: muted ? 'var(--text-muted)' : 'var(--text)',
      borderBottom: '1px solid var(--border)',
    }}>
      {children}
    </td>
  );
}

export default function ManagerTable({ rows }) {
  if (!rows || rows.length === 0) return null;

  const headers = ['Developer', 'Team', 'Lead Time', 'Cycle Time', 'Bug Rate', 'Deploys', 'Signal'];

  return (
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
          {rows.map((row, i) => {
            const pattern = row.pattern;
            const color = signalColors[pattern] || 'var(--text-muted)';
            return (
              <tr key={i} style={{ transition: 'background 0.1s' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-2)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <Cell>{row.developer_name}</Cell>
                <Cell muted>{row.team_name}</Cell>
                <Cell>{row.avg_lead_time_days}d</Cell>
                <Cell>{row.avg_cycle_time_days}d</Cell>
                <Cell>{row.bug_rate_pct}%</Cell>
                <Cell>{row.prod_deps}</Cell>
                <Cell>
                  <span style={{
                    color, fontSize: '12px', fontWeight: 600,
                    background: color + '22', padding: '3px 10px',
                    borderRadius: '20px', border: `1px solid ${color}55`,
                  }}>
                    {pattern}
                  </span>
                </Cell>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}