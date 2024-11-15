import axios from 'axios';
import useAuthStore from '../store/authStore';

const API_URL = process.env.REACT_APP_API_URL;

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true  // Important for sending cookies
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', {
      status: error.response?.status,
      data: error.response?.data,
      config: error.config
    });

    if (error.response?.status === 401) {
      console.log('Unauthorized access, logging out...');
      useAuthStore.getState().logout();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  signup: (data) => api.post('/auth/signup', data),
  login: (data) => api.post('/auth/login', data),
  getCurrentUser: () => api.get('/auth/me'),
  logout: () => api.get('/auth/logout'),
};

export const carAPI = {
  getAllCars: () => api.get('/cars'),
  getCar: (id) => api.get(`/cars/${id}`),
  createCar: (data) => api.post('/cars', data),
  updateCar: (id, data) => api.put(`/cars/${id}`, data),
  deleteCar: (id) => api.delete(`/cars/${id}`),
  searchCars: (query) => api.get(`/cars/search?q=${query}`),
};

export default api; 