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

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [pendRes, compRes, cicloRes] = await Promise.all([
                    api.get('/avaliacoes/pendentes'),
                    api.get('/avaliacoes/competencias'),
                    api.get('/avaliacoes/ciclo-ativo')
                ]);

                setPendentes(pendRes.data.colegasPendentes || []);
                setCompetencias(compRes.data || []);
                setCicloId(cicloRes.data?.id || pendRes.data.cicloId);

                if (isAuto && usuario) {
                    setAvaliadoId(usuario.id.toString());
                } else if (pendRes.data.colegasPendentes?.length > 0) {
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
        <div style={{ maxWidth: '768px', margin: '0 auto', padding: '80px 48px 32px 48px', minHeight: '100vh' }}>
            {step === 1 && (
                <div className="glass-card p-10 text-center">
                    <ClipboardList size={60} className="mx-auto text-blue-500 mb-6" />
                    <h1 className="text-3xl font-black mb-4">
                        {isAuto ? 'Autoavaliação de Desempenho' : 'Avaliação 360° (Pares)'}
                    </h1>
                    <p className="text-slate-400 mb-6 font-medium">
                        {isAuto
                            ? 'Analise seu próprio desempenho nas competências do ciclo atual.'
                            : 'Avalie seus colegas de equipe. O feedback ajuda no desenvolvimento contínuo.'}
                    </p>

                    {loading ? (
                        <p className="text-white mb-6 animate-pulse">Carregando dados...</p>
                    ) : isAuto ? (
                        <div className="mb-8 p-6 bg-blue-500/10 rounded-2xl border border-blue-500/20 text-blue-400 font-bold">
                            Pronto para começar sua autoavaliação!
                        </div>
                    ) : pendentes.length > 0 ? (
                        <div className="mb-8 text-left max-w-sm mx-auto">
                            <label className="block text-sm font-bold text-slate-400 mb-2 font-black uppercase tracking-widest">Quem você vai avaliar agora?</label>
                            <select
                                className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg p-3 mb-4 focus:ring-2 focus:ring-blue-500 outline-none font-bold"
                                value={avaliadoId || ''}
                                onChange={e => setAvaliadoId(e.target.value)}
                            >
                                {pendentes.map(p => (
                                    <option key={p.id} value={p.id}>{p.nome} ({p.cargo || 'Colaborador'})</option>
                                ))}
                            </select>

                            <label className="flex items-center gap-3 cursor-pointer p-4 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-colors">
                                <input type="checkbox" checked={anonimo} onChange={e => setAnonimo(e.target.checked)} className="w-5 h-5 rounded border-slate-600 bg-slate-800 text-blue-500 cursor-pointer" />
                                <span className="text-white font-medium">Avaliação Anônima</span>
                            </label>
                        </div>
                    ) : (
                        <p className="text-green-400 font-bold mb-8 py-4 bg-green-500/10 rounded-xl border border-green-500/20">Você não tem avaliações pendentes neste ciclo! 🎉</p>
                    )}

                    <button
                        disabled={(!isAuto && (!avaliadoId || pendentes.length === 0)) || (isAuto && !usuario)}
                        onClick={() => setStep(2)}
                        className="w-full py-4 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:grayscale rounded-2xl font-black text-white transition-all shadow-lg shadow-blue-900/40"
                    >
                        {isAuto ? 'Iniciar Minha Avaliação' : 'Começar Avaliação'}
                    </button>
                </div>
            )}

            {step === 2 && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="flex justify-between items-center bg-white/5 p-4 rounded-xl border border-white/5">
                        <span className="text-xs font-black uppercase tracking-widest text-slate-500">Progresso</span>
                        <span className="text-blue-500 font-black">{Object.keys(avaliacoes).length} / {competencias.length}</span>
                    </div>

                    {competencias.map(comp => (
                        <div key={comp.id} className="glass-card p-8">
                            <h3 className="text-xl font-bold mb-6">{comp.nome}</h3>
                            <div className="flex flex-wrap gap-2">
                                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(score => (
                                    <button
                                        key={score}
                                        onClick={() => handleScore(comp.id, score)}
                                        className={`flex-1 min-w-[40px] py-3 rounded-xl font-black transition-all border-2 
                                            ${avaliacoes[comp.id] === score
                                                ? 'bg-blue-600 border-blue-400 text-white scale-110 shadow-lg shadow-blue-500/30'
                                                : 'bg-white/5 border-transparent text-slate-400 hover:bg-white/10 hover:text-white'}`}
                                    >
                                        {score}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}

                    <button
                        disabled={Object.keys(avaliacoes).length < competencias.length}
                        onClick={handleSubmit}
                        className="w-full py-5 bg-green-600 disabled:opacity-50 disabled:grayscale rounded-2xl font-black text-white shadow-xl shadow-green-900/40"
                    >
                        Finalizar e Enviar
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
    );
};

export default AssessmentWizard;
