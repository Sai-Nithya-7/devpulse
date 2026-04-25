import { allIdentities } from '../context/AuthContext';

const roleColors = {
  developer: 'var(--blue)',
  manager: 'var(--purple)'
};

export default function LoginScreen({ onLogin }) {
  return (
    <div style={{
      minHeight: '100vh', background: 'var(--bg)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      gap: '32px', padding: '32px'
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '40px', marginBottom: '12px' }}>⚡</div>
        <h1 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '8px' }}>DevPulse</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '15px' }}>
          Select your identity to continue
        </p>
        <p style={{
          fontSize: '12px', color: 'var(--text-muted)',
          marginTop: '6px', opacity: 0.6
        }}>
          Simulating role-based access. In production this would be SSO/auth
        </p>
      </div>

      <div style={{
        display: 'flex', flexDirection: 'column', gap: '8px',
        width: '100%', maxWidth: '420px'
      }}>
        {/* Developers */}
        <div style={{
          fontSize: '11px', color: 'var(--text-muted)',
          textTransform: 'uppercase', letterSpacing: '0.5px',
          fontWeight: 600, marginBottom: '4px', marginTop: '8px'
        }}>
          Developers
        </div>
        {allIdentities.filter(i => i.role === 'developer').map(identity => (
          <button key={identity.id} onClick={() => onLogin(identity)} style={{
            background: 'var(--surface)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius-sm)', padding: '14px 18px',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            color: 'var(--text)', transition: 'border-color 0.15s'
          }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--blue)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
          >
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '2px' }}>
              <span style={{ fontSize: '14px', fontWeight: 600 }}>{identity.name}</span>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{identity.team}</span>
            </div>
            <span style={{
              fontSize: '11px', fontWeight: 600, color: roleColors[identity.role],
              background: roleColors[identity.role] + '22',
              padding: '3px 10px', borderRadius: '20px',
              border: `1px solid ${roleColors[identity.role]}55`
            }}>
              Developer
            </span>
          </button>
        ))}

        {/* Managers */}
        <div style={{
          fontSize: '11px', color: 'var(--text-muted)',
          textTransform: 'uppercase', letterSpacing: '0.5px',
          fontWeight: 600, marginBottom: '4px', marginTop: '16px'
        }}>
          Managers
        </div>
        {allIdentities.filter(i => i.role === 'manager').map(identity => (
          <button key={identity.id} onClick={() => onLogin(identity)} style={{
            background: 'var(--surface)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius-sm)', padding: '14px 18px',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            color: 'var(--text)', transition: 'border-color 0.15s'
          }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--purple)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
          >
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '2px' }}>
              <span style={{ fontSize: '14px', fontWeight: 600 }}>{identity.name}</span>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{identity.team}</span>
            </div>
            <span style={{
              fontSize: '11px', fontWeight: 600, color: roleColors[identity.role],
              background: roleColors[identity.role] + '22',
              padding: '3px 10px', borderRadius: '20px',
              border: `1px solid ${roleColors[identity.role]}55`
            }}>
              Manager
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}