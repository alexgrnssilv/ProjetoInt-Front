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

    if (loading) return <div className="dashboard-loading">Carregando dados...</div>;

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
        <main className="page-shell dashboard-page">
            <div className="page-header dashboard-header">
                <div>
                    <span className="page-kicker">Visão executiva</span>
                    <h1>Performance Ranking</h1>
                    <p>Análise em tempo real baseada em feedback 360°</p>
                </div>

                <div className="page-actions">
                    <Link to="/admin/gestao" className="dashboard-action dashboard-action-secondary">
                        <Settings size={18} /> <span>Gestão</span>
                    </Link>
                    <div className="dashboard-filter">
                        <Filter size={16} />
                        <select
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
                        className="dashboard-action dashboard-action-danger"
                        title="Sair"
                    >
                        <LogOut size={18} />
                    </button>
                </div>
            </div>

            <div className="metric-grid">
                {metricas.map((m) => (
                    <div key={m.id} className="dashboard-metric glass-card">
                        <div className="dashboard-metric-top">
                            <span>{m.rotulo}</span>
                            <div>{m.icone}</div>
                        </div>
                        <div className="dashboard-metric-value">{m.valor}</div>
                    </div>
                ))}
            </div>

            <div className="dashboard-content">
                <section className="content-panel ranking-panel glass-card" id="ranking-table">
                    <div className="dashboard-panel-header">
                        <div>
                            <span className="dashboard-panel-kicker">Resultados do ciclo</span>
                            <h2>Ranking geral</h2>
                        </div>
                        <div className="dashboard-export-actions">
                            <button
                                onClick={handleDownloadCSV}
                                className="dashboard-export dashboard-export-csv"
                            >
                                <Download size={14} /> CSV
                            </button>
                            <button
                                onClick={exportRanking}
                                className="dashboard-export dashboard-export-pdf"
                            >
                                <Download size={14} /> PDF
                            </button>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr>
                                    <th className="px-6 py-4">Nome</th>
                                    <th className="px-6 py-4">Média Calc.</th>
                                    <th className="px-6 py-4 text-right">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data?.colaboradores?.map((c, idx) => (
                                    <tr key={c.id} className="hover:bg-white/[0.02] transition-colors">
                                        <td>
                                            <div className="dashboard-person">
                                                <span className="dashboard-position">#{idx + 1}</span>
                                                <span>{c.nome}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="dashboard-score">
                                                <span>{c.mediaGeral}</span>
                                                <small>pts</small>
                                            </div>
                                        </td>
                                        <td className="dashboard-status-cell">
                                            <span
                                                className="dashboard-status"
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
                </section>

                <aside className="side-column">
                    <div className="content-panel radar-panel glass-card">
                        <div className="radar-panel-heading">
                            <span>Leitura de competências</span>
                            <h2>Perfil do top performer</h2>
                        </div>
                        {data?.colaboradores && data.colaboradores[0] && data.colaboradores[0].radarData?.length > 0 ? (
                            <RadarPerformance
                                nomeColaborador={data.colaboradores[0].nome}
                                dados={data.colaboradores[0].radarData}
                            />
                        ) : (
                            <div className="radar-empty">Nenhuma avaliação registrada ainda</div>
                        )}
                    </div>
                </aside>
            </div>
        </main>
    );
};

export default AdminDashboard;
