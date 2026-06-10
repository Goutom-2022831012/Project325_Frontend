import { useEffect, useMemo, useState } from 'react';
import {
  submitBookingRequest,
  submitNewVenueRequest,
  fetchMyRequests,
  fetchPendingUsers,
  approveUser,
  rejectUser,
  fetchPendingVenueRequests,
  approveVenueRequest,
  rejectVenueRequest,
  fetchBookingRequests,
  approveBookingRequest,
  rejectBookingRequest,


  fetchNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
   clearAllNotifications,
} from '../api';

const Dashboard = ({ user, token, onLogout, venues, onRefresh }) => {
  const [bookingForm, setBookingForm] = useState({
    venue_id: '',
    event_name: '',
    event_date: '',
    start_time: '',
    end_time: '',
    purpose: '',
  });
  const [newVenueForm, setNewVenueForm] = useState({
    venue_name: '',
    location: '',
    capacity: '',
    reason: '',
  });
  const [adminData, setAdminData] = useState({
    users: [],
    venueRequests: [],
    bookingRequests: [],
  });
  const [userRequests, setUserRequests] = useState({
    bookings: [],
    venueRequests: [],
  });
  const [statusMessage, setStatusMessage] = useState('');
  const [statusError, setStatusError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

const [notifications, setNotifications] = useState([]);
const [showNotifications, setShowNotifications] = useState(false);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return dateString;
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  useEffect(() => {
    if (user.role === 'admin') {
      loadAdminData();
    } else {
      loadUserRequests();
    }
  }, [user.role, token]);

useEffect(() => {
  if (user.role === 'representative') {
    loadNotifications();

    const interval = setInterval(() => {
      loadNotifications();
    }, 10000);

    return () => clearInterval(interval);
  }
}, [user.role, token]);



const unreadCount = notifications.filter(
  (n) => !n.is_read
).length;



const loadNotifications = async () => {
  try {
    const data = await fetchNotifications(token);
    setNotifications(data);
  } catch (err) {
    console.log('Notification error:', err.message);
  }
};


const handleNotificationClick = async (id) => {
  try {
    await markNotificationAsRead(token, id);

    setNotifications((prev) =>
      prev.map((n) =>
        n.id === id ? { ...n, is_read: 1 } : n
      )
    );
  } catch (err) {
    console.log(err.message);
  }
};

const handleClearAll = async () => {
  try {
    await clearAllNotifications(token);
    setNotifications([]);
  } catch (err) {
    console.error(err);
  }
};


  const loadUserRequests = async () => {
    setStatusError('');
    try {
      const requests = await fetchMyRequests(token);
      setUserRequests(requests);
    } catch (err) {
      if (err.message === 'Not Found') {
        setUserRequests({ bookings: [], venueRequests: [] });
        return;
      }
      setStatusError(err.message || 'Unable to load your requests.');
    }
  };

  const loadAdminData = async () => {
    setStatusError('');
    try {
      setActionLoading(true);
      const [users, venueRequests, bookingRequests] = await Promise.all([
        fetchPendingUsers(token),
        fetchPendingVenueRequests(token),
        fetchBookingRequests(token),
      ]);
      setAdminData({ users, venueRequests, bookingRequests });
    } catch (err) {
      setStatusError(err.message || 'Unable to load admin data.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleBookingInput = (e) => {
    const { name, value } = e.target;
    setBookingForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleNewVenueInput = (e) => {
    const { name, value } = e.target;
    setNewVenueForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    setStatusError('');
    setStatusMessage('');

    try {
      setActionLoading(true);
      await submitBookingRequest(token, bookingForm);
      setStatusMessage('Booking request submitted successfully.');
      setBookingForm({ venue_id: '', event_name: '', event_date: '', start_time: '', end_time: '', purpose: '' });
      await loadUserRequests();
    } catch (err) {
      setStatusError(err.message || 'Unable to submit booking request.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleNewVenueSubmit = async (e) => {
    e.preventDefault();
    setStatusError('');
    setStatusMessage('');

    try {
      setActionLoading(true);
      await submitNewVenueRequest(token, newVenueForm);
      setStatusMessage('New venue request submitted successfully.');
      setNewVenueForm({ venue_name: '', location: '', capacity: '', reason: '' });
      await loadUserRequests();
    } catch (err) {
      setStatusError(err.message || 'Unable to submit new venue request.');
    } finally {
      setActionLoading(false);
    }
  };

  const runAdminAction = async (actionFn, id, successMessage) => {
    setStatusError('');
    setStatusMessage('');

    try {
      setActionLoading(true);
      await actionFn(token, id);
      setStatusMessage(successMessage);
      await loadAdminData();
    } catch (err) {
      setStatusError(err.message || 'Action failed.');
    } finally {
      setActionLoading(false);
    }
  };

  const venueOptions = useMemo(
    () => venues.map((venue) => ({ value: venue.id, label: venue.name })),
    [venues]
  );

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-700 bg-slate-900/80 p-6 shadow-xl shadow-slate-950/10">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm text-cyan-300">Welcome back,</p>
            <h1 className="text-3xl font-semibold text-slate-100">{user.name}</h1>
            
            <p className="mt-2 text-sm text-slate-400">
              Role: {user.role || 'user'}
              {user.role !== 'admin' && (
                <>
                  {" || "}
                  Reg. Number: {user.registration_number || 'N/A'}
                  {" || "}
                  Organization: {user.organization_name || 'N/A'}
                </>
              )}
            </p>


            <p className="mt-1 text-sm text-slate-500">Status: {user.status || 'approved'}</p>
          </div>
          <div className="flex flex-wrap gap-3 items-center">




            {user.role === 'representative' && (
              <div className="relative">
                {/* Bell Button */}
                <button
                  onClick={() => setShowNotifications((prev) => !prev)}
                  className="relative rounded-2xl bg-slate-800 px-4 py-3 text-white"
                >
                  🔔

                  {/* red dot */}
                 {unreadCount > 0 && (
                    <span className="absolute -top-2 -right-2 min-w-[20px] h-5 px-1 flex items-center justify-center rounded-full bg-red-500 text-white text-xs font-bold">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {/* Dropdown */}
                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-slate-900 border border-slate-700 shadow-xl z-50">
                   <div className="p-3 border-b border-slate-700 flex justify-between items-center">
                    <span className="text-sm text-white">
                      Notifications ({unreadCount})
                    </span>

                    <div className="flex gap-3">
                      <button
                        onClick={async () => {
                          await markAllNotificationsAsRead(token);

                          setNotifications((prev) =>
                            prev.map((n) => ({
                              ...n,
                              is_read: 1,
                            }))
                          );
                        }}
                        className="text-xs text-cyan-400"
                      >
                        Mark all read
                      </button>

                      <button
                        onClick={handleClearAll}
                        className="text-xs text-red-400"
                      >
                        Clear All
                      </button>
                    </div>
                  </div>

                    <div className="max-h-80 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <p className="p-3 text-slate-400 text-sm">No notifications</p>
                      ) : (
                        notifications.map((n) => (
                          <div
                            key={n.id}
                            onClick={() => handleNotificationClick(n.id)}
                            className={`p-3 border-b border-slate-800 cursor-pointer hover:bg-slate-800 ${
                              n.is_read ? 'opacity-50' : ''
                            }`}
                          >
                            <p className="text-sm text-white">{n.title}</p>
                            <p className="text-xs text-slate-400">{n.message}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}


            
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

      {statusMessage && (
        <div className="rounded-3xl border border-emerald-500/40 bg-emerald-500/10 p-4 text-emerald-200">
          {statusMessage}
        </div>
      )}
      {statusError && (
        <div className="rounded-3xl border border-rose-500/40 bg-rose-500/10 p-4 text-rose-200">
          {statusError}
        </div>
      )}

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

        <div className="space-y-5">
          {user.role === 'admin' ? (
            <div className="rounded-3xl border border-slate-700 bg-slate-900/80 p-6 shadow-xl shadow-slate-950/10">
              <h2 className="text-xl font-semibold text-slate-100 mb-4">Admin Panel</h2>
              <div className="space-y-6">
                <section>
                  <h3 className="text-lg font-semibold text-slate-100 mb-3">Pending Users</h3>
                  {adminData.users.length === 0 ? (
                    <p className="text-slate-400">No pending users.</p>
                  ) : (
                    <div className="space-y-3">
                      {adminData.users.map((pending) => (
                        <div key={pending.id} className="rounded-3xl border border-slate-800 bg-slate-950/70 p-4">
                          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                              <p className="font-semibold text-slate-100">{pending.name}</p>
                              <p className="text-sm text-slate-400">{pending.email}</p>
                              <p className="text-sm text-slate-400">Org: {pending.organization_name || 'N/A'}</p>
                            </div>
                            <div className="flex gap-2 mt-3 sm:mt-0">
                              <button
                                onClick={() => runAdminAction(approveUser, pending.id, 'User approved.')}
                                disabled={actionLoading}
                                className="rounded-2xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:opacity-50"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => runAdminAction(rejectUser, pending.id, 'User rejected.')}
                                disabled={actionLoading}
                                className="rounded-2xl bg-rose-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-rose-400 disabled:opacity-50"
                              >
                                Reject
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </section>

                <section>
                  <h3 className="text-lg font-semibold text-slate-100 mb-3">Venue Creation Requests</h3>
                  {adminData.venueRequests.length === 0 ? (
                    <p className="text-slate-400">No venue creation requests.</p>
                  ) : (
                    <div className="space-y-3">
                      {adminData.venueRequests.map((request) => (
                        <div key={request.id} className="rounded-3xl border border-slate-800 bg-slate-950/70 p-4">
                          <p className="font-semibold text-slate-100">{request.venue_name}</p>
                          {/* <p className="text-sm text-slate-400">Requested by ID: {request.requested_by}</p> */}

                          <p className="text-sm text-slate-400">
                            Requested by: {request.user_name}
                          </p>

                          <p className="text-sm text-slate-400">
                            Organization: {request.organization_name}
                          </p>


                          <p className="text-sm text-slate-400">Reason: {request.reason}</p>
                          <div className="mt-3 flex gap-2">
                            <button
                              onClick={() => runAdminAction(approveVenueRequest, request.id, 'Venue request approved.')}
                              disabled={actionLoading}
                              className="rounded-2xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:opacity-50"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => runAdminAction(rejectVenueRequest, request.id, 'Venue request rejected.')}
                              disabled={actionLoading}
                              className="rounded-2xl bg-rose-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-rose-400 disabled:opacity-50"
                            >
                              Reject
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </section>

                <section>
                  <h3 className="text-lg font-semibold text-slate-100 mb-3">Booking Requests</h3>
                  {adminData.bookingRequests.length === 0 ? (
                    <p className="text-slate-400">No booking requests.</p>
                  ) : (
                    <div className="space-y-3">
                      {adminData.bookingRequests.map((request) => (
                        <div key={request.id} className="rounded-3xl border border-slate-800 bg-slate-950/70 p-4">
                          <p className="font-semibold text-slate-100">{request.event_name}</p>
                          <p className="text-sm text-slate-400">Venue: {request.venue_name || request.venue_id}</p>
                          <p className="text-sm text-slate-400">Organization/Dept: {request.organization_name}</p>
                          <p className="text-sm text-slate-400">Date: {formatDate(request.event_date)}</p>
                          <p className="text-sm text-slate-400"> Time: {request.start_time?.slice(0, 5)} - {request.end_time?.slice(0, 5)}</p>
                          <p className="text-sm text-slate-400">Status: {request.status}</p>
                          <div className="mt-3 flex gap-2">
                            <button
                              onClick={() => runAdminAction(approveBookingRequest, request.id, 'Booking request approved.')}
                              disabled={actionLoading}
                              className="rounded-2xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:opacity-50"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => runAdminAction(rejectBookingRequest, request.id, 'Booking request rejected.')}
                              disabled={actionLoading}
                              className="rounded-2xl bg-rose-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-rose-400 disabled:opacity-50"
                            >
                              Reject
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="rounded-3xl border border-slate-700 bg-slate-900/80 p-6 shadow-xl shadow-slate-950/10">
                <h2 className="text-xl font-semibold text-slate-100 mb-4">Submit a Booking Request</h2>
                <form className="space-y-4" onSubmit={handleBookingSubmit}>
                  <div>
                    <label className="block text-sm font-medium text-slate-300">Venue</label>
                    <select
                      name="venue_id"
                      value={bookingForm.venue_id}
                      onChange={handleBookingInput}
                      className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none focus:border-cyan-500"
                    >
                      <option value="" disabled>Select a venue</option>
                      {venueOptions.map((venue) => (
                        <option key={venue.value} value={venue.value}>{venue.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300">Event name</label>
                    <input
                      type="text"
                      name="event_name"
                      value={bookingForm.event_name}
                      onChange={handleBookingInput}
                      placeholder="Event name"
                      className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-slate-300">Date</label>
                      <input
                        type="date"
                        name="event_date"
                        value={bookingForm.event_date}
                        onChange={handleBookingInput}
                        className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none focus:border-cyan-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300">Start time</label>
                      <input
                        type="time"
                        name="start_time"
                        value={bookingForm.start_time}
                        onChange={handleBookingInput}
                        className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none focus:border-cyan-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300">End time</label>
                      <input
                        type="time"
                        name="end_time"
                        value={bookingForm.end_time}
                        onChange={handleBookingInput}
                        className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none focus:border-cyan-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300">Purpose</label>
                    <textarea
                      name="purpose"
                      value={bookingForm.purpose}
                      onChange={handleBookingInput}
                      rows="3"
                      placeholder="Why are you booking this venue?"
                      className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none focus:border-cyan-500"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="w-full rounded-2xl bg-cyan-500 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {actionLoading ? 'Submitting...' : 'Submit Booking Request'}
                  </button>
                </form>
              </div>

              <div className="rounded-3xl border border-slate-700 bg-slate-900/80 p-6 shadow-xl shadow-slate-950/10">
                <h2 className="text-xl font-semibold text-slate-100 mb-4">Request a New Venue</h2>
                <form className="space-y-4" onSubmit={handleNewVenueSubmit}>
                  <div>
                    <label className="block text-sm font-medium text-slate-300">Venue Name</label>
                    <input
                      type="text"
                      name="venue_name"
                      value={newVenueForm.venue_name}
                      onChange={handleNewVenueInput}
                      placeholder="Venue name"
                      className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300">Location</label>
                    <input
                      type="text"
                      name="location"
                      value={newVenueForm.location}
                      onChange={handleNewVenueInput}
                      placeholder="Location"
                      className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300">Capacity</label>
                    <input
                      type="number"
                      name="capacity"
                      value={newVenueForm.capacity}
                      onChange={handleNewVenueInput}
                      placeholder="Capacity"
                      className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300">Reason</label>
                    <textarea
                      name="reason"
                      value={newVenueForm.reason}
                      onChange={handleNewVenueInput}
                      rows="3"
                      placeholder="Why should this venue be added?"
                      className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none focus:border-cyan-500"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="w-full rounded-2xl bg-cyan-500 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {actionLoading ? 'Submitting...' : 'Submit Venue Request'}
                  </button>
                </form>
              </div>

              <div className="rounded-3xl border border-slate-700 bg-slate-900/80 p-6 shadow-xl shadow-slate-950/10">
                <h2 className="text-xl font-semibold text-slate-100 mb-4">My Request Status</h2>
                <div className="space-y-6">
                  <section>
                    <h3 className="text-lg font-semibold text-slate-100 mb-3">Booking Requests</h3>
                    {userRequests.bookings.length === 0 ? (
                      <p className="text-slate-400">No booking requests submitted yet.</p>
                    ) : (
                      <div className="space-y-3">
                        {userRequests.bookings.map((request) => (
                          <div key={request.id} className="rounded-3xl border border-slate-800 bg-slate-950/70 p-4">
                            <p className="font-semibold text-slate-100">{request.event_name}</p>
                            <p className="text-sm text-slate-400">Venue: {request.venue_name}</p>
                            <p className="text-sm text-slate-400">Organization: {request.organization_name}</p>
                            <p className="text-sm text-slate-400">Date: {formatDate(request.event_date)}</p>
                            <p className="text-sm text-slate-400">Time: {request.start_time?.slice(0, 5)} - {request.end_time?.slice(0, 5)}</p>
                            <p className="text-sm text-slate-400">Status: {request.status}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </section>

                  <section>
                    <h3 className="text-lg font-semibold text-slate-100 mb-3">Venue Creation Requests</h3>
                    {userRequests.venueRequests.length === 0 ? (
                      <p className="text-slate-400">No venue creation requests submitted yet.</p>
                    ) : (
                      <div className="space-y-3">
                        {userRequests.venueRequests.map((request) => (
                          <div key={request.id} className="rounded-3xl border border-slate-800 bg-slate-950/70 p-4">
                            <p className="font-semibold text-slate-100">{request.venue_name}</p>
                            <p className="text-sm text-slate-400">Location: {request.location || 'N/A'}</p>
                            <p className="text-sm text-slate-400">Capacity: {request.capacity || 'N/A'}</p>
                            <p className="text-sm text-slate-400">Status: {request.status}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </section>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
