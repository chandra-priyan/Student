import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 12000,
});

api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('adminToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && sessionStorage.getItem('adminToken')) {
      sessionStorage.removeItem('adminToken');
      sessionStorage.removeItem('adminProfile');
    }
    return Promise.reject(error);
  }
);

export const categories = [
  'Classroom',
  'Projector',
  'Wi-Fi',
  'Drinking Water',
  'Laboratory Equipment',
  'Washroom',
  'Hostel Maintenance',
  'Others',
];

export const getErrorMessage = (error) =>
  error.response?.data?.message || error.message || 'Something went wrong. Please try again.';

export default api;
