// =====================================================
// Login.jsx — Página de Autenticação Gestão091
// =====================================================

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { LogIn, Shield, Eye, EyeOff } from 'lucide-react'

export default function Login() {
    const [email, setEmail] = useState('')
    const [senha, setSenha] = useState('')
    const [mostrarSenha, setMostrarSenha] = useState(false)
    const [carregando, setCarregando] = useState(false)
    const [erro, setErro] = useState('')

    const { login } = useAuth()
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()
        setErro('')
        setCarregando(true)

        const resultado = await login(email, senha)

        if (resultado.sucesso) {
            const usuario = JSON.parse(localStorage.getItem('senai_usuario'))
            navigate(usuario.papel === 'ADMIN' ? '/admin' : '/feedback')
        } else {
            setErro(resultado.mensagem)
        }

        setCarregando(false)
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-slate-900 to-black">
            {/* Card de login centralizado */}
            <div className="glass-card animar-entrada w-full max-w-[420px] p-10">

                {/* Logo / Cabeçalho */}
                <div className="text-center mb-10">
                    <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center mx-auto mb-4 shadow-[0_0_30px_rgba(59,130,246,0.4)] overflow-hidden">
                        <img src="/logo_gestao.png" alt="Gestão091 Logo" className="w-full h-full object-cover" />
                    </div>
                    <h1 className="text-3xl font-black tracking-tight text-white">Gestão091</h1>
                    <p className="text-slate-500 font-medium text-sm mt-1">
                        Sistema de Gestão de Desempenho
                    </p>
                </div>

                {/* Formulário de login */}
                <form onSubmit={handleSubmit} className="flex flex-col gap-6">

                    <div className="input-grupo">
                        <label htmlFor="email">E-mail institucional</label>
                        <input
                            id="email"
                            type="email"
                            className="input"
                            placeholder="seu.nome@senai.br"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="input-grupo">
                        <label htmlFor="senha">Senha</label>
                        <div className="relative">
                            <input
                                id="senha"
                                type={mostrarSenha ? 'text' : 'password'}
                                className="input w-full pr-12"
                                placeholder="••••••••"
                                value={senha}
                                onChange={(e) => setSenha(e.target.value)}
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setMostrarSenha(!mostrarSenha)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                            >
                                {mostrarSenha ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    {/* Mensagem de erro */}
                    {erro && (
                        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-red-400 text-sm text-center">
                            {erro}
                        </div>
                    )}

                    <button
                        type="submit"
                        className="btn btn-primario mt-2"
                        disabled={carregando}
                    >
                        {carregando ? (
                            <><div className="spinner w-5 h-5" /> Entrando...</>
                        ) : (
                            <><LogIn size={20} /> Entrar no Sistema</>
                        )}
                    </button>
                </form>

                {/* Dica de credenciais */}
                <div className="mt-8 p-4 bg-blue-500/5 border border-blue-500/10 rounded-xl text-[11px] text-slate-500 leading-relaxed">
                    <strong className="text-blue-400 block mb-1 uppercase tracking-wider">Modo de teste:</strong>
                    Admin: <code className="text-slate-300">admin@senai.br</code> / <code className="text-slate-300">senha123</code><br />
                    Colaborador: <code className="text-slate-300">joao.silva@senai.br</code> / <code className="text-slate-300">senha123</code>
                </div>
            </div>
        </div>
    )
}
