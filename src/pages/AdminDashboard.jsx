import React, { useState, useEffect } from 'react';
import api from '../api/api';
import {
    Users,
    TrendingUp,
    CheckCircle,
    Filter,
    ArrowUpRight,
    ArrowDownRight,
    Settings,
    Download,
    LogOut
} from 'lucide-react';
import RadarPerformance from '../components/RadarPerformance';
import { Link, useNavigate } from 'react-router-dom';
import { generatePDF } from '../utils/pdfGenerator';

const AdminDashboard = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [equipe, setEquipe] = useState('Todos');
    const navigate = useNavigate();

    const fetchStats = async () => {
        try {
            const res = await api.get('/dashboard/stats', {
                params: { equipeId: equipe !== 'Todos' ? equipe : undefined }
            });
            setData(res.data.dados);
            setLoading(false);
        } catch (e) { console.error(e); }
    };

    useEffect(() => { fetchStats(); }, [equipe]);

    if (loading) return <div className="p-20 text-center text-slate-500 font-bold animate-pulse">Carregando Dados Mestre...</div>;

    const exportRanking = () => {
        generatePDF('ranking-table', 'ranking-performance-senai.pdf');
    };

    const handleDownloadCSV = () => {
        if (!data || !data.colaboradores) return;
        const csvContent = "Posicao,Nome,MediaGeral,NivelGeral\n"
            + data.colaboradores.map((c, i) => `${i + 1},"${c.nome}",${c.mediaGeral},"${c.nivelGeral}"`).join("\n");
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", "ranking_senai.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const handleLogout = () => {
        localStorage.removeItem('senai_token');
        localStorage.removeItem('senai_usuario');
        window.location.href = '/login';
    };

    const metricas = [
        { id: 1, rotulo: "Total Colaboradores", valor: data.resumo.totalColaboradores, icone: <Users className="text-blue-500" /> },
        { id: 2, rotulo: "Média Global", valor: data.resumo.mediaGlobal, icone: <TrendingUp className="text-green-500" /> },
        { id: 3, rotulo: "Ciclo Ativo", valor: data.resumo.cicloAtivo || "Sem Ciclo Ativo", icone: <CheckCircle className="text-purple-500" /> },
    ];

    return (
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '80px 48px 32px 48px', minHeight: '100vh' }}>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
                <div>
                    <h1 className="text-4xl font-black text-white mb-2 tracking-tight">Performance Ranking</h1>
                    <p className="text-slate-500 font-medium">Análise em tempo real baseada em feedback 360°</p>
                </div>

                <div className="flex flex-wrap gap-4 items-center">
                    <Link to="/admin/gestao" className="glass p-3 rounded-xl hover:bg-white/10 transition-all text-slate-400 flex items-center gap-2">
                        <Settings size={18} /> <span className="text-sm font-bold">Gestão</span>
                    </Link>
                    <div className="glass p-2 rounded-xl flex items-center gap-2 border border-white/5">
                        <Filter size={16} className="text-slate-500 ml-2" />
                        <select
                            className="bg-transparent border-none text-sm font-bold text-slate-300 focus:ring-0 outline-none"
                            value={equipe}
                            onChange={(e) => setEquipe(e.target.value)}
                        >
                            <option value="Todos">Todas Unidades</option>
                            <option value="1">Desenvolvimento</option>
                            <option value="2">Design</option>
                        </select>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="p-3 bg-red-500/20 hover:bg-red-500/30 text-red-500 rounded-xl font-bold transition-all flex items-center border border-red-500/20"
                        title="Sair"
                    >
                        <LogOut size={18} />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                {metricas.map((m) => (
                    <div key={m.id} className="glass-card p-6 group hover:scale-[1.02] transition-all">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">{m.rotulo}</span>
                            <div className="p-2 bg-white/5 rounded-lg">{m.icone}</div>
                        </div>
                        <div className="text-4xl font-black text-white">{m.valor}</div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 glass-card overflow-hidden" id="ranking-table">
                    <div className="p-6 border-b border-white/5 flex justify-between items-center bg-slate-900/40">
                        <h3 className="font-black text-sm uppercase tracking-widest text-slate-400">Ranking Geral</h3>
                        <div className="flex gap-3">
                            <button
                                onClick={handleDownloadCSV}
                                className="text-[10px] sm:text-xs font-black uppercase text-green-500 hover:text-green-400 flex items-center gap-1 transition-colors bg-green-500/10 px-3 py-1.5 rounded-lg border border-green-500/20"
                            >
                                <Download size={14} /> CSV
                            </button>
                            <button
                                onClick={exportRanking}
                                className="text-[10px] sm:text-xs font-black uppercase text-blue-500 hover:text-blue-400 flex items-center gap-1 transition-colors bg-blue-500/10 px-3 py-1.5 rounded-lg border border-blue-500/20"
                            >
                                <Download size={14} /> PDF
                            </button>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-white/5 text-slate-500 text-[10px] uppercase font-black">
                                <tr>
                                    <th className="px-6 py-4">Nome</th>
                                    <th className="px-6 py-4">Média Calc.</th>
                                    <th className="px-6 py-4 text-right">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {data?.colaboradores?.map((c, idx) => (
                                    <tr key={c.id} className="hover:bg-white/[0.02] transition-colors">
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-3">
                                                <span className="text-xs font-black text-slate-700 w-4">#{idx + 1}</span>
                                                <span className="font-bold text-slate-200">{c.nome}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-baseline gap-1">
                                                <span className="text-xl font-black text-white">{c.mediaGeral}</span>
                                                <span className="text-[10px] text-slate-600">pts</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            <span
                                                className="px-3 py-1 rounded-lg text-[10px] font-black border"
                                                style={{ borderColor: `${c.corGeral}40`, color: c.corGeral, backgroundColor: `${c.corGeral}10` }}
                                            >
                                                {c.nivelGeral}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="glass-card p-6">
                        <h3 className="font-black text-xs uppercase tracking-widest text-slate-500 mb-6">Preview Top #1</h3>
                        {data?.colaboradores && data.colaboradores[0] && data.colaboradores[0].radarData?.length > 0 ? (
                            <RadarPerformance
                                nomeColaborador={data.colaboradores[0].nome}
                                dados={data.colaboradores[0].radarData}
                            />
                        ) : (
                            <div className="flex items-center justify-center p-10 text-slate-500 text-sm font-medium">Nenhuma avaliação registrada ainda</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
