// =====================================================
// api.js — Instância configurada do Axios
// Centraliza a URL base e interceptores
// =====================================================

import axios from 'axios'

// Usa o backend local durante o desenvolvimento e o serviço publicado em produção.
const apiPadrao = import.meta.env.DEV
    ? 'http://localhost:3001/api'
    : 'https://projetoint-back.onrender.com/api'
let urlBase = import.meta.env.VITE_API_URL || apiPadrao
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
