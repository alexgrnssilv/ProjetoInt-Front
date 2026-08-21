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
        <div className="login-page">
            <section className="login-visual" aria-label="Gestão de desempenho">
                <div className="login-visual-image" />
                <div className="login-visual-content">
                    <div className="login-brand-mark">
                        <img src="/logo_gestao.png" alt="Gestão091 Logo" />
                    </div>
                    <div className="login-visual-copy">
                        <span className="login-kicker"><Shield size={15} /> Gestão de pessoas</span>
                        <h1>Desempenho que vira evolução.</h1>
                        <p>Decisões mais claras, feedbacks mais humanos e equipes preparadas para o próximo ciclo.</p>
                    </div>
                    <div className="login-visual-footer">Gestão091 <span /> Performance & desenvolvimento</div>
                </div>
            </section>

            <section className="login-panel">
                <div className="glass-card login-card animar-entrada">

                {/* Logo / Cabeçalho */}
                <div className="login-heading">
                    <span className="login-eyebrow">Área restrita</span>
                    <h2>Acesse sua conta</h2>
                    <p>Entre para acompanhar os ciclos e feedbacks da sua equipe.</p>
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
            </section>
        </div>
    )
}
