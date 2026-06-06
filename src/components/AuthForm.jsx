import { useEffect, useState } from 'react';
import { fetchOrganizations } from '../api';

const AuthForm = ({ mode, onSubmit, isLoading, error }) => {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    organization_id: '',
    registration_number: ''
  });
  const [organizations, setOrganizations] = useState([]);
  const [orgError, setOrgError] = useState('');

  useEffect(() => {
    if (mode !== 'register') {
      return;
    }

    const loadOrgs = async () => {
      setOrgError('');
      try {
        const orgList = await fetchOrganizations();
        setOrganizations(orgList);
      } catch (err) {
        setOrgError(err.message || 'Unable to load organizations.');
      }
    };

    loadOrgs();
  }, [mode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <div className="rounded-3xl bg-slate-900/80 border border-slate-700 p-8 shadow-2xl shadow-slate-950/20 max-w-xl w-full mx-auto">
      <h2 className="text-3xl font-semibold text-slate-100 mb-6 text-center">{mode === 'login' ? 'Sign In' : 'Register'}</h2>
      <form onSubmit={handleSubmit} className="space-y-5">
        {mode === 'register' && (
          <div>
            <label className="block text-sm font-medium text-slate-300">Organization</label>
            <select
              name="organization_id"
              value={form.organization_id}
              onChange={handleChange}
              className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none focus:border-cyan-500"
            >
              <option value="" disabled>
                {organizations.length === 0 ? 'Loading organizations...' : 'Select an organization'}
              </option>
              {organizations.map((org) => (
                <option key={org.id} value={org.id}>
                  {org.name}
                </option>
              ))}
            </select>
            {orgError && <p className="mt-2 text-sm text-rose-400">{orgError}</p>}
          </div>
        )}

        {mode === 'register' && (
          <div>
            <label className="block text-sm font-medium text-slate-300">Registration Number</label>
            <input
              type="text"
              name="registration_number"
              value={form.registration_number}
              onChange={handleChange}
              placeholder="Registration Number"
              className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none focus:border-cyan-500"
            />
          </div>
        )}

        {mode === 'register' && (
          <div>
            <label className="block text-sm font-medium text-slate-300">Full Name</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Your Name"
              className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none focus:border-cyan-500"
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-slate-300">Email</label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Email address"
            className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none focus:border-cyan-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300">Password</label>
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Password"
            className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none focus:border-cyan-500"
          />
        </div>

        {error && <p className="text-sm text-rose-400">{error}</p>}

        <button
          type="submit"
          disabled={isLoading}
          className="mt-2 w-full rounded-2xl bg-cyan-500 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isLoading ? 'Working...' : mode === 'login' ? 'Login' : 'Register'}
        </button>
      </form>
    </div>
  );
};

export default AuthForm;
