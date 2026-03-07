// =====================================================
// api.js — Instância configurada do Axios
// Centraliza a URL base e interceptores
// =====================================================

import axios from 'axios'

// Cria a instância com a URL base da API (variável de ambiente em produção ou localhost local)
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
    timeout: 10000,
    headers: { 'Content-Type': 'application/json' },
})

// Interceptor de autenticação — injeta o token JWT em todas as requisições
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('senai_token')
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})

export default api
