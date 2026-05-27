import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import AgentCall from './pages/AgentCall';
import AgentLogin from './pages/AgentLogin';
import AgentDashboard from './pages/AgentDashboard';
import AdminLogin from './pages/AdminLogin';
import AdminPanel from './pages/AdminPanel';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

function App() {
  const [user, setUser] = useState(null);
  const [agent, setAgent] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [role, setRole] = useState(localStorage.getItem('role'));

  useEffect(() => {
    if (token && role === 'owner') {
      fetch(`${API}/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
        .then(r => r.ok ? r.json() : Promise.reject())
        .then(setUser)
        .catch(() => logout());
    }
  }, [token, role]);

  const login = (t, u) => { localStorage.setItem('token', t); localStorage.setItem('role', 'owner'); setToken(t); setRole('owner'); setUser(u); };
  const agentLogin = (t, a) => { localStorage.setItem('token', t); localStorage.setItem('role', 'agent'); setToken(t); setRole('agent'); setAgent(a); };
  const adminLogin = (t) => { localStorage.setItem('token', t); localStorage.setItem('role', 'admin'); setToken(t); setRole('admin'); };
  const logout = () => { localStorage.removeItem('token'); localStorage.removeItem('role'); setToken(null); setRole(null); setUser(null); setAgent(null); };

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={token && role === 'owner' ? <Navigate to="/dashboard" /> : <Login onLogin={login} />} />
        <Route path="/signup" element={token && role === 'owner' ? <Navigate to="/dashboard" /> : <Signup onLogin={login} />} />
        <Route path="/dashboard" element={token && role === 'owner' ? <Dashboard user={user} token={token} onLogout={logout} /> : <Navigate to="/login" />} />
        <Route path="/agent-login" element={token && role === 'agent' ? <Navigate to="/agent-dashboard" /> : <AgentLogin onAgentLogin={agentLogin} />} />
        <Route path="/agent-dashboard" element={token && role === 'agent' ? <AgentDashboard agent={agent} token={token} onLogout={logout} /> : <Navigate to="/agent-login" />} />
        <Route path="/call/:meetingId" element={token ? <AgentCall token={token} user={user || agent} /> : <Navigate to="/login" />} />
        <Route path="/admin" element={token && role === 'admin' ? <AdminPanel token={token} onLogout={logout} /> : <AdminLogin onAdminLogin={adminLogin} />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
export { API };
