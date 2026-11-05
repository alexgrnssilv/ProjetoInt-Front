import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../api/api';
import { ClipboardList, CheckCircle2, UserCircle2, ArrowRight, Award, Calendar } from 'lucide-react';
import Navbar from '../components/Navbar';

const AdminEvaluation = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const userId = searchParams.get('userId');

    const [loading, setLoading] = useState(true);
    const [step, setStep] = useState(1);
    const [avaliado, setAvaliado] = useState(null);
    const [competencias, setCompetencias] = useState([]);
    const [avaliacoes, setAvaliacoes] = useState({});
    const [cicloAtivo, setCicloAtivo] = useState(null);

    // Estados de feedback condicional
    const [feedbackTexto, setFeedbackTexto] = useState('');
    const [expectativa, setExpectativa] = useState('');
    const [agendarReuniao, setAgendarReuniao] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            if (!userId) {
                alert('Usuário não selecionado.');
                navigate('/admin/gestao');
                return;
            }
            try {
                const [usersRes, compRes, cicloRes] = await Promise.all([
                    api.get('/admin/usuarios'),
                    api.get('/admin/competencias'),
                    api.get('/admin/ciclo-ativo')
                ]);

                const user = usersRes.data.find(u => u.id === parseInt(userId));
                if (!user) {
                    alert('Usuário não encontrado.');
                    navigate('/admin/gestao');
                    return;
                }

                setAvaliado(user);
                setCompetencias(compRes.data || []);
                setCicloAtivo(cicloRes.data);

                if (!cicloRes.data) {
                    alert('Nenhum ciclo de avaliação ativo. Crie um ciclo na Gestão antes de avaliar.');
                }

                setLoading(false);
            } catch (error) {
                console.error('Erro ao carregar dados:', error);
                alert('Erro ao carregar dados da avaliação.');
                navigate('/admin/gestao');
            }
        };
        fetchData();
    }, [userId, navigate]);

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
        if (!cicloAtivo) {
            alert('Nenhum ciclo ativo disponível. Crie um ciclo na Gestão.');
            return;
        }

        const notas = Object.values(avaliacoes);
        const media = notas.length > 0 ? notas.reduce((a, b) => a + b, 0) / notas.length : 0;
        const precisaFeedback = media < 7;

        if (precisaFeedback && !expectativa) {
            alert('Por favor, selecione uma expectativa para o colaborador.');
            return;
        }

        if (precisaFeedback && !feedbackTexto.trim()) {
            alert('Por favor, escreva um plano de ação ou melhorias esperadas.');
            return;
        }

        try {
            const obsStr = precisaFeedback && feedbackTexto.trim() ? JSON.stringify({
                planoMelhoria: feedbackTexto.trim(),
                expectativaSelecionada: expectativa,
                reuniaoAgendada: agendarReuniao
            }) : '';

            const avaliacoesFormatadas = Object.keys(avaliacoes).map((id) => {
                return {
                    competenciaId: parseInt(id),
                    pontuacao: avaliacoes[id],
                    observacoes: obsStr
                };
            });

            const payload = {
                avaliadoId: parseInt(userId),
                cicloId: cicloAtivo.id,
                tipo: 'LIDER',
                avaliacoes: avaliacoesFormatadas
            };
            await api.post('/avaliacoes', payload);
            setStep(3);
        } catch (e) {
            console.error('Erro ao enviar avaliação:', e.response?.data, e.message);
            alert('Erro ao enviar avaliação: ' + (e.response?.data?.mensagem || e.message));
        }
    };

    if (loading) return (
        <div className="min-h-screen pt-20 flex flex-col items-center justify-center gap-3">
            <div className="w-10 h-10 border-4 border-teal-400 border-t-transparent rounded-full animate-spin" />
            <p className="text-slate-400 font-bold text-sm">Carregando dados da avaliação...</p>
        </div>
    );

    const totalCompetencias = competencias.length;
    const preenchidas = Object.keys(avaliacoes).length;
    const mediaAtual = preenchidas > 0
        ? (Object.values(avaliacoes).reduce((a, b) => a + b, 0) / preenchidas).toFixed(1)
        : '0.0';

    return (
        <main className="page-shell assessment-page-wrapper">
            <Navbar />

            <div className="assessment-page w-full flex justify-center items-start px-2 sm:px-6 pb-12">
                <div className="assessment-shell w-full max-w-3xl">
                    {/* ETAPA 1: APRESENTAÇÃO */}
                    {step === 1 && (
                        <div className="assessment-intro glass-card p-6 sm:p-10 text-center relative overflow-hidden">
                            <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mx-auto mb-5 shadow-lg shadow-blue-500/5">
                                <ClipboardList size={32} />
                            </div>
                            <span className="page-kicker">Liderança Direta</span>
                            <h1 className="text-2xl sm:text-3xl font-black mb-3">Avaliação de Desempenho</h1>
                            <p className="text-slate-400 text-sm max-w-lg mx-auto mb-6">
                                Avalie com precisão as competências do colaborador. Esta avaliação possui peso de 50% na consolidação dos resultados do ciclo.
                            </p>

                            {/* Cartão de Detalhes do Avaliado */}
                            <div className="bg-slate-900/60 border border-slate-700/60 rounded-2xl p-4 sm:p-5 text-left mb-6 max-w-md mx-auto">
                                <div className="flex items-center gap-3.5 mb-3 pb-3 border-b border-white/5">
                                    <div className="w-11 h-11 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center shrink-0">
                                        <UserCircle2 size={26} />
                                    </div>
                                    <div>
                                        <div className="text-sm font-bold text-white">{avaliado.nome}</div>
                                        <div className="text-xs text-slate-400">{avaliado.email}</div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-2 text-xs">
                                    <div>
                                        <span className="text-slate-500 block uppercase font-bold text-[10px]">Cargo</span>
                                        <span className="text-slate-300 font-semibold">{avaliado.cargo || 'Colaborador'}</span>
                                    </div>
                                    <div>
                                        <span className="text-slate-500 block uppercase font-bold text-[10px]">Ciclo</span>
                                        <span className="text-teal-400 font-semibold">{cicloAtivo?.nome || 'Ciclo Ativo'}</span>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={() => setStep(2)}
                                className="w-full sm:w-auto px-8 py-3.5 bg-blue-600 hover:bg-blue-500 rounded-xl font-bold text-white transition-all shadow-lg shadow-blue-900/40 text-sm inline-flex items-center justify-center gap-2"
                            >
                                <span>Iniciar Avaliação</span>
                                <ArrowRight size={16} />
                            </button>
                        </div>
                    )}

                    {/* ETAPA 2: PREENCHIMENTO DAS NOTAS */}
                    {step === 2 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            {/* Resumo do Progresso Flutuante */}
                            <div className="assessment-summary bg-slate-900/80 backdrop-blur-md p-4 rounded-xl border border-slate-700/60 flex flex-wrap items-center justify-between gap-3 shadow-lg">
                                <div className="flex items-center gap-2 text-xs">
                                    <span className="text-slate-400 font-bold uppercase text-[10px] tracking-wider">Avaliando:</span>
                                    <span className="text-white font-bold bg-white/10 px-2.5 py-1 rounded-md">{avaliado.nome}</span>
                                </div>
                                <div className="flex items-center gap-4 text-xs font-bold">
                                    <div className="flex items-center gap-2">
                                        <span className="text-slate-400 uppercase text-[10px] tracking-wider">Média:</span>
                                        <span className="text-base text-teal-400 font-black">{mediaAtual}</span>
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

                            {/* Cartões de Cada Competência */}
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

                                        {/* Grid de 1 a 10 com espaçamento otimizado para mobile e desktop */}
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

                            {/* BLOCO CONDICIONAL DE FEEDBACK E PLANO DE AÇÃO */}
                            {preenchidas === totalCompetencias && (parseFloat(mediaAtual) < 7) && (
                                <div className="action-plan score-panel glass-card p-6 sm:p-8 border-amber-500/30 shadow-lg animate-in fade-in slide-in-from-bottom-6 duration-500">
                                    <div className="mb-6">
                                        <span className="text-[10px] font-bold uppercase text-amber-400 tracking-wider">Atenção Necessária</span>
                                        <h3 className="text-xl font-black text-white mb-1.5">Plano de Ação e Feedback 🎯</h3>
                                        <p className="text-slate-300 text-xs sm:text-sm">
                                            A média geral do colaborador ficou abaixo de 7.0 ({mediaAtual}). Defina as expectativas e os pontos de melhoria para acompanhar sua evolução.
                                        </p>
                                    </div>

                                    <div className="space-y-6">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-300 mb-3 uppercase tracking-wider">
                                                Nível de Expectativa de Melhoria
                                            </label>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                                                {[
                                                    { id: 'critico', label: 'Crítico: Ação Imediata', desc: 'Melhoria urgente requerida.', color: 'bg-red-500/10 border-red-500/30 text-red-400', active: 'bg-red-600 border-red-400 text-white shadow-lg' },
                                                    { id: 'desenvolvimento', label: 'Atenção e Foco', desc: 'Precisa melhorar consistência.', color: 'bg-amber-500/10 border-amber-500/30 text-amber-400', active: 'bg-amber-600 border-amber-400 text-white shadow-lg' },
                                                    { id: 'atingiu', label: 'Acelerar Potencial', desc: 'Bom progresso, focar no próximo nível.', color: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400', active: 'bg-emerald-600 border-emerald-400 text-white shadow-lg' },
                                                    { id: 'excedeu', label: 'Exigência Técnica', desc: 'Desafiar para alto desempenho.', color: 'bg-blue-500/10 border-blue-500/30 text-blue-400', active: 'bg-blue-600 border-blue-400 text-white shadow-lg' }
                                                ].map(exp => (
                                                    <button
                                                        key={exp.id}
                                                        type="button"
                                                        onClick={() => setExpectativa(exp.id)}
                                                        className={`p-3.5 rounded-xl border text-left transition-all ${expectativa === exp.id ? exp.active : exp.color + ' hover:border-slate-500'}`}
                                                    >
                                                        <div className="font-bold text-xs mb-1">{exp.label}</div>
                                                        <div className="text-[10px] opacity-80">{exp.desc}</div>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-slate-300 mb-2 uppercase tracking-wider">
                                                O que o colaborador precisa melhorar? (Feedback Construtivo)
                                            </label>
                                            <textarea
                                                value={feedbackTexto}
                                                onChange={(e) => setFeedbackTexto(e.target.value)}
                                                className="w-full h-28 bg-slate-900/90 border border-slate-700/80 rounded-xl p-3.5 text-white placeholder-slate-500 text-sm focus:border-teal-400 focus:ring-1 focus:ring-teal-400 outline-none resize-none transition-all"
                                                placeholder="Ex: Identifiquei que na última sprint as entregas atrasaram devido à falta de comunicação prévia. Recomendo alinhar expectativas diariamente..."
                                            />
                                        </div>

                                        <div className="flex items-center gap-3.5 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
                                            <button
                                                type="button"
                                                onClick={() => setAgendarReuniao(!agendarReuniao)}
                                                className={`w-6 h-6 rounded-md border flex items-center justify-center transition-all ${agendarReuniao ? 'bg-teal-500 border-teal-500 text-slate-900' : 'bg-transparent border-slate-600 hover:border-slate-400'}`}
                                            >
                                                {agendarReuniao && <CheckCircle2 size={16} />}
                                            </button>
                                            <div>
                                                <div className="font-bold text-xs text-slate-200">Agendar Reunião de Alinhamento 1:1</div>
                                                <div className="text-[11px] text-slate-400">Envia um alerta ao colaborador sugerindo uma reunião para repassar este feedback.</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Botão de Envio */}
                            <button
                                disabled={preenchidas < totalCompetencias}
                                onClick={handleSubmit}
                                className="w-full py-4 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-bold text-white shadow-xl shadow-blue-900/40 transition-all flex justify-center items-center gap-2 text-sm sm:text-base mt-6"
                            >
                                {preenchidas < totalCompetencias
                                    ? `Preencha todas as competências (${preenchidas}/${totalCompetencias})`
                                    : 'Finalizar Avaliação de Liderança'}
                            </button>
                        </div>
                    )}

                    {/* ETAPA 3: SUCESSO */}
                    {step === 3 && (
                        <div className="assessment-success glass-card p-8 sm:p-12 text-center animate-in zoom-in duration-500">
                            <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-5 text-emerald-400 relative">
                                <CheckCircle2 size={40} />
                            </div>
                            <h2 className="text-2xl sm:text-3xl font-black mb-2 text-white">Avaliação Registrada!</h2>
                            <p className="text-slate-400 mb-8 text-sm max-w-sm mx-auto">
                                As notas para <strong className="text-white">{avaliado.nome}</strong> foram consolidadas com sucesso no ciclo ativo.
                            </p>

                            <div className="flex flex-col sm:flex-row justify-center gap-3">
                                <button
                                    onClick={() => navigate('/admin')}
                                    className="py-3 px-6 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-bold transition-all text-sm"
                                >
                                    Ver Ranking Geral
                                </button>
                                <button
                                    onClick={() => navigate('/admin/gestao')}
                                    className="py-3 px-6 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-900/40 text-sm"
                                >
                                    Voltar para Gestão
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
};

export default AdminEvaluation;
