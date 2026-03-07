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
        try {
            const payload = {
                avaliadoId: parseInt(userId),
                cicloId: cicloAtivo.id,
                tipo: 'LIDER',
                avaliacoes: Object.keys(avaliacoes).map(id => ({
                    competenciaId: parseInt(id),
                    pontuacao: avaliacoes[id],
                    observacoes: ''
                }))
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
        <div className="max-w-3xl mx-auto p-8 pt-20">
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
                        <div className="flex items-center gap-3">
                            <span className="text-xs font-black uppercase tracking-widest text-slate-500">Progresso</span>
                            <span className="text-blue-500 font-black">{Object.keys(avaliacoes).length} / {competencias.length}</span>
                        </div>
                    </div>

                    {competencias.map(comp => (
                        <div key={comp.id} className="glass-card p-8 group">
                            <h3 className="text-xl font-bold mb-6 text-slate-200">{comp.nome}</h3>
                            <div className="grid grid-cols-5 md:grid-cols-10 gap-2">
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

                                    const btnClass = isSelected ? activeClass + ' scale-[1.05]' : 'bg-white/5 border-transparent ' + colorClass;

                                    return (
                                        <button
                                            key={score}
                                            onClick={() => handleScore(comp.id, score)}
                                            className={`py-3 rounded-xl font-black transition-all border-2 flex flex-col items-center justify-center ${btnClass}`}
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
                        className="w-full py-5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:hover:bg-blue-600 rounded-2xl font-black text-white shadow-xl shadow-blue-900/40 transition-all flex justify-center items-center gap-2"
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
    );
};

export default AdminEvaluation;
