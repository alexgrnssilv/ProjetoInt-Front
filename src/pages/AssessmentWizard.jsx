import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../api/api';
import { ClipboardList, CheckCircle2, ChevronRight, ChevronLeft, ArrowRight, UserCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const AssessmentWizard = () => {
    const { usuario } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
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

    const getScoreBadge = (score) => {
        if (!score) return null;
        if (score <= 4) return { label: 'Crítico / Atenção', color: 'text-rose-400 bg-rose-500/10 border-rose-500/30' };
        if (score <= 6) return { label: 'Em Desenvolvimento', color: 'text-amber-400 bg-amber-500/10 border-amber-500/30' };
        if (score <= 8) return { label: 'Atingiu o Esperado', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' };
        return { label: 'Superou Expectativas', color: 'text-teal-400 bg-teal-500/10 border-teal-500/30' };
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

    const totalCompetencias = competencias.length;
    const preenchidas = Object.keys(avaliacoes).length;
    const mediaAtual = preenchidas > 0
        ? (Object.values(avaliacoes).reduce((a, b) => a + b, 0) / preenchidas).toFixed(1)
        : '0.0';

    return (
        <main className="page-shell assessment-page w-full min-h-screen flex justify-center items-start px-3 sm:px-6 py-6 sm:py-10">
            <div className="assessment-shell w-full max-w-3xl">
                {/* Botão Voltar para Resultados */}
                <button
                    onClick={() => navigate('/feedback')}
                    className="back-link flex items-center gap-2 text-slate-400 hover:text-teal-400 mb-6 transition-colors text-xs sm:text-sm font-bold"
                >
                    <ChevronLeft size={16} /> Voltar para Meus Resultados
                </button>

                {/* ETAPA 1: APRESENTAÇÃO */}
                {step === 1 && (
                    <div className="assessment-intro glass-card p-6 sm:p-10 text-center relative overflow-hidden">
                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5 border ${isAuto ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' : 'bg-amber-500/10 border-amber-500/20 text-amber-400'}`}>
                            <ClipboardList size={32} />
                        </div>
                        <span className="page-kicker">{isAuto ? 'Reflexão Individual' : 'Avaliação Contínua'}</span>
                        <h1 className="text-2xl sm:text-3xl font-black mb-3 text-white">
                            {isAuto ? 'Autoavaliação de Desempenho' : 'Avaliação 360° (Pares)'}
                        </h1>
                        <p className="text-slate-400 text-sm max-w-lg mx-auto mb-6">
                            {isAuto
                                ? 'Analise sinceramente suas competências técnicas e comportamentais no ciclo ativo. Seu feedback pessoal apoia seu plano de desenvolvimento individual.'
                                : 'Avalie a colaboração de seus colegas de equipe. Seus apontamentos construtivos fortalecem o crescimento de todo o time.'}
                        </p>

                        {loading ? (
                            <div className="p-6 text-slate-400 font-bold text-sm animate-pulse">Carregando dados do ciclo...</div>
                        ) : isAuto ? (
                            !autoAvaliacaoPendente ? (
                                <div className="assessment-state mb-6 p-4 bg-emerald-500/10 rounded-xl border border-emerald-500/20 text-emerald-400 font-bold text-sm">
                                    Você já concluiu sua autoavaliação neste ciclo! 🎉
                                </div>
                            ) : (
                                <div className="assessment-state mb-6 p-4 bg-blue-500/10 rounded-xl border border-blue-500/20 text-blue-400 font-bold text-sm">
                                    Pronto para iniciar sua autoavaliação!
                                </div>
                            )
                        ) : pendentes.length > 0 ? (
                            <div className="mb-6 text-left max-w-md mx-auto">
                                <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">
                                    Selecione o Colega para Avaliar:
                                </label>
                                <select
                                    className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl p-3 text-sm focus:border-amber-400 outline-none font-bold"
                                    value={avaliadoId || ''}
                                    onChange={e => setAvaliadoId(e.target.value)}
                                >
                                    {pendentes.map(p => (
                                        <option key={p.id} value={p.id} className="bg-slate-900">
                                            {p.nome} — {p.cargo || 'Colaborador'} ({p.equipe?.nome || 'Equipe'})
                                        </option>
                                    ))}
                                </select>
                            </div>
                        ) : (
                            <div className="assessment-state mb-6 p-4 bg-emerald-500/10 rounded-xl border border-emerald-500/20 text-emerald-400 font-bold text-sm">
                                Você não possui avaliações de pares pendentes neste ciclo! 🎉
                            </div>
                        )}

                        <button
                            disabled={(!isAuto && (!avaliadoId || pendentes.length === 0)) || (isAuto && (!usuario || !autoAvaliacaoPendente))}
                            onClick={() => setStep(2)}
                            className={`w-full sm:w-auto px-8 py-3.5 disabled:opacity-50 disabled:grayscale rounded-xl font-bold text-white transition-all shadow-lg text-sm inline-flex items-center justify-center gap-2 ${isAuto ? 'bg-blue-600 hover:bg-blue-500 shadow-blue-900/40' : 'bg-amber-600 hover:bg-amber-500 shadow-amber-900/40'}`}
                        >
                            <span>{isAuto ? 'Iniciar Minha Avaliação' : 'Começar Avaliação do Colega'}</span>
                            <ArrowRight size={16} />
                        </button>
                    </div>
                )}

                {/* ETAPA 2: PREENCHIMENTO */}
                {step === 2 && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {/* Header de Resumo com Avaliado e Progresso */}
                        <div className="assessment-summary bg-slate-900/80 backdrop-blur-md p-4 rounded-xl border border-slate-700/60 flex flex-wrap items-center justify-between gap-3 shadow-lg">
                            <div className="flex items-center gap-2 text-xs">
                                <span className="text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                                    {isAuto ? 'Autoavaliação:' : 'Avaliando Colega:'}
                                </span>
                                <span className="text-white font-bold bg-white/10 px-2.5 py-1 rounded-md">
                                    {isAuto ? usuario?.nome : pendentes.find(p => p.id.toString() === avaliadoId)?.nome || 'Colega'}
                                </span>
                            </div>
                            <div className="flex items-center gap-4 text-xs font-bold">
                                <div className="flex items-center gap-2">
                                    <span className="text-slate-400 uppercase text-[10px] tracking-wider">Média:</span>
                                    <span className={`text-base font-black ${isAuto ? 'text-teal-400' : 'text-amber-400'}`}>{mediaAtual}</span>
                                </div>
                                <div className="h-4 w-px bg-white/10" />
                                <div className="flex items-center gap-2">
                                    <span className="text-slate-400 uppercase text-[10px] tracking-wider">Progresso:</span>
                                    <span className={`${preenchidas === totalCompetencias ? 'text-emerald-400' : 'text-blue-400'} font-black`}>
                                        {preenchidas} / {totalCompetencias}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Régua de Explicação das Notas */}
                        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-3 flex flex-wrap items-center justify-between gap-2 text-xs">
                            <span className="font-bold text-slate-300 text-[11px] uppercase tracking-wider">Escala:</span>
                            <div className="flex flex-wrap items-center gap-3 text-[11px]">
                                <span className="flex items-center gap-1.5 text-rose-400">
                                    <span className="w-2 h-2 rounded-full bg-rose-500" /> 1-4 Crítico
                                </span>
                                <span className="flex items-center gap-1.5 text-amber-400">
                                    <span className="w-2 h-2 rounded-full bg-amber-500" /> 5-6 Em Desenv.
                                </span>
                                <span className="flex items-center gap-1.5 text-emerald-400">
                                    <span className="w-2 h-2 rounded-full bg-emerald-500" /> 7-8 Atingiu
                                </span>
                                <span className="flex items-center gap-1.5 text-teal-400">
                                    <span className="w-2 h-2 rounded-full bg-teal-500" /> 9-10 Superou
                                </span>
                            </div>
                        </div>

                        {/* Cartões de Competências */}
                        {competencias.map(comp => {
                            const selectedScore = avaliacoes[comp.id];
                            const badge = getScoreBadge(selectedScore);

                            return (
                                <div key={comp.id} className="score-panel glass-card p-5 sm:p-7">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-5">
                                        <div>
                                            <span className="text-[10px] uppercase font-bold text-teal-400 tracking-wider">Competência</span>
                                            <h3 className="text-base sm:text-lg font-bold text-slate-100">{comp.nome}</h3>
                                        </div>
                                        {badge && (
                                            <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border inline-flex items-center gap-1.5 self-start sm:self-auto ${badge.color}`}>
                                                Nota {selectedScore} • {badge.label}
                                            </span>
                                        )}
                                    </div>

                                    {/* Grid de 1 a 10 organizado em 5 colunas no mobile e 10 colunas no desktop */}
                                    <div className="grid grid-cols-5 sm:grid-cols-10 gap-2 sm:gap-2.5">
                                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(score => {
                                            const isSelected = selectedScore === score;

                                            let baseClass = 'bg-slate-900/80 border-slate-700/80 text-slate-300 hover:bg-slate-800 hover:text-white hover:border-slate-500';
                                            let activeClass = '';

                                            if (score <= 4) {
                                                activeClass = 'bg-rose-600 border-rose-400 text-white shadow-lg shadow-rose-600/30 scale-105';
                                                if (!isSelected) baseClass = 'bg-slate-900/80 border-slate-700/80 text-slate-300 hover:border-rose-400 hover:text-rose-400';
                                            } else if (score <= 6) {
                                                activeClass = 'bg-amber-600 border-amber-400 text-white shadow-lg shadow-amber-600/30 scale-105';
                                                if (!isSelected) baseClass = 'bg-slate-900/80 border-slate-700/80 text-slate-300 hover:border-amber-400 hover:text-amber-400';
                                            } else if (score <= 8) {
                                                activeClass = 'bg-emerald-600 border-emerald-400 text-white shadow-lg shadow-emerald-600/30 scale-105';
                                                if (!isSelected) baseClass = 'bg-slate-900/80 border-slate-700/80 text-slate-300 hover:border-emerald-400 hover:text-emerald-400';
                                            } else {
                                                activeClass = 'bg-teal-600 border-teal-400 text-white shadow-lg shadow-teal-600/30 scale-105';
                                                if (!isSelected) baseClass = 'bg-slate-900/80 border-slate-700/80 text-slate-300 hover:border-teal-400 hover:text-teal-400';
                                            }

                                            return (
                                                <button
                                                    key={score}
                                                    type="button"
                                                    onClick={() => handleScore(comp.id, score)}
                                                    className={`h-11 sm:h-12 rounded-xl font-black text-sm sm:text-base border transition-all flex items-center justify-center cursor-pointer ${isSelected ? activeClass : baseClass}`}
                                                >
                                                    {score}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })}

                        {/* Botão de Enviar */}
                        <button
                            disabled={preenchidas < totalCompetencias}
                            onClick={handleSubmit}
                            className={`w-full py-4 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-bold text-white shadow-xl transition-all flex justify-center items-center gap-2 text-sm sm:text-base mt-6 ${isAuto ? 'bg-blue-600 hover:bg-blue-500 shadow-blue-900/40' : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-900/40'}`}
                        >
                            {preenchidas < totalCompetencias
                                ? `Preencha todas as competências (${preenchidas}/${totalCompetencias})`
                                : isAuto ? 'Concluir Minha Autoavaliação' : 'Finalizar e Enviar Avaliação'}
                        </button>
                    </div>
                )}

                {/* ETAPA 3: SUCESSO */}
                {step === 3 && (
                    <div className="assessment-success glass-card p-8 sm:p-12 text-center animate-in zoom-in duration-500">
                        <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-5 text-emerald-400">
                            <CheckCircle2 size={40} />
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-black mb-2 text-white">Avaliação Enviada com Sucesso!</h2>
                        <p className="text-slate-400 mb-8 text-sm max-w-sm mx-auto">
                            Obrigado por contribuir com a cultura de feedback e desenvolvimento contínuo da equipe.
                        </p>
                        <button
                            onClick={() => navigate('/feedback')}
                            className="py-3 px-6 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-900/40 text-sm inline-flex items-center gap-2 mx-auto"
                        >
                            <span>Ver Meus Resultados</span>
                            <ChevronRight size={16} />
                        </button>
                    </div>
                )}
            </div>
        </main>
    );
};

export default AssessmentWizard;
