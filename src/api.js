// const BASE_URL = 'https://pro325-backend.onrender.com';
 const BASE_URL = 'http://localhost:8089';

const handleResponse = async (res) => {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data?.message || res.statusText || 'Request failed');
  }
  return data;
};

const authFetch = (token, url, options = {}) => {
  const headers = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  return fetch(url, { ...options, headers }).then(handleResponse);
};

export const registerUser = (payload) =>
  fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  }).then(handleResponse);

export const loginUser = (payload) =>
  fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  }).then(handleResponse);

export const fetchVenues = (token) =>
  authFetch(token, `${BASE_URL}/venues`);

export const fetchOrganizations = (type) => {
  const url = `${BASE_URL}/auth/organizations${type ? `?type=${encodeURIComponent(type)}` : ''}`;
  return fetch(url).then(handleResponse);
};

export const submitBookingRequest = (token, payload) =>
  authFetch(token, `${BASE_URL}/request/booking`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });

// export const submitBookingRequest = async (token, data) => {
//     const response = await fetch(
//         `${BASE_URL}/requests/booking`,
//         {
//             method: "POST",
//             headers: {
//                 "Content-Type": "application/json",
//                 Authorization: `Bearer ${token}`
//             },
//             body: JSON.stringify(data)
//         }
//     );
//     const result = await response.json();
//     if (!response.ok) {
//         throw new Error(result.message);
//     }
//     return result;
// };


export const submitNewVenueRequest = (token, payload) =>
  authFetch(token, `${BASE_URL}/request/new-venue`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });

export const fetchMyRequests = (token) =>
  authFetch(token, `${BASE_URL}/request/my-requests`);

export const fetchPendingUsers = (token) =>
  authFetch(token, `${BASE_URL}/admin/pending`);

export const approveUser = (token, id) =>
  authFetch(token, `${BASE_URL}/admin/approve/${id}`, {
    method: 'PUT',
  });

export const rejectUser = (token, id) =>
  authFetch(token, `${BASE_URL}/admin/reject/${id}`, {
    method: 'PUT',
  });

export const fetchPendingVenueRequests = (token) =>
  authFetch(token, `${BASE_URL}/admin/venue-requests`);

export const approveVenueRequest = (token, id) =>
  authFetch(token, `${BASE_URL}/admin/venue-requests/${id}/approve`, {
    method: 'PUT',
  });

export const rejectVenueRequest = (token, id) =>
  authFetch(token, `${BASE_URL}/admin/venue-requests/${id}/reject`, {
    method: 'PUT',
  });

export const fetchBookingRequests = (token) =>
  authFetch(token, `${BASE_URL}/admin/booking-requests`);

export const approveBookingRequest = (token, id) =>
  authFetch(token, `${BASE_URL}/admin/booking-requests/${id}/approve`, {
    method: 'PUT',
  });

export const rejectBookingRequest = (token, id) =>
  authFetch(token, `${BASE_URL}/admin/booking-requests/${id}/reject`, {
    method: 'PUT',
  });
export const fetchNotifications = (token) =>
  authFetch(token, `${BASE_URL}/notifications`);

export const markNotificationAsRead = (token, id) =>
  authFetch(token, `${BASE_URL}/notifications/${id}/read`, {
    method: 'PUT',
  });

export const markAllNotificationsAsRead = (token) =>
  authFetch(token, `${BASE_URL}/notifications/read-all`, {
    method: 'PUT',
  });

  
export const clearAllNotifications = (token) =>
  authFetch(token, `${BASE_URL}/notifications/clear`, {
    method: 'DELETE',
  });