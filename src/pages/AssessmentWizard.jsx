import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../api/api';
import { ClipboardList, CheckCircle2, ChevronRight, ChevronLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const AssessmentWizard = () => {
    const { usuario } = useAuth();
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const isAuto = searchParams.get('tipo') === 'auto';

    const [step, setStep] = useState(1);
    const [competencias, setCompetencias] = useState([]);
    const [avaliacoes, setAvaliacoes] = useState({});
    const [avaliadoId, setAvaliadoId] = useState(null);
    const [pendentes, setPendentes] = useState([]);
    const [cicloId, setCicloId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [anonimo, setAnonimo] = useState(!isAuto);

    const [autoAvaliacaoPendente, setAutoAvaliacaoPendente] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [pendRes, compRes, cicloRes] = await Promise.all([
                    api.get('/avaliacoes/pendentes'),
                    api.get('/avaliacoes/competencias'),
                    api.get('/avaliacoes/ciclo-ativo')
                ]);

                setPendentes(pendRes.data.colegasPendentes || []);
                setAutoAvaliacaoPendente(pendRes.data.autoAvaliacaoPendente);
                setCompetencias(compRes.data || []);
                setCicloId(cicloRes.data?.id || pendRes.data.cicloId);

                if (isAuto && usuario) {
                    setAvaliadoId(usuario.id.toString());
                } else if (!isAuto && pendRes.data.colegasPendentes?.length > 0) {
                    setAvaliadoId(pendRes.data.colegasPendentes[0].id.toString());
                }
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [isAuto, usuario]);

    const handleScore = (compId, score) => {
        setAvaliacoes({ ...avaliacoes, [compId]: score });
    };

    const handleSubmit = async () => {
        try {
            const payload = {
                avaliadoId: parseInt(avaliadoId),
                cicloId,
                tipo: isAuto ? 'AUTO' : 'PAR',
                anonimo: isAuto ? false : anonimo,
                avaliacoes: Object.keys(avaliacoes).map(id => ({
                    competenciaId: parseInt(id),
                    pontuacao: avaliacoes[id]
                }))
            };
            await api.post('/avaliacoes', payload);
            setStep(3);
        } catch (e) {
            console.error(e);
            alert('Erro ao enviar avaliação: ' + (e.response?.data?.mensagem || 'Erro desconhecido'));
        }
    };

    return (
        <div className="w-full min-h-screen flex justify-center items-start p-4 sm:p-8">
            <div className="w-full max-w-3xl pt-10 sm:pt-20">
                {step === 1 && (
                    <div className="glass-card p-10 text-center relative overflow-hidden">
                        <div className={`absolute top-0 right-0 w-64 h-64 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2 ${isAuto ? 'bg-blue-500/10' : 'bg-orange-500/10'}`}></div>
                        <ClipboardList size={60} className={`mx-auto mb-6 relative z-10 ${isAuto ? 'text-blue-500' : 'text-orange-500'}`} />
                        <h1 className="text-3xl font-black mb-4 relative z-10">
                            {isAuto ? 'Autoavaliação de Desempenho' : 'Avaliação 360° (Pares)'}
                        </h1>
                        <p className="text-slate-400 mb-8 max-w-md mx-auto relative z-10 font-medium">
                            {isAuto
                                ? 'Analise seu próprio desempenho nas competências do ciclo atual de forma sincera.'
                                : 'Avalie seus colegas de equipe. O feedback ajuda no desenvolvimento contínuo de todos.'}
                        </p>

                        {loading ? (
                            <p className="text-slate-500 font-bold mb-6 animate-pulse">Carregando dados...</p>
                        ) : isAuto ? (
                            !autoAvaliacaoPendente ? (
                                <div className="mb-8 p-6 bg-green-500/10 rounded-2xl border border-green-500/20 text-green-400 font-bold">
                                    Você já concluiu sua autoavaliação neste ciclo! 🎉
                                </div>
                            ) : (
                                <div className="mb-8 p-6 bg-blue-500/10 rounded-2xl border border-blue-500/20 text-blue-400 font-bold">
                                    Pronto para começar sua autoavaliação!
                                </div>
                            )
                        ) : pendentes.length > 0 ? (
                            <div className="mb-8 text-left max-w-sm mx-auto relative z-10">
                                <label className="block text-sm font-bold text-slate-400 mb-2 font-black uppercase tracking-widest">Avaliando o colega:</label>
                                <select
                                    className="w-full bg-black/40 border border-white/10 text-white rounded-xl p-4 mb-4 focus:ring-2 focus:ring-orange-500 outline-none font-bold appearance-none cursor-pointer"
                                    value={avaliadoId || ''}
                                    onChange={e => setAvaliadoId(e.target.value)}
                                >
                                    {pendentes.map(p => (
                                        <option key={p.id} value={p.id} className="bg-slate-900">{p.nome} ({p.cargo || 'Colaborador'})</option>
                                    ))}
                                </select>

                                <label className="flex items-center gap-3 cursor-pointer p-4 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-colors mt-4">
                                    <input type="checkbox" checked={anonimo} onChange={e => setAnonimo(e.target.checked)} className="w-5 h-5 rounded border-slate-600 bg-slate-800 text-orange-500 cursor-pointer" />
                                    <span className="text-white font-medium">Avaliação Anônima</span>
                                </label>
                            </div>
                        ) : (
                            <div className="mb-8 p-6 bg-green-500/10 rounded-2xl border border-green-500/20 text-green-400 font-bold">
                                Você não tem colegas pendentes para avaliar neste ciclo! 🎉
                            </div>
                        )}

                        <button
                            disabled={(!isAuto && (!avaliadoId || pendentes.length === 0)) || (isAuto && (!usuario || !autoAvaliacaoPendente))}
                            onClick={() => setStep(2)}
                            className={`w-full sm:w-auto px-10 py-4 disabled:opacity-50 disabled:grayscale rounded-2xl font-black text-white transition-all shadow-lg relative z-10 ${isAuto ? 'bg-blue-600 hover:bg-blue-500 shadow-blue-900/40' : 'bg-orange-600 hover:bg-orange-500 shadow-orange-900/40'}`}
                        >
                            {isAuto ? 'Iniciar Minha Avaliação' : 'Começar Avaliação'}
                        </button>
                    </div>
                )}

                {step === 2 && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="flex justify-between items-center bg-white/5 p-4 rounded-xl border border-white/5">
                            <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                                <span>{isAuto ? 'Avaliando a si mesmo' : 'Avaliando Colega:'}</span>
                                {!isAuto && pendentes.find(p => p.id.toString() === avaliadoId) && (
                                    <span className="text-white bg-white/10 px-2 py-1 rounded-md">{pendentes.find(p => p.id.toString() === avaliadoId).nome}</span>
                                )}
                            </div>
                            <div className="flex items-center gap-5">
                                <div className="flex items-center gap-3">
                                    <span className="text-xs font-black uppercase tracking-widest text-slate-500">Média</span>
                                    <span className="text-xl font-black text-white px-3 py-1 bg-white/10 rounded-lg">
                                        {Object.keys(avaliacoes).length > 0
                                            ? (Object.values(avaliacoes).reduce((a, b) => a + b, 0) / Object.values(avaliacoes).length).toFixed(1)
                                            : '0.0'}
                                    </span>
                                </div>
                                <div className="h-6 w-px bg-white/10"></div>
                                <div className="flex items-center gap-3">
                                    <span className="text-xs font-black uppercase tracking-widest text-slate-500">Progresso</span>
                                    <span className={`${isAuto ? 'text-blue-500' : 'text-orange-500'} font-black`}>{Object.keys(avaliacoes).length} / {competencias.length}</span>
                                </div>
                            </div>
                        </div>

                        {competencias.map(comp => (
                            <div key={comp.id} className="glass-card p-8 group">
                                <h3 className="text-xl font-bold mb-6 text-slate-200 text-center">{comp.nome}</h3>
                                <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
                                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(score => {
                                        const isSelected = avaliacoes[comp.id] === score;

                                        let colorClass = 'hover:border-slate-500 hover:bg-slate-500/10 text-slate-400 hover:text-slate-300';
                                        let activeClass = 'bg-slate-600 border-slate-500 text-white shadow-lg shadow-slate-500/20';

                                        if (score <= 4) {
                                            colorClass = 'hover:border-red-500 hover:bg-red-500/10 text-slate-400 hover:text-red-400';
                                            activeClass = 'bg-red-500 border-red-400 text-white shadow-lg shadow-red-500/20';
                                        } else if (score <= 6) {
                                            colorClass = 'hover:border-yellow-500 hover:bg-yellow-500/10 text-slate-400 hover:text-yellow-400';
                                            activeClass = 'bg-yellow-500 border-yellow-400 text-white shadow-lg shadow-yellow-500/20';
                                        } else if (score <= 8) {
                                            colorClass = 'hover:border-green-500 hover:bg-green-500/10 text-slate-400 hover:text-green-400';
                                            activeClass = 'bg-green-500 border-green-400 text-white shadow-lg shadow-green-500/20';
                                        } else {
                                            colorClass = 'hover:border-blue-500 hover:bg-blue-500/10 text-slate-400 hover:text-blue-400';
                                            activeClass = 'bg-blue-600 border-blue-400 text-white shadow-lg shadow-blue-600/20';
                                        }

                                        const btnClass = isSelected ? activeClass : 'bg-white/5 border-transparent ' + colorClass;

                                        return (
                                            <button
                                                key={score}
                                                onClick={() => handleScore(comp.id, score)}
                                                className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl font-black transition-all border-2 flex items-center justify-center ${btnClass}`}
                                            >
                                                <span className="text-lg leading-none">{score}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}

                        <button
                            disabled={Object.keys(avaliacoes).length < competencias.length}
                            onClick={handleSubmit}
                            className={`w-full py-5 disabled:opacity-50 disabled:hover:bg-green-600 rounded-2xl font-black text-white shadow-xl transition-all flex justify-center items-center gap-2 mt-8 bg-green-600 hover:bg-green-500 shadow-green-900/40`}
                        >
                            {Object.keys(avaliacoes).length < competencias.length ? 'Preencha todas as competências' : 'Finalizar e Enviar Avaliação'}
                        </button>
                    </div>
                )}

                {step === 3 && (
                    <div className="glass-card p-12 text-center">
                        <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6 text-green-500">
                            <CheckCircle2 size={40} />
                        </div>
                        <h2 className="text-2xl font-black mb-2">Avaliação Enviada!</h2>
                        <p className="text-slate-400 mb-8 font-medium">Obrigado por contribuir para a cultura de feedback.</p>
                        <button onClick={() => window.location.href = '/feedback'} className="text-blue-500 font-black flex items-center gap-2 mx-auto">
                            Ver Meus Resultados <ChevronRight size={18} />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AssessmentWizard;
