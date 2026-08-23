import axios from 'axios';

// Centralized Axios instance for FLORA frontend → backend communication
const api = axios.create({
  baseURL:
    import.meta.env.VITE_API_BASE_URL ||
    'http://localhost:5000/api/v1',

  timeout: 60000,
});

// Normalize FLORA API errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const errorPayload = error.response?.data?.error || {
      code: error.code || 'NETWORK_ERROR',
      message:
        error.message || 'Unable to connect to the backend server.',
      details: error.response?.data || null,
    };

    // Return a rejected Error instance so err.message and err.code remain accessible
    const errObj = new Error(errorPayload.message);
    errObj.code = errorPayload.code;
    errObj.response = error.response;
    errObj.details = errorPayload.details;

    return Promise.reject(errObj);
  }
);

export default api;