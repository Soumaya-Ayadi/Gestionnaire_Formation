import axios from 'axios';

// With Vite dev proxy (vite.config.js), /api is forwarded to http://localhost:8080/api
// For production builds, set the full URL here instead
const api = axios.create({
  baseURL: '/api',
});

const parseJwtPayload = (token) => {
  try {
    const payload = token.split('.')[1];
    return JSON.parse(atob(payload));
  } catch {
    return null;
  }
};

const isTokenExpired = (token) => {
  if (!token) return true;
  const payload = parseJwtPayload(token);
  return !payload || !payload.exp || payload.exp * 1000 < Date.now();
};

const signOut = () => {
  localStorage.clear();
  window.location.href = '/login';
};

// attach JWT on every request, and force logout if token has expired
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    if (isTokenExpired(token)) {
      signOut();
      return Promise.reject(new Error('Token expired'));
    }
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// redirect to login on 401
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      signOut();
    }
    return Promise.reject(err);
  }
);

export default api;
