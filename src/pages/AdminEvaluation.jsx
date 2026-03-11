import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../api/api';
import { ClipboardList, CheckCircle2, ChevronLeft, UserCircle2 } from 'lucide-react';

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

    // Novos estados de feedback
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
                // Busca dados em paralelo: usuário, competências e ciclo ativo
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
            console.log('[DEBUG] Enviando avaliação:', payload);
            await api.post('/avaliacoes', payload);
            setStep(3);
        } catch (e) {
            console.error('Erro ao enviar avaliação:', e.response?.data, e.message);
            alert('Erro ao enviar avaliação: ' + (e.response?.data?.mensagem || e.message));
        }
    };

    if (loading) return <div className="min-h-screen pt-20 text-center text-slate-500 font-bold animate-pulse">Carregando dados...</div>;

    return (
        <div className="w-full min-h-screen flex justify-center items-start p-4 sm:p-8">
            <div className="w-full max-w-3xl pt-10 sm:pt-20">
                <button onClick={() => navigate('/admin/gestao')} className="flex items-center gap-2 text-slate-400 hover:text-white mb-8 transition-colors text-sm font-bold">
                    <ChevronLeft size={16} /> Voltar para Gestão
                </button>

                {step === 1 && (
                    <div className="glass-card p-10 text-center relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2"></div>
                        <ClipboardList size={60} className="mx-auto text-blue-500 mb-6 relative z-10" />
                        <h1 className="text-3xl font-black mb-2 relative z-10">Avaliação de Liderança</h1>

                        <div className="flex items-center justify-center gap-3 mt-6 mb-8 p-4 bg-white/5 inline-flex rounded-2xl border border-white/10 relative z-10">
                            <UserCircle2 className="text-slate-400" size={30} />
                            <div className="text-left">
                                <div className="text-sm font-bold text-white">{avaliado.nome}</div>
                                <div className="text-xs text-slate-400">{avaliado.email}</div>
                            </div>
                        </div>

                        <p className="text-slate-400 mb-8 max-w-md mx-auto relative z-10">
                            Avalie o colaborador nas competências chave do ciclo atual. Sua avaliação tem peso de 50% na nota final.
                        </p>
                        <button onClick={() => setStep(2)} className="w-full sm:w-auto px-10 py-4 bg-blue-600 hover:bg-blue-500 rounded-2xl font-black text-white transition-all shadow-lg shadow-blue-900/40 relative z-10">
                            Iniciar Avaliação
                        </button>
                    </div>
                )}

                {step === 2 && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="flex justify-between items-center bg-white/5 p-4 rounded-xl border border-white/5">
                            <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                                <span>Avaliando:</span> <span className="text-white bg-white/10 px-2 py-1 rounded-md">{avaliado.nome}</span>
                            </div>
                            <div className="flex items-center gap-5">
                                <div className="flex items-center gap-3">
                                    <span className="text-xs font-black uppercase tracking-widest text-slate-500">Média Atual</span>
                                    <span className="text-xl font-black text-white px-3 py-1 bg-white/10 rounded-lg">
                                        {Object.keys(avaliacoes).length > 0
                                            ? (Object.values(avaliacoes).reduce((a, b) => a + b, 0) / Object.values(avaliacoes).length).toFixed(1)
                                            : '0.0'}
                                    </span>
                                </div>
                                <div className="h-6 w-px bg-white/10"></div>
                                <div className="flex items-center gap-3">
                                    <span className="text-xs font-black uppercase tracking-widest text-slate-500">Progresso</span>
                                    <span className="text-blue-500 font-black">{Object.keys(avaliacoes).length} / {competencias.length}</span>
                                </div>
                            </div>
                        </div>

                        {competencias.map(comp => (
                            <div key={comp.id} className="glass-card p-8 group">
                                <h3 className="text-xl font-bold mb-6 text-slate-200 text-center">{comp.nome}</h3>
                                <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
                                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(score => {
                                        const isSelected = avaliacoes[comp.id] === score;

                                        let colorClass = 'bg-white/5 border-transparent text-slate-400 hover:bg-white/10 hover:text-white';
                                        let activeClass = 'bg-blue-600 border-blue-400 text-white scale-110 shadow-lg shadow-blue-500/30';

                                        if (score <= 4) {
                                            activeClass = 'bg-red-500 border-red-400 text-white scale-110 shadow-lg shadow-red-500/30';
                                            colorClass = 'bg-white/5 border-transparent text-slate-400 hover:bg-red-500/10 hover:text-red-400';
                                        } else if (score <= 6) {
                                            activeClass = 'bg-yellow-500 border-yellow-400 text-white scale-110 shadow-lg shadow-yellow-500/30';
                                            colorClass = 'bg-white/5 border-transparent text-slate-400 hover:bg-yellow-500/10 hover:text-yellow-400';
                                        } else if (score <= 8) {
                                            activeClass = 'bg-green-500 border-green-400 text-white scale-110 shadow-lg shadow-green-500/30';
                                            colorClass = 'bg-white/5 border-transparent text-slate-400 hover:bg-green-500/10 hover:text-green-400';
                                        }

                                        const btnClass = isSelected ? activeClass : colorClass;

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

                        {/* BLOCO CONDICIONAL DE FEEDBACK E PLANO DE AÇÃO */}
                        {Object.keys(avaliacoes).length === competencias.length && (Object.values(avaliacoes).reduce((a, b) => a + b, 0) / competencias.length < 7) && (
                            <div className="glass-card p-10 mt-10 border-indigo-500/30 shadow-[0_0_30px_rgba(99,102,241,0.15)] animate-in fade-in slide-in-from-bottom-8 duration-700">
                                <div className="mb-8">
                                    <h3 className="text-2xl font-black text-white mb-2">Plano de Ação e Feedback 🎯</h3>
                                    <p className="text-slate-400 text-sm">
                                        A média geral do colaborador está abaixo de 7.0. Por favor, defina um plano de ação claro e as expectativas esperadas para o seu desenvolvimento contínuo.
                                    </p>
                                </div>

                                <div className="space-y-8">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-300 mb-4">Selecione o Nível de Expectativa de Melhoria</label>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                            {[
                                                { id: 'critico', label: 'Crítico: Ação Imediata', desc: 'Melhoria urgente requerida.', color: 'bg-red-500/10 border-red-500/30 text-red-500 hover:border-red-500/50', active: 'bg-red-500 border-red-500 shadow-lg shadow-red-500/30 text-white' },
                                                { id: 'desenvolvimento', label: 'Atenção e Foco', desc: 'Precisa melhorar consistência.', color: 'bg-yellow-500/10 border-yellow-500/30 text-yellow-500 hover:border-yellow-500/50', active: 'bg-yellow-500 border-yellow-500 shadow-lg shadow-yellow-500/30 text-white' },
                                                { id: 'atingiu', label: 'Acelerar Potencial', desc: 'Bom progresso, focar no próximo nível.', color: 'bg-green-500/10 border-green-500/30 text-green-500 hover:border-green-500/50', active: 'bg-green-500 border-green-500 shadow-lg shadow-green-500/30 text-white' },
                                                { id: 'excedeu', label: 'Exigência Técnica', desc: 'Desafiar para alto desempenho.', color: 'bg-blue-500/10 border-blue-500/30 text-blue-500 hover:border-blue-500/50', active: 'bg-blue-500 border-blue-500 shadow-lg shadow-blue-500/30 text-white' }
                                            ].map(exp => (
                                                <button
                                                    key={exp.id}
                                                    onClick={() => setExpectativa(exp.id)}
                                                    className={`p-4 rounded-2xl border-2 text-left transition-all duration-300 ${expectativa === exp.id ? exp.active + ' scale-105' : exp.color}`}
                                                >
                                                    <div className="font-bold mb-1 text-sm">{exp.label}</div>
                                                    <div className="text-[10px] opacity-80">{exp.desc}</div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-slate-300 mb-2">O que o colaborador precisa melhorar? (Feedback Construtivo)</label>
                                        <textarea
                                            value={feedbackTexto}
                                            onChange={(e) => setFeedbackTexto(e.target.value)}
                                            className="w-full h-32 bg-black/40 border-2 border-white/10 rounded-2xl p-4 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:bg-indigo-500/5 transition-all outline-none resize-none overflow-y-auto custom-scrollbar"
                                            placeholder="Ex: Identifiquei que na última sprint as entregas atrasaram devido à falta de comunicação prévia. Recomendo alinhar expectativas diariamente nas dailys..."
                                        ></textarea>
                                    </div>

                                    <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5">
                                        <button
                                            onClick={() => setAgendarReuniao(!agendarReuniao)}
                                            className={`w-8 h-8 rounded-lg border-2 flex items-center justify-center transition-all ${agendarReuniao ? 'bg-indigo-500 border-indigo-500' : 'bg-transparent border-white/20 hover:border-white/40'}`}
                                        >
                                            {agendarReuniao && <CheckCircle2 size={16} className="text-white" />}
                                        </button>
                                        <div>
                                            <div className="font-bold text-slate-200">Agendar Reunião de Alinhamento 1:1</div>
                                            <div className="text-xs text-slate-400">Ao marcar esta opção, enviaremos um alerta ao colaborador sugerindo uma reunião para repassar este feedback.</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        <button
                            disabled={Object.keys(avaliacoes).length < competencias.length}
                            onClick={handleSubmit}
                            className="w-full py-5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:hover:bg-blue-600 rounded-2xl font-black text-white shadow-xl shadow-blue-900/40 transition-all flex justify-center items-center gap-2 mt-8"
                        >
                            {Object.keys(avaliacoes).length < competencias.length ? 'Preencha todas as competências' : 'Finalizar Avaliação'}
                        </button>
                    </div>
                )}

                {step === 3 && (
                    <div className="glass-card p-12 text-center animate-in zoom-in duration-500">
                        <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6 text-green-500 relative">
                            <div className="absolute inset-0 border-4 border-green-500/30 rounded-full animate-ping"></div>
                            <CheckCircle2 size={48} className="relative z-10" />
                        </div>
                        <h2 className="text-3xl font-black mb-3">Avaliação Registrada!</h2>
                        <p className="text-slate-400 mb-10 font-medium max-w-sm mx-auto">As notas para {avaliado.nome} foram salvas e já refletem no ranking geral da equipe.</p>

                        <div className="flex flex-col sm:flex-row justify-center gap-4">
                            <button onClick={() => navigate('/admin')} className="py-4 px-8 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold transition-all text-sm">
                                Ver Ranking
                            </button>
                            <button onClick={() => navigate('/admin/gestao')} className="py-4 px-8 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-900/40 text-sm">
                                Voltar para Gestão
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminEvaluation;
