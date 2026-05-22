const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

export async function api(path, options = {}) {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers
    }
  });
  if (!response.ok) throw new Error((await response.json()).message || 'Request failed');
  if (response.status === 204) return null;
  return response.json();
}
