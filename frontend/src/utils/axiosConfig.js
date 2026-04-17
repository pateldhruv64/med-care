import axios from 'axios';

const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const REQUEST_TIMEOUT_MS = Number(import.meta.env.VITE_API_TIMEOUT_MS) || 10000;
const MAX_RETRY_ATTEMPTS = 2;
const RETRY_BASE_DELAY_MS = 500;
const RETRYABLE_METHODS = new Set(['get', 'head', 'options']);

const api = axios.create({
  baseURL: `${baseUrl}/api`,
  timeout: REQUEST_TIMEOUT_MS,
  timeoutErrorMessage: 'Request timed out. Please try again.',
  withCredentials: true, // Send cookies with requests
  headers: {
    'Content-Type': 'application/json',
  },
});

const shouldRetryRequest = (error) => {
  const method = error?.config?.method?.toLowerCase();
  const statusCode = error?.response?.status;

  if (!method || !RETRYABLE_METHODS.has(method)) {
    return false;
  }

  const isNetworkError = !error.response;
  const isServerError = typeof statusCode === 'number' && statusCode >= 500;

  return isNetworkError || isServerError;
};

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error?.config;

    if (!config || !shouldRetryRequest(error)) {
      return Promise.reject(error);
    }

    config.__retryCount = config.__retryCount || 0;

    if (config.__retryCount >= MAX_RETRY_ATTEMPTS) {
      return Promise.reject(error);
    }

    config.__retryCount += 1;
    const delay = RETRY_BASE_DELAY_MS * 2 ** (config.__retryCount - 1);

    await new Promise((resolve) => setTimeout(resolve, delay));
    return api(config);
  },
);

export default api;
