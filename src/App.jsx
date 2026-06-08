import { useEffect, useState } from 'react';
import AuthForm from './components/AuthForm';
import Dashboard from './components/Dashboard';
import { loginUser, registerUser, fetchVenues } from './api';

function App() {
  const [mode, setMode] = useState('login');
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('token') || '');
  const [venues, setVenues] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user && token) {
      loadVenues();
    }
  }, [user, token]);

  const loadVenues = async () => {
    try {
      setError('');
      const data = await fetchVenues(token);
      setVenues(data);
    } catch (err) {
      setError(err.message || 'Unable to load venues.');
    }
  };

  const handleAuthSubmit = async (formData) => {
    setIsLoading(true);
    setError('');

    try {
      if (mode === 'login') {
        const payload = await loginUser(formData);
        setToken(payload.token);
        setUser(payload.user);
        localStorage.setItem('token', payload.token);
        localStorage.setItem('user', JSON.stringify(payload.user));
      } else {
        await registerUser(formData);
        setMode('login');
      }
    } catch (err) {
      setError(err.message || 'Authentication failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    setUser(null);
    setToken('');
    setVenues([]);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const toggleMode = () => {
    setMode((prev) => (prev === 'login' ? 'register' : 'login'));
    setError('');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <header className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-cyan-400/80">venue go</p>
            <h1 className="mt-3 text-4xl font-semibold text-slate-100 sm:text-5xl">Venue management client</h1>
            <p className="mt-4 max-w-2xl text-slate-400">Register or sign in to browse venues, submit booking and venue requests, or manage approvals if you are an admin.</p>
          </div>

          {!user && (
            <button
              onClick={toggleMode}
              className="inline-flex items-center justify-center rounded-2xl border border-cyan-500/30 bg-slate-900/90 px-5 py-3 text-sm font-semibold text-cyan-300 transition hover:border-cyan-400 hover:bg-slate-800"
            >
              {mode === 'login' ? 'Switch to Register' : 'Switch to Login'}
            </button>
          )}
        </header>

        {user ? (
          <Dashboard user={user} token={token} venues={venues} onLogout={handleLogout} onRefresh={loadVenues} />
        ) : (
          <AuthForm mode={mode} onSubmit={handleAuthSubmit} isLoading={isLoading} error={error} />
        )}

        {error && user && (
          <div className="mt-8 rounded-3xl border border-rose-500/40 bg-rose-500/10 p-4 text-slate-200">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
