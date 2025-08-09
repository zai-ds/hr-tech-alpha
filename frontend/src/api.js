// src/api.js
import axios from 'axios';

// Criamos uma instância do axios que será usada em todo o app
const apiClient = axios.create({
  // A URL base da nossa API Django que está rodando localmente
  baseURL: 'http://127.0.0.1:8000/api/goals/',
});

// Esta função é um "interceptor". Ela vai "interceptar" cada requisição
// antes de ela ser enviada, para adicionar o token de autenticação.
export const setupInterceptors = (getAccessTokenSilently) => {
  apiClient.interceptors.request.use(
    async (config) => {
      try {
        // Pedimos ao Auth0 o token de acesso atual
        const token = await getAccessTokenSilently();
        // Adicionamos o token ao cabeçalho de autorização
        config.headers.Authorization = `Bearer ${token}`;
      } catch (error) {
        console.error("Could not get access token", error);
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );
};

export default apiClient;