// =====================================================
// api.js — Instância configurada do Axios
// Centraliza a URL base e interceptores
// =====================================================

import axios from 'axios'

// Garante que a URL base sempre termine com /api para evitar erros de 404 no deploy
let urlBase = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'
if (!urlBase.endsWith('/api')) {
    urlBase = urlBase.replace(/\/$/, '') + '/api'
}

const api = axios.create({
    baseURL: urlBase,
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
