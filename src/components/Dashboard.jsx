const Dashboard = ({ user, onLogout, venues, onRefresh }) => {
  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-700 bg-slate-900/80 p-6 shadow-xl shadow-slate-950/10">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm text-cyan-300">Welcome back,</p>
            <h1 className="text-3xl font-semibold text-slate-100">{user.name}</h1>
            <p className="mt-2 text-sm text-slate-400">Role: {user.role || 'user'}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={onRefresh}
              className="rounded-2xl bg-slate-800 px-5 py-3 text-sm text-slate-100 transition hover:bg-slate-700"
            >
              Refresh Venues
            </button>
            <button
              onClick={onLogout}
              className="rounded-2xl bg-rose-500 px-5 py-3 text-sm text-slate-950 transition hover:bg-rose-400"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.5fr_1fr]">
        <div className="rounded-3xl border border-slate-700 bg-slate-900/80 p-6 shadow-xl shadow-slate-950/10">
          <h2 className="text-xl font-semibold text-slate-100 mb-4">Available Venues</h2>
          {venues.length === 0 ? (
            <p className="text-slate-400">No venues found. Please add one from the backend or request a new venue.</p>
          ) : (
            <div className="space-y-4">
              {venues.map((venue) => (
                <div key={venue.id} className="rounded-3xl border border-slate-800 bg-slate-950/70 p-4">
                  <p className="text-lg font-semibold text-slate-100">{venue.name}</p>
                  <p className="text-sm text-slate-400">Location: {venue.location}</p>
                  <p className="text-sm text-slate-400">Capacity: {venue.capacity}</p>
                  <p className="text-sm text-slate-400">Status: {venue.status || 'active'}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-3xl border border-slate-700 bg-slate-900/80 p-6 shadow-xl shadow-slate-950/10">
          <h2 className="text-xl font-semibold text-slate-100 mb-4">Quick Tips</h2>
          <ul className="space-y-3 text-slate-300">
            <li>• Use registration to create a pending account.</li>
            <li>• Login to see venue information from the API.</li>
            <li>• Admins can approve users and venue requests with backend routes.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
