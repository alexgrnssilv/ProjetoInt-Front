// =====================================================
// AuthContext.jsx — Contexto de Autenticação Global
// Gerencia login, logout e estado do usuário autenticado
// =====================================================

import { createContext, useContext, useState, useEffect } from 'react'
import api from '../api/api'

// Cria o contexto — será consumido em qualquer componente via useAuth()
const AuthContext = createContext(null)

/**
 * AuthProvider: Envolve toda a aplicação no App.jsx
 * Mantém o estado global de autenticação
 */
export function AuthProvider({ children }) {
    const [usuario, setUsuario] = useState(null)
    const [carregando, setCarregando] = useState(true) // true até checar localStorage

    // Ao iniciar a aplicação, verifica se há sessão salva
    useEffect(() => {
        const tokenSalvo = localStorage.getItem('senai_token')
        const usuarioSalvo = localStorage.getItem('senai_usuario')

        if (tokenSalvo && usuarioSalvo) {
            // Restaura o usuário e injeta o token no cabeçalho padrão do axios
            api.defaults.headers.common['Authorization'] = `Bearer ${tokenSalvo}`
            setUsuario(JSON.parse(usuarioSalvo))
        }
        setCarregando(false)
    }, [])

    /**
     * Realiza o login: chama a API, salva token e usuário no localStorage
     * @param {string} email
     * @param {string} senha
     * @returns {{ sucesso: boolean, mensagem: string }}
     */
    const login = async (email, senha) => {
        try {
            const resposta = await api.post('/api/auth/login', { email, senha })

            const { token, usuario: dadosUsuario } = resposta.data

            // Persiste no localStorage para sobreviver a recargas de página
            localStorage.setItem('senai_token', token)
            localStorage.setItem('senai_usuario', JSON.stringify(dadosUsuario))

            // Injeta o token em todas as futuras requisições axios
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`

            setUsuario(dadosUsuario)
            return { sucesso: true }
        } catch (erro) {
            const mensagem = erro.response?.data?.mensagem || 'Erro ao conectar com o servidor.'
            return { sucesso: false, mensagem }
        }
    }

    /**
     * Realiza o logout: limpa localStorage e reseta o estado
     */
    const logout = () => {
        localStorage.removeItem('senai_token')
        localStorage.removeItem('senai_usuario')
        delete api.defaults.headers.common['Authorization']
        setUsuario(null)
    }

    // isAdmin: atalho para verificar se o usuário logado é administrador
    const isAdmin = usuario?.papel === 'ADMIN'

    return (
        <AuthContext.Provider value={{ usuario, login, logout, isAdmin, carregando }}>
            {children}
        </AuthContext.Provider>
    )
}

/**
 * Hook personalizado para consumir o contexto de autenticação
 * Uso: const { usuario, login, logout, isAdmin } = useAuth()
 */
export function useAuth() {
    const contexto = useContext(AuthContext)
    if (!contexto) {
        throw new Error('useAuth deve ser usado dentro de um AuthProvider')
    }
    return contexto
}
