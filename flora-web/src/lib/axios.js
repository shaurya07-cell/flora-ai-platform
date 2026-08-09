import axios from 'axios';

// Create a centralized Axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000, // 15 seconds request timeout
});

// Response interceptor for normalized API responses or error payloads
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Format error response matching the Flora error structure
    const errorPayload = error.response?.data?.error || {
      code: 'NETWORK_ERROR',
      message: error.message || 'Unable to connect to the backend server.',
      details: error.response?.data || null
    };
    return Promise.reject(errorPayload);
  }
);

export default api;
