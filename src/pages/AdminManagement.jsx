import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/api';
import { UserPlus, Users, Trash2, Edit2, Check, X, ClipboardList, Calendar, Power } from 'lucide-react';
import Navbar from '../components/Navbar';

const AdminManagement = () => {
    const [usuarios, setUsuarios] = useState([]);
    const [equipes, setEquipes] = useState([]);
    const [ciclos, setCiclos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [novoUsuario, setNovoUsuario] = useState({ nome: '', email: '', senha: '', cargo: '', papel: 'COLABORADOR', equipeId: '' });
    const [novoCiclo, setNovoCiclo] = useState({ nome: '', dataInicio: '', dataFim: '', tipoPeriodo: 'MENSAL' });
    const [isEditing, setIsEditing] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [notificacao, setNotificacao] = useState(null);
    const [confirmacao, setConfirmacao] = useState(null);

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
                const payload = { ...novoUsuario };
                if (!payload.senha) delete payload.senha;
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
            senha: '',
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
        <main className="page-shell management-page">
            <Navbar />

            <header className="page-header management-header mb-8">
                <div>
                    <span className="page-kicker">Administração</span>
                    <h1 className="text-3xl sm:text-4xl font-black text-gradient mb-2">Gestão do Sistema</h1>
                    <p className="text-slate-400 text-sm sm:text-base">Controle de colaboradores, equipes e ciclos de avaliação.</p>
                </div>
            </header>

            <div className="management-layout grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Coluna Esquerda: Formulários */}
                <div className="management-forms space-y-8 h-fit">
                    {/* Form Cadastro */}
                    <div className="glass-card p-6 sm:p-8 relative">
                        <h2 className="text-xl font-bold mb-5 flex items-center gap-2">
                            {isEditing ? <Edit2 className="text-blue-500" size={20} /> : <UserPlus className="text-blue-500" size={20} />}
                            {isEditing ? 'Editar Colaborador' : 'Novo Cadastro'}
                        </h2>
                        <form onSubmit={handleCreateUser} className="space-y-4">
                            <div className="space-y-3">
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Nome Completo</label>
                                    <input
                                        placeholder="Ex: João da Silva"
                                        className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm focus:border-teal-400 focus:ring-1 focus:ring-teal-400 outline-none transition-all"
                                        value={novoUsuario.nome}
                                        onChange={e => setNovoUsuario({ ...novoUsuario, nome: e.target.value })}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wider">E-mail</label>
                                    <input
                                        type="email"
                                        placeholder="Ex: joao@empresa.com"
                                        className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm focus:border-teal-400 focus:ring-1 focus:ring-teal-400 outline-none transition-all"
                                        value={novoUsuario.email}
                                        onChange={e => setNovoUsuario({ ...novoUsuario, email: e.target.value })}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wider">
                                        {isEditing ? 'Nova Senha (opcional)' : 'Senha Inicial'}
                                    </label>
                                    <input
                                        type="password"
                                        placeholder={isEditing ? 'Deixe em branco para manter' : '••••••••'}
                                        className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm focus:border-teal-400 focus:ring-1 focus:ring-teal-400 outline-none transition-all"
                                        value={novoUsuario.senha}
                                        onChange={e => setNovoUsuario({ ...novoUsuario, senha: e.target.value })}
                                        {...(!isEditing ? { required: true } : {})}
                                    />
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Cargo</label>
                                        <input
                                            list="cargos-list"
                                            placeholder="Cargo do Colaborador"
                                            className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm focus:border-teal-400 focus:ring-1 focus:ring-teal-400 outline-none transition-all"
                                            value={novoUsuario.cargo}
                                            onChange={e => setNovoUsuario({ ...novoUsuario, cargo: e.target.value })}
                                        />
                                        <datalist id="cargos-list">
                                            {cargosDisponiveis.map(c => <option key={c} value={c} />)}
                                        </datalist>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Papel</label>
                                        <select
                                            className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm text-slate-300 focus:border-teal-400 focus:ring-1 focus:ring-teal-400 outline-none transition-all"
                                            value={novoUsuario.papel}
                                            onChange={e => setNovoUsuario({ ...novoUsuario, papel: e.target.value })}
                                        >
                                            <option value="COLABORADOR">Colaborador</option>
                                            <option value="ADMIN">Administrador</option>
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Equipe</label>
                                    <select
                                        className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm text-slate-300 focus:border-teal-400 focus:ring-1 focus:ring-teal-400 outline-none transition-all"
                                        value={novoUsuario.equipeId}
                                        onChange={e => setNovoUsuario({ ...novoUsuario, equipeId: e.target.value })}
                                    >
                                        <option value="">Sem Equipe</option>
                                        {equipes.map(eq => <option key={eq.id} value={eq.id}>{eq.nome}</option>)}
                                    </select>
                                </div>
                                {isEditing && (
                                    <label className="flex items-center gap-3 cursor-pointer p-3.5 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-colors mt-2">
                                        <input
                                            type="checkbox"
                                            checked={novoUsuario.ativo}
                                            onChange={e => setNovoUsuario({ ...novoUsuario, ativo: e.target.checked })}
                                            className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-teal-400 cursor-pointer"
                                        />
                                        <span className="text-white font-medium text-sm">Usuário Ativo</span>
                                    </label>
                                )}
                            </div>
                            <div className="pt-2 space-y-2">
                                <button type="submit" className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-900/40 text-sm">
                                    {isEditing ? 'Salvar Alterações' : 'Cadastrar Usuário'}
                                </button>
                                {isEditing && (
                                    <button type="button" onClick={handleCancelEdit} className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold transition-all text-xs">
                                        Cancelar Edição
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>

                    {/* Form Ciclos */}
                    <div className="glass-card p-6 sm:p-8">
                        <h2 className="text-xl font-bold mb-5 flex items-center gap-2">
                            <Calendar className="text-purple-400" size={20} /> Novo Ciclo
                        </h2>
                        <form onSubmit={handleCreateCiclo} className="space-y-4">
                            <div className="space-y-3">
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Nome do Ciclo</label>
                                    <input
                                        placeholder="Ex: Ciclo 2025 - Q1"
                                        className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm focus:border-purple-400 focus:ring-1 focus:ring-purple-400 outline-none transition-all"
                                        value={novoCiclo.nome}
                                        onChange={e => setNovoCiclo({ ...novoCiclo, nome: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Início</label>
                                        <input
                                            type="date"
                                            className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm text-slate-300 focus:border-purple-400 focus:ring-1 focus:ring-purple-400 outline-none transition-all"
                                            value={novoCiclo.dataInicio}
                                            onChange={e => setNovoCiclo({ ...novoCiclo, dataInicio: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Fim</label>
                                        <input
                                            type="date"
                                            className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm text-slate-300 focus:border-purple-400 focus:ring-1 focus:ring-purple-400 outline-none transition-all"
                                            value={novoCiclo.dataFim}
                                            onChange={e => setNovoCiclo({ ...novoCiclo, dataFim: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Periodicidade</label>
                                    <select
                                        className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm text-slate-300 focus:border-purple-400 focus:ring-1 focus:ring-purple-400 outline-none transition-all"
                                        value={novoCiclo.tipoPeriodo}
                                        onChange={e => setNovoCiclo({ ...novoCiclo, tipoPeriodo: e.target.value })}
                                    >
                                        <option value="MENSAL">Mensal</option>
                                        <option value="TRIMESTRAL">Trimestral</option>
                                        <option value="SEMESTRAL">Semestral</option>
                                    </select>
                                </div>
                            </div>
                            <button type="submit" className="w-full py-3.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-purple-900/40 text-sm">
                                Criar Ciclo
                            </button>
                        </form>
                    </div>
                </div>

                {/* Coluna Direita: Listas/Tabelas */}
                <div className="management-data lg:col-span-2 space-y-8">
                    {/* Lista Usuários */}
                    <div className="glass-card overflow-hidden">
                        <div className="p-5 sm:p-6 border-b border-white/5 bg-white/5 flex items-center justify-between">
                            <h2 className="font-bold flex items-center gap-2 text-base sm:text-lg">
                                <Users className="text-blue-400" size={20} /> Colaboradores Ativos ({usuarios.length})
                            </h2>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="text-left text-xs uppercase text-slate-400 font-bold border-b border-white/5 bg-slate-900/40">
                                        <th className="px-5 py-3.5">Nome</th>
                                        <th className="px-5 py-3.5">Cargo & Papel</th>
                                        <th className="px-5 py-3.5">Equipe</th>
                                        <th className="px-5 py-3.5">Status</th>
                                        <th className="px-5 py-3.5 text-right">Ações</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {usuarios.map(u => (
                                        <tr key={u.id} className={`hover:bg-white/[0.02] transition-colors ${!u.ativo ? 'opacity-50' : ''}`}>
                                            <td className="px-5 py-3.5 font-semibold text-sm">
                                                {u.nome}
                                                <div className="text-xs text-slate-400 font-normal">{u.email}</div>
                                            </td>
                                            <td className="px-5 py-3.5">
                                                <div className="text-sm text-slate-200">{u.cargo || 'Não definido'}</div>
                                                <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-md inline-block mt-0.5 ${u.papel === 'ADMIN' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' : 'bg-slate-500/10 text-slate-400 border border-slate-500/20'}`}>
                                                    {u.papel}
                                                </span>
                                            </td>
                                            <td className="px-5 py-3.5 text-xs">
                                                <span className="px-2 py-1 bg-blue-500/10 text-blue-400 rounded-md border border-blue-500/20 font-medium">
                                                    {u.equipe?.nome || 'Sem equipe'}
                                                </span>
                                            </td>
                                            <td className="px-5 py-3.5">
                                                <button
                                                    onClick={() => handleToggleUserStatus(u)}
                                                    className={`px-2.5 py-1 text-[10px] rounded-lg font-bold uppercase transition-all ${u.ativo ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/25' : 'bg-rose-500/15 text-rose-400 border border-rose-500/30 hover:bg-rose-500/25'}`}
                                                    title={u.ativo ? 'Clique para desativar' : 'Clique para ativar'}
                                                >
                                                    {u.ativo ? 'Ativo' : 'Inativo'}
                                                </button>
                                            </td>
                                            <td className="px-5 py-3.5 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Link
                                                        to={`/admin/avaliar?userId=${u.id}`}
                                                        title="Avaliar Colaborador"
                                                        className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/25 text-blue-400 hover:bg-blue-500/20 hover:border-blue-400 flex items-center justify-center transition-all"
                                                    >
                                                        <ClipboardList size={15} />
                                                    </Link>
                                                    <button
                                                        onClick={() => handleEditClick(u)}
                                                        title="Editar Colaborador"
                                                        className="w-8 h-8 rounded-lg bg-slate-800/80 border border-slate-700/60 text-slate-300 hover:bg-slate-700 hover:text-white hover:border-slate-500 flex items-center justify-center transition-all"
                                                    >
                                                        <Edit2 size={15} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteClick(u.id)}
                                                        title="Excluir Colaborador"
                                                        className="w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/25 text-red-400 hover:bg-red-500/20 hover:border-red-400 flex items-center justify-center transition-all"
                                                    >
                                                        <Trash2 size={15} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Lista Ciclos */}
                    <div className="glass-card overflow-hidden">
                        <div className="p-5 sm:p-6 border-b border-white/5 bg-white/5 flex items-center justify-between">
                            <h2 className="font-bold flex items-center gap-2 text-base sm:text-lg">
                                <Calendar className="text-purple-400" size={20} /> Ciclos de Avaliação ({ciclos.length})
                            </h2>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="text-left text-xs uppercase text-slate-400 font-bold border-b border-white/5 bg-slate-900/40">
                                        <th className="px-5 py-3.5">Nome</th>
                                        <th className="px-5 py-3.5">Período</th>
                                        <th className="px-5 py-3.5">Status</th>
                                        <th className="px-5 py-3.5 text-right">Ações</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {ciclos.map(c => (
                                        <tr key={c.id} className="hover:bg-white/[0.02] transition-colors">
                                            <td className="px-5 py-3.5 font-semibold text-sm">{c.nome}</td>
                                            <td className="px-5 py-3.5 text-xs text-slate-400">
                                                {new Date(new Date(c.dataInicio).getTime() + new Date(c.dataInicio).getTimezoneOffset() * 60000).toLocaleDateString('pt-BR')} até {new Date(new Date(c.dataFim).getTime() + new Date(c.dataFim).getTimezoneOffset() * 60000).toLocaleDateString('pt-BR')}
                                            </td>
                                            <td className="px-5 py-3.5">
                                                <span className={`px-2.5 py-1 text-[10px] rounded-lg font-bold uppercase ${c.fechado ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'}`}>
                                                    {c.fechado ? 'Fechado' : 'Aberto'}
                                                </span>
                                            </td>
                                            <td className="px-5 py-3.5 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => handleToggleCiclo(c)}
                                                        title={c.fechado ? "Reabrir Ciclo" : "Fechar Ciclo"}
                                                        className={`w-8 h-8 rounded-lg border flex items-center justify-center transition-all ${c.fechado ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400 hover:bg-emerald-500/20' : 'bg-amber-500/10 border-amber-500/25 text-amber-400 hover:bg-amber-500/20'}`}
                                                    >
                                                        <Power size={15} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteCiclo(c.id)}
                                                        title="Excluir Ciclo"
                                                        className="w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/25 text-red-400 hover:bg-red-500/20 hover:border-red-400 flex items-center justify-center transition-all"
                                                    >
                                                        <Trash2 size={15} />
                                                    </button>
                                                </div>
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
                    <div className="glass-card max-w-md w-full p-6 sm:p-8 animar-entrada">
                        <h3 className="text-xl font-bold mb-3 text-white">Confirmação</h3>
                        <p className="text-slate-300 mb-6 leading-relaxed text-sm">{confirmacao.mensagem}</p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setConfirmacao(null)}
                                className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold transition-all text-sm"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={confirmacao.onConfirm}
                                className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-900/40 text-sm"
                            >
                                Confirmar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
};

export default AdminManagement;
