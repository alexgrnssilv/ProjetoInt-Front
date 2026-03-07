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
        <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '80px 48px 32px 48px', minHeight: '100vh' }} id="report-content">
            <header className="flex flex-col md:flex-row items-center justify-between mb-12 gap-6">
                <div className="flex items-center gap-5">
                    <div className="w-16 h-16 bg-blue-600/20 rounded-2xl flex items-center justify-center text-blue-500">
                        <UserCircle size={40} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black">{data.colaborador.nome || 'Usuário'}</h1>
                        <p className="text-slate-500 font-bold uppercase text-xs tracking-widest">{data.colaborador.cargo || 'Colaborador'} • {data.colaborador.equipe?.nome || 'Equipe'}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
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
                <div className="mb-6 p-6 bg-blue-500/10 border border-blue-500/20 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 animate-in fade-in slide-in-from-top-4 duration-500">
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
                <div className="mb-8 p-6 bg-orange-500/10 border border-orange-500/20 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 animate-in fade-in slide-in-from-top-4 duration-500">
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

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                <div className="glass-card p-10">
                    <div className="flex items-center gap-3 mb-8">
                        <Award className="text-blue-500" />
                        <h2 className="font-bold uppercase tracking-widest text-sm text-slate-400">Radar de Soft Skills</h2>
                    </div>
                    <RadarPerformance
                        nomeColaborador="Seu Perfil"
                        dados={radarItems.map(r => ({ competencia: r.competencia, nota: r.nota }))}
                    />
                    <div className="mt-8 grid grid-cols-2 gap-4">
                        <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                            <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">Média Geral (360°)</p>
                            <p className="text-2xl font-black">
                                {radarItems.length > 0
                                    ? (radarItems.reduce((acc, curr) => acc + (curr.nota || 0), 0) / radarItems.length).toFixed(1)
                                    : '0.0'}
                            </p>
                        </div>
                        <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                            <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">Autoavaliação</p>
                            <p className="text-2xl font-black text-blue-500">
                                {radarItems.filter(r => r.auto !== null).length > 0
                                    ? (radarItems.reduce((acc, curr) => acc + (curr.auto || 0), 0) / radarItems.filter(r => r.auto !== null).length).toFixed(1)
                                    : '0.0'}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="glass-card p-8">
                        <h2 className="font-bold flex items-center gap-3 mb-6">
                            <MessageSquare className="text-blue-400" /> Insights de Feedback
                        </h2>
                        <div className="space-y-4">
                            <div className="p-6 bg-white/5 rounded-2xl border-l-4 border-blue-500">
                                <p className="text-slate-300 italic text-sm leading-relaxed">
                                    "Excelente proatividade e comunicação. Como ponto de melhoria, foque na gestão de tempo em tarefas complexas."
                                </p>
                                <p className="mt-3 text-[10px] font-black text-slate-600 uppercase">Consolidado 360°</p>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 bg-blue-600/10 rounded-2xl border border-blue-500/20">
                        <p className="text-sm font-medium text-blue-400">
                            📢 Sua comparação mostra que sua percepção interna está alinhada com a equipe em 85% das competências.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserFeedback;
