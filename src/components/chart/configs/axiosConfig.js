// Dans src/components/chart/configs/axiosConfig.js
import axios from 'axios';

const instance = axios.create({
  baseURL: 'http://127.0.0.1:8000',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true,
});

// Intercepteur pour ajouter le token d'authentification (pour Passport)
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      // Format standard pour les tokens OAuth (comme Passport)
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur de réponse pour gérer les erreurs d'authentification
instance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Pour Passport, les erreurs 401 signifient généralement un token invalide/expiré
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      // Si ce n'est pas une route d'authentification, rediriger vers login
      if (!error.config.url.includes('/api/auth/')) {
        window.location.href = '/sign-in';
      }
    }
    return Promise.reject(error);
  }
);

export default instance;