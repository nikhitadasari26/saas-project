import axios from 'axios';

const getApiBaseUrl = () => {
  const hostname = window.location.hostname;
  return `http://${hostname}:5000/api`;
};

const api = axios.create({
  baseURL: getApiBaseUrl(),
});

// ✅ ALWAYS ATTACH TOKEN
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
