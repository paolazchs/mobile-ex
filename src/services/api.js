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

export const getMe = () => api.get('/api/usuario/me');

export const getPessoasFisicas = () => api.get('/api/pessoaFisica');
export const getPessoaFisica = (id) => api.get(`/api/pessoaFisica/${id}`);
export const cadastroPF = (data) => api.post('/api/pessoaFisica', data);
export const updatePessoaFisica = (id, data) => api.put(`/api/pessoaFisica/${id}`, data);
export const deletePessoaFisica = (id) => api.delete(`/api/pessoaFisica/${id}`);

export const getPessoasJuridicas = () => api.get('/api/pessoaJuridica');
export const getPessoaJuridica = (id) => api.get(`/api/pessoaJuridica/${id}`);
export const cadastroPJ = (data) => api.post('/api/pessoaJuridica', data);
export const updatePessoaJuridica = (id, data) => api.put(`/api/pessoaJuridica/${id}`, data);
export const deletePessoaJuridica = (id) => api.delete(`/api/pessoaJuridica/${id}`);

export const getEnderecos = () => api.get('/api/endereco');
export const getEndereco = (id) => api.get(`/api/endereco/${id}`);
export const createEndereco = (data) => api.post('/api/endereco', data);
export const updateEndereco = (id, data) => api.put(`/api/endereco/${id}`, data);
export const deleteEndereco = (id) => api.delete(`/api/endereco/${id}`);

export const getTelefones = () => api.get('/api/telefones');
export const getTelefone = (id) => api.get(`/api/telefones/${id}`);
export const createTelefone = (data) => api.post('/api/telefones', data);
export const updateTelefone = (id, data) => api.put(`/api/telefones/${id}`, data);
export const deleteTelefone = (id) => api.delete(`/api/telefones/${id}`);

export const getProdutos = () => api.get('/api/produto');
export const getProduto = (id) => api.get(`/api/produto/${id}`);
export const createProduto = (data) => api.post('/api/produto', data);
export const updateProduto = (id, data) => api.put(`/api/produto/${id}`, data);
export const deleteProduto = (id) => api.delete(`/api/produto/${id}`);

export const getPedidos = () => api.get('/api/pedido');
export const getPedido = (id) => api.get(`/api/pedido/${id}`);
export const getMeusPedidos = () => api.get('/api/pedido/meus-pedidos');
export const createPedido = (data) => api.post('/api/pedido', data);
export const updatePedido = (id, data) => api.put(`/api/pedido/${id}`, data);
export const deletePedido = (id) => api.delete(`/api/pedido/${id}`);

export const getItensPedido = () => api.get('/api/itens-pedido');
export const getItemPedido = (id) => api.get(`/api/itens-pedido/${id}`);
export const createItemPedido = (data) => api.post('/api/itens-pedido', data);
export const updateItemPedido = (id, data) => api.put(`/api/itens-pedido/${id}`, data);
export const deleteItemPedido = (id) => api.delete(`/api/itens-pedido/${id}`);

export const getVeiculos = () => api.get('/api/veiculo');
export const getVeiculo = (id) => api.get(`/api/veiculo/${id}`);
export const createVeiculo = (data) => api.post('/api/veiculo', data);
export const updateVeiculo = (id, data) => api.put(`/api/veiculo/${id}`, data);
export const deleteVeiculo = (id) => api.delete(`/api/veiculo/${id}`);

export const getStatusFabricacao = (veiculoId) =>
  api.get(`/api/veiculo/${veiculoId}/status`);
export const createStatusFabricacao = (veiculoId, data) =>
  api.post(`/api/veiculo/${veiculoId}/status`, data);

export default api;
