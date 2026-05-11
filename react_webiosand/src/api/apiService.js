import axios from 'axios';
import { SessionManager } from '../storage/SessionManager';

const BASE_URL = 'http://10.0.2.2:8080/'; // Android emulator loopback; change for physical device

const client = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
});

client.interceptors.request.use(async (config) => {
  const token = await SessionManager.getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const api = {
  // Auth
  register: (username, email, password, displayName) =>
    client.post('api/auth/register', { username, email, password, displayName }),

  login: (usernameOrEmail, password) =>
    client.post('api/auth/login', { usernameOrEmail, password }),

  me: () => client.get('api/me'),

  // Plants
  getPlants: () => client.get('api/plants'),

  getPlant: (id) => client.get(`api/plants/${id}`),

  createPlant: (plantData) => client.post('api/plants', plantData),

  updatePlant: (id, plantData) => client.put(`api/plants/${id}`, plantData),

  deletePlant: (id) => client.delete(`api/plants/${id}`),
};
