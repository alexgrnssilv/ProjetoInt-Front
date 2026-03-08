import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/api';
import { UserPlus, Users, Trash2, Edit2, Check, X, ClipboardList, Calendar, Power, ChevronLeft } from 'lucide-react';

const AdminManagement = () => {
    const [usuarios, setUsuarios] = useState([]);
    const [equipes, setEquipes] = useState([]);
    const [ciclos, setCiclos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [novoUsuario, setNovoUsuario] = useState({ nome: '', email: '', senha: '', cargo: '', papel: 'COLABORADOR', equipeId: '' });
    const [novoCiclo, setNovoCiclo] = useState({ nome: '', dataInicio: '', dataFim: '', tipoPeriodo: 'MENSAL' });
    const [isEditing, setIsEditing] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [notificacao, setNotificacao] = useState(null); // { tipo: 'sucesso' | 'erro', mensagem: string }
    const [confirmacao, setConfirmacao] = useState(null); // { mensagem: string, onConfirm: () => void }

    // Extract unique cargos from existing users
    const cargosDisponiveis = Array.from(new Set(usuarios.map(u => u.cargo).filter(Boolean))).sort();

    const navigate = useNavigate();

    const fetchData = async () => {
        try {
            const [resUsers, resTeams, resCiclos] = await Promise.all([
                api.get('/admin/usuarios'),
                api.get('/admin/equipes'),
                api.get('/admin/ciclos')
            ]);
            setUsuarios(resUsers.data);
            setEquipes(resTeams.data);
            setCiclos(resCiclos.data);
            setLoading(false);
        } catch (e) {
            console.error(e);
        }
    };

    const showNotification = (mensagem, tipo = 'sucesso') => {
        setNotificacao({ mensagem, tipo });
        setTimeout(() => setNotificacao(null), 4000);
    };

    useEffect(() => { fetchData(); }, []);

    const handleCreateUser = async (e) => {
        e.preventDefault();
        try {
            if (isEditing) {
                // Ignore empty password when editing to not change it on the API side (if backend supported it this way, otherwise standard put)
                const payload = { ...novoUsuario };
                if (!payload.senha) delete payload.senha; // The basic backend route doesn't even explicitly handle `senha` update, but good practice. We might just pass the updated fields.

                await api.put(`/admin/usuarios/${editingId}`, payload);
                setIsEditing(false);
                setEditingId(null);
            } else {
                await api.post('/admin/usuarios', novoUsuario);
            }
            setNovoUsuario({ nome: '', email: '', senha: '', cargo: '', papel: 'COLABORADOR', equipeId: '' });
            showNotification(isEditing ? 'Usuário atualizado com sucesso!' : 'Usuário criado com sucesso!');
            fetchData();
        } catch (e) {
            showNotification(isEditing ? 'Erro ao atualizar usuário' : 'Erro ao criar usuário', 'erro');
        }
    };

    const handleEditClick = (u) => {
        setIsEditing(true);
        setEditingId(u.id);
        setNovoUsuario({
            nome: u.nome,
            email: u.email,
            senha: '', // Don't fetch password
            cargo: u.cargo || '',
            papel: u.papel || 'COLABORADOR',
            equipeId: u.equipeId || '',
            ativo: u.ativo
        });
    };

    const handleDeleteClick = (id) => {
        setConfirmacao({
            mensagem: 'Tem certeza que deseja deletar este usuário? Esta ação é irreversível.',
            onConfirm: async () => {
                try {
                    await api.delete(`/admin/usuarios/${id}`);
                    showNotification('Usuário deletado com sucesso!');
                    fetchData();
                } catch (e) {
                    showNotification('Erro ao deletar usuário: ' + (e.response?.data?.mensagem || e.message), 'erro');
                }
                setConfirmacao(null);
            }
        });
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        setEditingId(null);
        setNovoUsuario({ nome: '', email: '', senha: '', cargo: '', papel: 'COLABORADOR', equipeId: '' });
    };

    const handleCreateCiclo = async (e) => {
        e.preventDefault();
        try {
            await api.post('/admin/ciclos', novoCiclo);
            setNovoCiclo({ nome: '', dataInicio: '', dataFim: '', tipoPeriodo: 'MENSAL' });
            showNotification('Ciclo criado com sucesso!');
            fetchData();
        } catch (e) { showNotification('Erro ao criar ciclo', 'erro'); }
    };

    const handleToggleCiclo = (c) => {
        setConfirmacao({
            mensagem: c.fechado ? 'Reabrir este ciclo?' : 'Fechar este ciclo? Avaliações não poderão ser editadas enquanto fechado.',
            onConfirm: async () => {
                try {
                    await api.put(`/admin/ciclos/${c.id}`, { fechado: !c.fechado });
                    showNotification(c.fechado ? 'Ciclo reaberto!' : 'Ciclo fechado!');
                    fetchData();
                } catch (e) {
                    showNotification('Erro ao alterar status do ciclo: ' + (e.response?.data?.mensagem || e.message), 'erro');
                }
                setConfirmacao(null);
            }
        });
    };

    const handleToggleUserStatus = async (u) => {
        try {
            await api.put(`/admin/usuarios/${u.id}`, { ativo: !u.ativo });
            showNotification(u.ativo ? 'Usuário desativado!' : 'Usuário ativado!');
            fetchData();
        } catch (e) {
            showNotification('Erro ao alterar status do usuário: ' + (e.response?.data?.mensagem || e.message), 'erro');
        }
    };

    const handleDeleteCiclo = (id) => {
        setConfirmacao({
            mensagem: 'Tem certeza que deseja EXCLUIR este ciclo? Isso removerá todas as avaliações permanentemente.',
            onConfirm: async () => {
                try {
                    await api.delete(`/admin/ciclos/${id}`);
                    showNotification('Ciclo excluído com sucesso!');
                    fetchData();
                } catch (e) {
                    showNotification('Erro ao excluir ciclo: ' + (e.response?.data?.mensagem || e.message), 'erro');
                }
                setConfirmacao(null);
            }
        });
    };

    return (
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '80px 48px 32px 48px', minHeight: '100vh' }}>
            <button onClick={() => navigate('/admin')} className="flex items-center gap-2 text-slate-400 hover:text-white mb-8 transition-colors text-sm font-bold">
                <ChevronLeft size={16} /> Voltar para Dashboard
            </button>

            <header className="mb-10">
                <h1 className="text-4xl font-black text-gradient mb-2">Gestão do Sistema</h1>
                <p className="text-slate-400">Controle total de usuários e equipes Gestão091</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Coluna Esquerda: Formulários */}
                <div className="space-y-8 h-fit">
                    {/* Form Cadastro */}
                    <div className="glass-card p-8 relative">
                        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                            {isEditing ? <Edit2 className="text-blue-500" /> : <UserPlus className="text-blue-500" />}
                            {isEditing ? 'Editar Colaborador' : 'Novo Cadastro'}
                        </h2>
                        <form onSubmit={handleCreateUser} className="space-y-4">
                            <div>
                                <input
                                    placeholder="Nome Completo"
                                    className="w-full bg-slate-900 border-none rounded-xl p-3 text-sm focus:ring-2 ring-blue-500/50"
                                    value={novoUsuario.nome}
                                    onChange={e => setNovoUsuario({ ...novoUsuario, nome: e.target.value })}
                                />
                                <input
                                    placeholder="Email"
                                    className="w-full bg-slate-900 border-none rounded-xl p-3 text-sm focus:ring-2 ring-blue-500/50"
                                    value={novoUsuario.email}
                                    onChange={e => setNovoUsuario({ ...novoUsuario, email: e.target.value })}
                                />
                                <input
                                    type="password"
                                    placeholder="Senha Inicial"
                                    className="w-full bg-slate-900 border-none rounded-xl p-3 text-sm focus:ring-2 ring-blue-500/50"
                                    value={novoUsuario.senha}
                                    onChange={e => setNovoUsuario({ ...novoUsuario, senha: e.target.value })}
                                />
                                <div className="flex gap-2">
                                    <input
                                        list="cargos-list"
                                        placeholder="Cargo (Digite ou Selecione)"
                                        className="w-full bg-slate-900 border-none rounded-xl p-3 text-sm focus:ring-2 ring-blue-500/50"
                                        value={novoUsuario.cargo}
                                        onChange={e => setNovoUsuario({ ...novoUsuario, cargo: e.target.value })}
                                    />
                                    <datalist id="cargos-list">
                                        {cargosDisponiveis.map(c => <option key={c} value={c} />)}
                                    </datalist>
                                    <select
                                        className="w-full bg-slate-900 border-none rounded-xl p-3 text-sm text-slate-400"
                                        value={novoUsuario.papel}
                                        onChange={e => setNovoUsuario({ ...novoUsuario, papel: e.target.value })}
                                    >
                                        <option value="COLABORADOR">Colaborador</option>
                                        <option value="ADMIN">Administrador</option>
                                    </select>
                                </div>
                                <select
                                    className="w-full bg-slate-900 border-none rounded-xl p-3 text-sm text-slate-400"
                                    value={novoUsuario.equipeId}
                                    onChange={e => setNovoUsuario({ ...novoUsuario, equipeId: e.target.value })}
                                >
                                    <option value="">Sem Equipe</option>
                                    {equipes.map(eq => <option key={eq.id} value={eq.id}>{eq.nome}</option>)}
                                </select>
                                {isEditing && (
                                    <label className="flex items-center gap-3 cursor-pointer p-4 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-colors">
                                        <input
                                            type="checkbox"
                                            checked={novoUsuario.ativo}
                                            onChange={e => setNovoUsuario({ ...novoUsuario, ativo: e.target.checked })}
                                            className="w-5 h-5 rounded border-slate-600 bg-slate-800 text-blue-500 cursor-pointer"
                                        />
                                        <span className="text-white font-medium text-sm">Usuário Ativo</span>
                                    </label>
                                )}
                            </div>
                            <div className="pt-2">
                                <button type="submit" className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-900/40">
                                    {isEditing ? 'Salvar Alterações' : 'Cadastrar Usuário'}
                                </button>
                                {isEditing && (
                                    <button type="button" onClick={handleCancelEdit} className="w-full py-4 mt-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold transition-all text-sm">
                                        Cancelar Edição
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>

                    {/* Form Ciclos */}
                    <div className="glass-card p-8">
                        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                            <Calendar className="text-purple-500" /> Novo Ciclo
                        </h2>
                        <form onSubmit={handleCreateCiclo} className="space-y-4">
                            <input placeholder="Nome (ex: Q1 2024)" className="w-full bg-slate-900 border-none rounded-xl p-3 text-sm focus:ring-2 ring-purple-500/50" value={novoCiclo.nome} onChange={e => setNovoCiclo({ ...novoCiclo, nome: e.target.value })} required />
                            <div className="flex gap-2">
                                <input type="date" className="w-full bg-slate-900 border-none rounded-xl p-3 text-sm focus:ring-2 ring-purple-500/50 text-slate-400" value={novoCiclo.dataInicio} onChange={e => setNovoCiclo({ ...novoCiclo, dataInicio: e.target.value })} required />
                                <input type="date" className="w-full bg-slate-900 border-none rounded-xl p-3 text-sm focus:ring-2 ring-purple-500/50 text-slate-400" value={novoCiclo.dataFim} onChange={e => setNovoCiclo({ ...novoCiclo, dataFim: e.target.value })} required />
                            </div>
                            <select className="w-full bg-slate-900 border-none rounded-xl p-3 text-sm text-slate-400" value={novoCiclo.tipoPeriodo} onChange={e => setNovoCiclo({ ...novoCiclo, tipoPeriodo: e.target.value })}>
                                <option value="MENSAL">Mensal</option>
                                <option value="TRIMESTRAL">Trimestral</option>
                                <option value="SEMESTRAL">Semestral</option>
                            </select>
                            <button type="submit" className="w-full py-4 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-purple-900/40">Criar Ciclo</button>
                        </form>
                    </div>
                </div>

                {/* Coluna Direita: Listas/Tabelas */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Lista Usuários */}
                    <div className="glass-card overflow-hidden">
                        <div className="p-6 border-b border-white/5 bg-white/5">
                            <h2 className="font-bold flex items-center gap-2"><Users className="text-blue-400" /> Colaboradores Ativos</h2>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="text-left text-xs uppercase text-slate-500 font-bold border-b border-white/5">
                                        <th className="px-6 py-4">Nome</th>
                                        <th className="px-6 py-4">Cargo & Papel</th>
                                        <th className="px-6 py-4">Equipe</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4">Ação</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {usuarios.map(u => (
                                        <tr key={u.id} className={`hover:bg-white/[0.02] ${!u.ativo ? 'opacity-50' : ''}`}>
                                            <td className="px-6 py-4 font-semibold text-sm">
                                                {u.nome}
                                                <div className="text-xs text-slate-400 font-normal">{u.email}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm">{u.cargo || 'Não definido'}</div>
                                                <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-md ${u.papel === 'ADMIN' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' : 'bg-slate-500/10 text-slate-400 border border-slate-500/20'}`}>
                                                    {u.papel}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-xs">
                                                <span className="px-2 py-1 bg-blue-500/10 text-blue-400 rounded-md border border-blue-500/20">
                                                    {u.equipe?.nome || 'Livre'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <button
                                                    onClick={() => handleToggleUserStatus(u)}
                                                    className={`px-3 py-1 text-[10px] rounded-md font-bold uppercase ${u.ativo ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}
                                                >
                                                    {u.ativo ? 'Ativo' : 'Inativo'}
                                                </button>
                                            </td>
                                            <td className="px-6 py-4 flex gap-2">
                                                <Link to={`/admin/avaliar?userId=${u.id}`} title="Avaliar Colaborador" className="p-2 hover:bg-blue-500/10 rounded-lg text-blue-400">
                                                    <ClipboardList size={14} />
                                                </Link>
                                                <button onClick={() => handleEditClick(u)} title="Editar" className="p-2 hover:bg-white/10 rounded-lg text-slate-400"><Edit2 size={14} /></button>
                                                <button onClick={() => handleDeleteClick(u.id)} title="Excluir" className="p-2 hover:bg-red-500/10 rounded-lg text-red-400"><Trash2 size={14} /></button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Lista Ciclos */}
                    <div className="glass-card overflow-hidden">
                        <div className="p-6 border-b border-white/5 bg-white/5">
                            <h2 className="font-bold flex items-center gap-2"><Calendar className="text-purple-400" /> Ciclos de Avaliação</h2>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="text-left text-xs uppercase text-slate-500 font-bold border-b border-white/5">
                                        <th className="px-6 py-4">Nome</th>
                                        <th className="px-6 py-4">Período</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4">Ação</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {ciclos.map(c => (
                                        <tr key={c.id} className="hover:bg-white/[0.02]">
                                            <td className="px-6 py-4 font-semibold text-sm">{c.nome}</td>
                                            <td className="px-6 py-4 text-xs text-slate-400">{new Date(new Date(c.dataInicio).getTime() + new Date(c.dataInicio).getTimezoneOffset() * 60000).toLocaleDateString()} - {new Date(new Date(c.dataFim).getTime() + new Date(c.dataFim).getTimezoneOffset() * 60000).toLocaleDateString()}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-3 py-1 text-[10px] rounded-md font-bold uppercase ${c.fechado ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'bg-green-500/10 text-green-500 border border-green-500/20'}`}>
                                                    {c.fechado ? 'Fechado' : 'Aberto'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 flex gap-2">
                                                <button onClick={() => handleToggleCiclo(c)} title={c.fechado ? "Reabrir" : "Fechar Ciclo"} className={`p-2 rounded-lg ${c.fechado ? 'hover:bg-green-500/10 text-green-400' : 'hover:bg-orange-500/10 text-orange-400'}`}><Power size={14} /></button>
                                                <button onClick={() => handleDeleteCiclo(c.id)} title="Excluir" className="p-2 hover:bg-red-500/10 rounded-lg text-red-400"><Trash2 size={14} /></button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {/* Notification Toast */}
            {notificacao && (
                <div className={`fixed bottom-8 right-8 p-4 rounded-xl shadow-2xl flex items-center gap-3 animar-entrada z-50 border ${notificacao.tipo === 'sucesso' ? 'bg-green-900/90 border-green-500/50 text-green-100' : 'bg-red-900/90 border-red-500/50 text-red-100'}`}>
                    {notificacao.tipo === 'sucesso' ? <Check size={20} /> : <X size={20} />}
                    <span className="font-bold text-sm">{notificacao.mensagem}</span>
                </div>
            )}

            {/* Confirmation Modal */}
            {confirmacao && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
                    <div className="glass-card max-w-md w-full p-8 animar-entrada">
                        <h3 className="text-xl font-bold mb-4">Confirmação</h3>
                        <p className="text-slate-400 mb-8 leading-relaxed">{confirmacao.mensagem}</p>
                        <div className="flex gap-4">
                            <button
                                onClick={() => setConfirmacao(null)}
                                className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold transition-all"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={confirmacao.onConfirm}
                                className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-900/40"
                            >
                                Confirmar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminManagement;
