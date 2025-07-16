import axios from 'axios';

// Create axios instance
const api = axios.create({
  baseURL: 'http://localhost:1337',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for logging
api.interceptors.request.use(
  (config) => {
    const requestInfo = {
      url: config.url,
      method: config.method,
      hasAuthHeader: !!config.headers.Authorization,
    };
    
    // For POST or PUT requests, log the data being sent
    if ((config.method === 'post' || config.method === 'put') && config.data) {
      requestInfo.data = typeof config.data === 'string' 
        ? JSON.parse(config.data) 
        : config.data;
    }
    
    console.log('API Request:', requestInfo);
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for logging
api.interceptors.response.use(
  (response) => {
    console.log('API Response:', {
      url: response.config.url,
      status: response.status,
      statusText: response.statusText,
    });
    return response;
  },
  (error) => {
    console.error('API Response Error:', {
      url: error.config?.url,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
    });
    return Promise.reject(error);
  }
);

// Check for token on initial load
const token = localStorage.getItem('token');
if (token) {
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  console.log('API: Token loaded from localStorage');
}

export default api;