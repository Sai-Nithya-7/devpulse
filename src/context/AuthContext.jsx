import { createContext, useContext, useState } from 'react';
import { developers } from '../data';

const AuthContext = createContext(null);

const managers = [
  { id: 'MGR-01', name: 'Rina Kapoor',  role: 'manager', team: 'Payments API' },
  { id: 'MGR-02', name: 'Samir Gupta',  role: 'manager', team: 'Checkout Web' },
  { id: 'MGR-03', name: 'Priya Nair',   role: 'manager', team: 'Mobile Growth' }
];

export const allIdentities = [
  ...developers.map(d => ({
    id: d.developer_id,
    name: d.developer_name,
    role: 'developer',
    manager_id: d.manager_id,
    team: d.team_name,
  })),
  ...managers,
];

export function AuthProvider({ children }) {
  const [identity, setIdentity] = useState(null);
  return (
    <AuthContext.Provider value={{ identity, setIdentity }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}