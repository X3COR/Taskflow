import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// Attach token to every request automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// If token expires, log user out automatically
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// Auth
export const signup  = (data) => api.post('/auth/signup', data);
export const login   = (data) => api.post('/auth/login', data);
export const getMe   = ()     => api.get('/auth/me');

// Users
export const getUsers    = ()           => api.get('/users');
export const updateRole  = (id, role)   => api.patch(`/users/${id}/role`, { role });

// Projects
export const getProjects    = ()       => api.get('/projects');
export const createProject  = (data)   => api.post('/projects', data);
export const updateProject  = (id, d)  => api.patch(`/projects/${id}`, d);
export const deleteProject  = (id)     => api.delete(`/projects/${id}`);

// Tasks
export const getTasks    = ()       => api.get('/tasks');
export const createTask  = (data)   => api.post('/tasks', data);
export const updateTask  = (id, d)  => api.patch(`/tasks/${id}`, d);
export const deleteTask  = (id)     => api.delete(`/tasks/${id}`);