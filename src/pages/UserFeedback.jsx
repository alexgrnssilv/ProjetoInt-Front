import React, { useState, useEffect } from 'react';
import api from '../api/api';
import {
    FileText,
    Download,
    MessageSquare,
    UserCircle,
    Award,
    LogOut
} from 'lucide-react';
import RadarPerformance from '../components/RadarPerformance';
import { useAuth } from '../context/AuthContext';
import { generatePDF } from '../utils/pdfGenerator';
import { useNavigate } from 'react-router-dom';

const UserFeedback = () => {
    const { usuario } = useAuth();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [erro, setErro] = useState(null);
    const [pendentes, setPendentes] = useState([]);
    const [autoPendente, setAutoPendente] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchFeedback = async () => {
            try {
                const [res, resPendentes] = await Promise.all([
                    api.get(`/dashboard/colaborador/${usuario.id}`),
                    api.get('/avaliacoes/pendentes')
                ]);

                setData(res.data);
                setPendentes(resPendentes.data.colegasPendentes || []);
                setAutoPendente(resPendentes.data.autoAvaliacaoPendente || false);
            } catch (e) {
                console.error(e);
                setErro('Não foi possível carregar seu perfil. Verifique sua conexão.');
            } finally {
                setLoading(false);
            }
        };
        if (usuario) fetchFeedback();
    }, [usuario]);

    if (loading) return (
        <div className="min-h-screen pt-20 flex flex-col items-center justify-center gap-4">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-slate-500 font-bold animate-pulse">Carregando Perfil de Performance...</p>
        </div>
    );

    if (erro) return (
        <div className="min-h-screen pt-20 flex flex-col items-center justify-center gap-6 p-10 text-center">
            <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center text-red-500">
                <FileText size={40} />
            </div>
            <h2 className="text-2xl font-black">{erro}</h2>
            <button onClick={() => window.location.reload()} className="px-8 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold transition-all border border-white/10">
                Tentar Novamente
            </button>
        </div>
    );

    const handleDownload = () => {
        generatePDF('report-content', `performance-${data.colaborador.nome}.pdf`);
    };

    const handleLogout = () => {
        localStorage.removeItem('senai_token');
        localStorage.removeItem('senai_usuario');
        window.location.href = '/login';
    };

    if (!data || !data.colaborador) return (
        <div className="min-h-screen pt-20 flex flex-col items-center justify-center gap-6 p-10 text-center">
            <div className="w-20 h-20 bg-amber-500/10 rounded-full flex items-center justify-center text-amber-500">
                <UserCircle size={40} />
            </div>
            <h2 className="text-2xl font-black">Dados não encontrados</h2>
            <p className="text-slate-500 max-w-md mx-auto">Parece que ainda não há dados de performance registrados para o seu perfil.</p>
            <button onClick={() => navigate('/avaliar')} className="px-8 py-3 bg-blue-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-900/40">
                Começar sua Primeira Avaliação
            </button>
        </div>
    );

    const radarItems = data.radarData || [];

    return (
        <div style={{ maxWidth: '900px', margin: '0 auto', padding: '100px 24px 60px 24px', minHeight: '100vh' }} id="report-content">
            <header className="flex flex-col md:flex-row items-center justify-between mb-10 gap-6">
                <div className="flex items-center gap-5">
                    <div className="w-16 h-16 bg-blue-600/20 rounded-2xl flex items-center justify-center text-blue-500 shrink-0">
                        <UserCircle size={40} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black">{data.colaborador.nome || 'Usuário'}</h1>
                        <p className="text-slate-500 font-bold uppercase text-xs tracking-widest mt-1">{data.colaborador.cargo || 'Colaborador'} • {data.colaborador.equipe?.nome || 'Equipe'}</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <button
                        onClick={handleDownload}
                        className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold transition-all border border-white/10 flex items-center gap-2 text-sm"
                    >
                        <Download size={16} /> PDF
                    </button>
                    <button
                        onClick={handleLogout}
                        className="px-6 py-3 bg-red-500/20 hover:bg-red-500/30 text-red-500 rounded-xl font-bold transition-all border border-red-500/20 flex items-center gap-2 text-sm"
                    >
                        <LogOut size={16} /> Sair
                    </button>
                </div>
            </header>

            {autoPendente && (
                <div className="my-5 p-6 bg-blue-500/10 border border-blue-500/20 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 animate-in fade-in slide-in-from-top-4 duration-500">
                    <div className="flex items-center gap-4 text-center sm:text-left">
                        <span className="text-4xl">⭐</span>
                        <div>
                            <h3 className="text-blue-400 font-bold text-lg">Sua autoavaliação está pendente!</h3>
                            <p className="text-blue-400/80 text-sm font-medium">Sua percepção sobre si mesmo é fundamental no processo 360°.</p>
                        </div>
                    </div>
                    <button
                        onClick={() => navigate('/avaliar?tipo=auto')}
                        className="w-full sm:w-auto px-8 py-3 bg-blue-500 text-white font-bold rounded-xl hover:bg-blue-600 transition-colors shadow-lg shadow-blue-900/40"
                    >
                        Iniciar Autoavaliação
                    </button>
                </div>
            )}

            {pendentes.length > 0 && (
                <div className="my-5 p-6 bg-orange-500/10 border border-orange-500/20 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 animate-in fade-in slide-in-from-top-4 duration-500">
                    <div className="flex items-center gap-4 text-center sm:text-left">
                        <span className="text-4xl">🎯</span>
                        <div>
                            <h3 className="text-orange-400 font-bold text-lg">Você tem {pendentes.length} avaliações pendentes!</h3>
                            <p className="text-orange-400/80 text-sm font-medium">Avalie seus colegas para liberar análises completas da equipe.</p>
                        </div>
                    </div>
                    <button onClick={() => navigate('/avaliar')} className="w-full sm:w-auto px-8 py-3 bg-orange-500 text-white font-bold rounded-xl hover:bg-orange-600 transition-colors shadow-lg shadow-orange-900/40">
                        Avaliar Pares
                    </button>
                </div>
            )}

            {/* ===== SEÇÃO RADAR ===== */}
            <div className="glass-card p-8 sm:p-10 mb-10">
                <div className="flex items-center gap-3 mb-8">
                    <Award className="text-blue-500" />
                    <h2 className="font-bold uppercase tracking-widest text-sm text-slate-400">Radar de Soft Skills</h2>
                </div>
                <RadarPerformance
                    nomeColaborador="Seu Perfil"
                    dados={radarItems.map(r => ({ competencia: r.competencia, nota: r.nota }))}
                />
                <div className="mt-8 grid grid-cols-2 gap-6">
                    <div className="p-5 bg-white/5 rounded-xl border border-white/5">
                        <p className="text-[10px] font-bold text-slate-500 uppercase mb-2">Média Geral (360°)</p>
                        <p className="text-2xl font-black">
                            {radarItems.length > 0
                                ? (radarItems.reduce((acc, curr) => acc + (curr.nota || 0), 0) / radarItems.length).toFixed(1)
                                : '0.0'}
                        </p>
                    </div>
                    <div className="p-5 bg-white/5 rounded-xl border border-white/5">
                        <p className="text-[10px] font-bold text-slate-500 uppercase mb-2">Autoavaliação</p>
                        <p className="text-2xl font-black text-blue-500">
                            {radarItems.filter(r => r.auto !== null).length > 0
                                ? (radarItems.reduce((acc, curr) => acc + (curr.auto || 0), 0) / radarItems.filter(r => r.auto !== null).length).toFixed(1)
                                : '0.0'}
                        </p>
                    </div>
                </div>
            </div>

            {/* ===== SEÇÃO NOTIFICAÇÕES ===== */}
            <div className="glass-card p-8 sm:p-10">
                <h2 className="font-bold flex items-center gap-3 mb-8 text-lg">
                    <MessageSquare className="text-blue-400" size={22} /> Histórico de Notificações e Planos de Ação
                </h2>

                {!data.colaborador.notificacoes || data.colaborador.notificacoes.length === 0 ? (
                    <div className="text-center p-8 bg-white/5 rounded-2xl border border-white/5">
                        <p className="text-slate-400 text-sm">Nenhum feedback da liderança registrado ainda.</p>
                    </div>
                ) : (() => {
                    const novas = data.colaborador.notificacoes.filter(n => !n.lida);
                    const lidas = data.colaborador.notificacoes.filter(n => n.lida);

                    const renderNotif = (notif, index, isLida) => {
                        let expColor = 'bg-slate-500/10 border-slate-500/30 text-slate-400';
                        let expText = 'N/A';
                        if (notif.expectativaSelecionada === 'critico') { expColor = 'bg-red-500/10 border-red-500/30 text-red-500'; expText = 'Crítico: Ação Imediata'; }
                        else if (notif.expectativaSelecionada === 'desenvolvimento') { expColor = 'bg-yellow-500/10 border-yellow-500/30 text-yellow-500'; expText = 'Atenção e Foco'; }
                        else if (notif.expectativaSelecionada === 'atingiu') { expColor = 'bg-green-500/10 border-green-500/30 text-green-500'; expText = 'Acelerar Potencial'; }
                        else if (notif.expectativaSelecionada === 'excedeu') { expColor = 'bg-blue-500/10 border-blue-500/30 text-blue-500'; expText = 'Exigência Técnica'; }

                        return (
                            <div key={`${isLida ? 'lida' : 'nova'}-${index}`} className={`${isLida ? 'opacity-50' : ''}`}>
                                <div className={`p-6 rounded-2xl border-l-4 ${isLida ? 'bg-white/[0.02] border-slate-600' : 'bg-white/5 border-blue-500'}`}>
                                    <div className="flex flex-wrap justify-between items-center gap-3 mb-5">
                                        <span className="text-xs font-black text-slate-500 uppercase tracking-widest">
                                            {isLida ? '✅ Feedback Lido' : '🔵 Novo Feedback da Liderança'}
                                        </span>
                                        <span className={`text-xs font-bold px-3 py-1.5 rounded-lg border ${expColor}`}>
                                            {expText}
                                        </span>
                                    </div>

                                    <div className="bg-black/20 p-5 rounded-xl mb-5">
                                        <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">
                                            {notif.planoMelhoria}
                                        </p>
                                    </div>

                                    <div className="flex flex-wrap items-center justify-between gap-4">
                                        {notif.data && (
                                            <span className="text-xs text-slate-500">Enviado em {new Date(notif.data).toLocaleDateString('pt-BR')}</span>
                                        )}
                                        {!isLida && (
                                            <button
                                                onClick={async () => {
                                                    try {
                                                        await api.post(`/dashboard/colaborador/${usuario.id}/notificacoes/ler`, { hash: notif.hashOriginal });
                                                        setData(prev => ({
                                                            ...prev,
                                                            colaborador: {
                                                                ...prev.colaborador,
                                                                notificacoes: prev.colaborador.notificacoes.map((n) =>
                                                                    n.hashOriginal === notif.hashOriginal ? { ...n, lida: true } : n
                                                                )
                                                            }
                                                        }));
                                                    } catch (err) {
                                                        console.error('Erro ao marcar como lida:', err);
                                                    }
                                                }}
                                                className="px-5 py-2.5 bg-green-500/10 hover:bg-green-500/20 text-green-400 border border-green-500/20 rounded-xl text-xs font-bold transition-all flex items-center gap-2"
                                            >
                                                ✅ Marcar como Lida
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {notif.reuniaoAgendada && !isLida && (
                                    <div className="p-5 mt-4 bg-indigo-500/10 rounded-xl border border-indigo-500/30 flex items-center gap-4">
                                        <span className="text-2xl shrink-0">🔔</span>
                                        <div>
                                            <div className="text-sm font-bold text-indigo-300">Reunião 1:1 Solicitada</div>
                                            <div className="text-xs text-indigo-400/80 mt-1">A liderança sugeriu uma reunião de alinhamento com você para discutir este plano de ação.</div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    };

                    return (
                        <div className="space-y-6">
                            {novas.length > 0 && novas.map((notif, i) => renderNotif(notif, i, false))}

                            {novas.length === 0 && (
                                <div className="text-center p-5 bg-green-500/5 rounded-xl border border-green-500/10">
                                    <p className="text-green-400 text-sm font-medium">🎉 Todas as notificações foram lidas!</p>
                                </div>
                            )}

                            {lidas.length > 0 && (
                                <details className="group">
                                    <summary className="cursor-pointer text-xs font-bold text-slate-500 uppercase tracking-widest hover:text-slate-300 transition-colors py-4 border-t border-white/5 mt-6 list-none flex items-center gap-2">
                                        <span className="group-open:rotate-90 transition-transform">▶</span>
                                        Histórico de feedbacks lidos ({lidas.length})
                                    </summary>
                                    <div className="space-y-5 mt-4">
                                        {lidas.map((notif, i) => renderNotif(notif, i, true))}
                                    </div>
                                </details>
                            )}
                        </div>
                    );
                })()}
            </div>
        </div>
    );
};

export default UserFeedback;
