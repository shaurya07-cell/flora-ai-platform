import axios from 'axios';

// Centralized Axios instance for FLORA frontend → backend communication
const api = axios.create({
  baseURL:
    import.meta.env.VITE_API_BASE_URL ||
    'http://localhost:5000/api/v1',

  timeout: 15000,
});

// Normalize FLORA API errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const errorPayload = error.response?.data?.error || {
      code: 'NETWORK_ERROR',
      message:
        error.message || 'Unable to connect to the backend server.',
      details: error.response?.data || null,
    };

    return Promise.reject(errorPayload);
  }
);

export default api;