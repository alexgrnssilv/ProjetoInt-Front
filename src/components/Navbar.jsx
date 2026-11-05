import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    UsersRound,
    ClipboardCheck,
    LogOut,
    Menu,
    X,
    Shield
} from 'lucide-react';

/**
 * Navbar moderna com Menu Hamburguer para PC e Mobile.
 * Preserva o design original (dark blue, glassmorphism, teal #5dd6c8).
 */
const Navbar = () => {
    const [aberta, setAberta] = useState(false);
    const location = useLocation();

    // Fecha o menu ao mudar de rota
    useEffect(() => {
        setAberta(false);
    }, [location.pathname]);

    // Fecha o menu ao pressionar a tecla ESC
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') setAberta(false);
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('senai_token');
        localStorage.removeItem('senai_usuario');
        window.location.href = '/login';
    };

    return (
        <>
            <header className="admin-navbar-shell" aria-label="Navegação administrativa">
                <div className="admin-navbar-inner">
                    {/* Botão Hamburguer + Brand */}
                    <div className="admin-navbar-left">
                        <button
                            type="button"
                            className="admin-hamburger-trigger"
                            onClick={() => setAberta(!aberta)}
                            aria-expanded={aberta}
                            aria-label={aberta ? 'Fechar menu de navegação' : 'Abrir menu de navegação'}
                            title="Menu de navegação"
                        >
                            {aberta ? <X size={20} /> : <Menu size={20} />}
                            <span className="admin-hamburger-label">Menu</span>
                        </button>

                        <div className="admin-brand-wrapper">
                            <span className="admin-brand-mark">G</span>
                            <div className="admin-brand-text">
                                <strong>SoftSkills 360</strong>
                                <small>Painel de Liderança</small>
                            </div>
                        </div>
                    </div>

                    {/* Lado Direito: Status e Ações */}
                    <div className="admin-navbar-right">
                        <div className="admin-status-badge">
                            <span className="admin-status-dot" />
                            <span className="hidden sm:inline">Ciclo em andamento</span>
                        </div>

                        <button
                            type="button"
                            onClick={handleLogout}
                            className="admin-logout-trigger"
                            title="Sair do sistema"
                        >
                            <LogOut size={15} />
                            <span className="hidden sm:inline">Sair</span>
                        </button>
                    </div>
                </div>
            </header>

            {/* Backdrop escurecido ao abrir o menu */}
            {aberta && (
                <div
                    className="admin-drawer-backdrop"
                    onClick={() => setAberta(false)}
                    aria-hidden="true"
                />
            )}

            {/* Gaveta lateral (Drawer) do Menu Hamburguer */}
            <aside
                className={`admin-drawer-panel${aberta ? ' is-open' : ''}`}
                aria-label="Menu principal"
                aria-hidden={!aberta}
            >
                <div className="admin-drawer-header">
                    <div className="admin-drawer-brand">
                        <span className="admin-brand-mark">G</span>
                        <div>
                            <strong>SoftSkills 360</strong>
                            <span className="admin-drawer-tag">Administrador</span>
                        </div>
                    </div>
                    <button
                        type="button"
                        className="admin-drawer-close"
                        onClick={() => setAberta(false)}
                        aria-label="Fechar menu"
                    >
                        <X size={18} />
                    </button>
                </div>

                <div className="admin-drawer-body">
                    <span className="admin-drawer-section-title">Navegação Principal</span>
                    <nav className="admin-drawer-nav">
                        <NavLink
                            to="/admin"
                            end
                            className={({ isActive }) => `admin-drawer-link${isActive ? ' active' : ''}`}
                            onClick={() => setAberta(false)}
                        >
                            <LayoutDashboard size={18} />
                            <div className="admin-drawer-link-text">
                                <span>Dashboard</span>
                                <small>Ranking geral e métricas</small>
                            </div>
                        </NavLink>

                        <NavLink
                            to="/admin/gestao"
                            className={({ isActive }) => `admin-drawer-link${isActive ? ' active' : ''}`}
                            onClick={() => setAberta(false)}
                        >
                            <UsersRound size={18} />
                            <div className="admin-drawer-link-text">
                                <span>Gestão de Pessoas</span>
                                <small>Colaboradores e ciclos</small>
                            </div>
                        </NavLink>

                        <NavLink
                            to="/admin/avaliar"
                            className={({ isActive }) => `admin-drawer-link${isActive ? ' active' : ''}`}
                            onClick={() => setAberta(false)}
                        >
                            <ClipboardCheck size={18} />
                            <div className="admin-drawer-link-text">
                                <span>Avaliações</span>
                                <small>Lançar notas de liderança</small>
                            </div>
                        </NavLink>
                    </nav>

                    <div className="admin-drawer-info-card">
                        <Shield size={16} className="text-teal-400" />
                        <div>
                            <strong>Ambiente Seguro</strong>
                            <p>Ciclo ativo em execução. Dados confidenciais corporativos.</p>
                        </div>
                    </div>
                </div>

                <div className="admin-drawer-footer">
                    <button
                        type="button"
                        className="admin-drawer-logout-btn"
                        onClick={handleLogout}
                    >
                        <LogOut size={16} />
                        <span>Encerrar Sessão</span>
                    </button>
                </div>
            </aside>
        </>
    );
};

export default Navbar;
