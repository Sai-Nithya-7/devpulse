import { useAuth } from './context/AuthContext';
import LoginScreen from './components/LoginScreen';
import ICView from './pages/ICView';
import ManagerView from './pages/ManagerView';

export default function App() {
  const { identity, setIdentity } = useAuth();

  if (!identity) {
    return <LoginScreen onLogin={setIdentity} />;
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <nav style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 32px', height: '56px',
        background: 'var(--surface)', borderBottom: '1px solid var(--border)',
        position: 'sticky', top: 0, zIndex: 100,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '20px' }}>⚡</span>
          <span style={{ fontWeight: 700, fontSize: '16px', letterSpacing: '-0.3px' }}>
            DevPulse
          </span>
          <span style={{
            fontSize: '11px', color: 'var(--text-muted)',
            background: 'var(--surface-2)', border: '1px solid var(--border)',
            borderRadius: '4px', padding: '2px 7px', marginLeft: '4px',
          }}>MVP</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            fontSize: '13px', color: 'var(--text-muted)',
            display: 'flex', alignItems: 'center', gap: '8px',
          }}>
            <span style={{
              width: '28px', height: '28px', borderRadius: '50%',
              background: identity.role === 'manager' ? 'var(--purple)' : 'var(--blue)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '12px', fontWeight: 700, color: '#fff',
            }}>
              {identity.name.charAt(0)}
            </span>
            <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.3 }}>
              <span style={{ color: 'var(--text)', fontWeight: 600, fontSize: '13px' }}>
                {identity.name}
              </span>
              <span style={{ fontSize: '11px', textTransform: 'capitalize' }}>
                {identity.role} · {identity.team}
              </span>
            </div>
          </div>
          <button onClick={() => setIdentity(null)} style={{
            background: 'var(--surface-2)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius-sm)', padding: '6px 12px',
            color: 'var(--text-muted)', fontSize: '12px', cursor: 'pointer',
          }}>
            Switch
          </button>
        </div>
      </nav>

      <main style={{ padding: '32px', maxWidth: '1000px', margin: '0 auto' }}>
        {identity.role === 'developer'
          ? <ICView lockedDeveloperId={identity.id} />
          : <ManagerView lockedManagerId={identity.id} />
        }
      </main>
    </div>
  );
}