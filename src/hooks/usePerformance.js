// =====================================================
// usePerformance.js — Hook Customizado para Dados
// Gerencia estados de carregamento, erro e dados da API.
// =====================================================

import { useState, useEffect } from 'react';
import api from '../api/api';

/**
 * usePerformance
 * Hook para buscar dados de desempenho do colaborador ou equipe.
 * 
 * @param {string} endpoint - Caminho da API (ex: '/dashboard/stats')
 * @param {object} params - Parâmetros de filtro (equipeId, cicloId)
 */
const usePerformance = (endpoint, params = {}) => {
    const [dados, setDados] = useState(null);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState(null);

    useEffect(() => {
        const buscarDados = async () => {
            setCarregando(true);
            setErro(null);

            try {
                // Simulando um delay para mostrar os Skeletons (efeito visual profissional)
                await new Promise(resolve => setTimeout(resolve, 1500));

                const resposta = await api.get(endpoint, { params });

                if (resposta.data.sucesso) {
                    setDados(resposta.data.dados || resposta.data);
                } else {
                    throw new Error(resposta.data.mensagem || 'Erro ao carregar dados.');
                }
            } catch (err) {
                console.error('[usePerformance] Erro:', err);
                setErro(err.message || 'Erro de conexão com o servidor.');
            } finally {
                setCarregando(false);
            }
        };

        if (endpoint) {
            buscarDados();
        }
    }, [endpoint, JSON.stringify(params)]);

    return { dados, carregando, erro };
};

export default usePerformance;
