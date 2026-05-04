import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const api = axios.create({
  baseURL: 'http://localhost:8080',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('@token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      'Erro de conexão com o servidor';
    return Promise.reject({ ...error, userMessage: message });
  }
);

export const login = (email, senha) =>
  api.post('/api/usuario/login', { email, senha });

export const cadastroPF = (data) =>
  api.post('/api/pessoaFisica', data);

export const cadastroPJ = (data) =>
  api.post('/api/pessoaJuridica', data);

export const getMe = () => api.get('/api/usuario/me');

export default api;
