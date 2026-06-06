const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

const handleResponse = async (res) => {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data?.message || res.statusText || 'Request failed');
  }
  return data;
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
  fetch(`${BASE_URL}/venues`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }).then(handleResponse);

export const fetchOrganizations = () =>
  fetch(`${BASE_URL}/auth/organizations`).then(handleResponse);
