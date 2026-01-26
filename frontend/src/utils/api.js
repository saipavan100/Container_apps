import axios from 'axios';

// Smart API URL detection
const getAPIURL = () => {
  // 1. Explicit environment variable override (highest priority)
  if (process.env.REACT_APP_API_URL) {
    console.log('🔧 Using REACT_APP_API_URL from env:', process.env.REACT_APP_API_URL);
    return process.env.REACT_APP_API_URL;
  }
  
  // 2. Detect based on hostname (smart detection)
  const hostname = window.location.hostname;
  const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';
  
  // 3. Local development detection
  if (isLocalhost) {
    const port = window.location.port;
    // If on port 3000 (React dev server), backend is on port 8080
    if (port === '3000' || port === '') {
      console.log('🚀 Local dev detected - connecting to localhost:8080');
      return 'http://localhost:8080/api';
    }
  }
  
  // 4. Production/Single service (both on same domain/port)
  console.log('🌐 Production mode - using relative API path');
  return '/api';
};

const API_URL = getAPIURL();

console.log('🎯 API Base URL:', API_URL);
console.log('🌍 Environment:', process.env.NODE_ENV, `| Hostname: ${window.location.hostname}`);

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor
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
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
