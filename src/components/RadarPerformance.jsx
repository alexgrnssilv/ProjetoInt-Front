// =====================================================
// RadarPerformance.jsx — Gráfico de Radar de Soft Skills
// Este componente visualiza o equilíbrio de competências.
// =====================================================

import React from 'react';
import {
    Radar,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    ResponsiveContainer,
    Tooltip
} from 'recharts';

/**
 * RadarPerformance
 * 
 * @param {Array} dados - Lista de objetos { competencia: string, nota: number }
 * @param {string} nomeColaborador - Nome do colaborador para o título
 */
const RadarPerformance = ({ dados, nomeColaborador }) => {

    // Lógica para determinar a cor baseada na média (Escala SENAI 1 a 4)
    const calcularMedia = () => {
        if (!dados || dados.length === 0) return 0;
        const soma = dados.reduce((acc, item) => acc + item.nota, 0);
        return soma / dados.length;
    };

    const media = calcularMedia();

    // Definição de cores conforme o nível de desempenho
    const obterCorPorMedia = (valor) => {
        if (valor >= 8.5) return "#3b82f6"; // Azul (Excedeu)
        if (valor >= 6.5) return "#22c55e"; // Verde (Atingiu)
        if (valor >= 4.5) return "#eab308"; // Amarelo (Em Desenvolvimento)
        return "#ef4444"; // Vermelho (Crítico)
    };

    const corPrincipal = obterCorPorMedia(media);

    return (
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl shadow-lg animar-entrada">
            <div className="mb-4">
                <h3 className="text-lg font-bold text-slate-100 uppercase tracking-wider">
                    Perfil de Competências
                </h3>
                <p className="text-sm text-slate-400">
                    Colaborador: <span className="text-slate-200 font-semibold">{nomeColaborador}</span>
                </p>
            </div>

            <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={dados}>
                        <PolarGrid stroke="#334155" />
                        <PolarAngleAxis
                            dataKey="competencia"
                            tick={{ fill: '#94a3b8', fontSize: 12 }}
                        />
                        <PolarRadiusAxis
                            angle={30}
                            domain={[0, 10]}
                            tickCount={6}
                            tick={{ fill: '#475569', fontSize: 10 }}
                        />
                        <Radar
                            name="Nota"
                            dataKey="nota"
                            stroke={corPrincipal}
                            fill={corPrincipal}
                            fillOpacity={0.5}
                        />
                        <Tooltip
                            contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                            itemStyle={{ color: '#f1f5f9' }}
                        />
                    </RadarChart>
                </ResponsiveContainer>
            </div>

            <div className="mt-6 p-4 bg-slate-800/50 rounded-lg border border-slate-700/50">
                <h4 className="text-sm font-bold text-blue-400 mb-2 uppercase">Por que fizemos assim? (Explicação Didática)</h4>
                <p className="text-sm text-slate-300 leading-relaxed">
                    <strong>O Gráfico de Radar</strong> é a escolha ideal para <em>soft skills</em> porque ele permite visualizar o "equilíbrio" entre diferentes dimensões ao mesmo tempo.
                    Enquanto um gráfico de colunas destaca apenas qual competência é maior ou menor, o Radar mostra como elas se integram.
                    Uma área harmoniosa e ampla indica um profissional equilibrado, enquanto pontas muito curtas revelam lacunas específicas que precisam de atenção imediata.
                    É uma ferramenta visual poderosa para <strong>feedbacks 360°</strong>.
                </p>
            </div>
        </div>
    );
};

export default RadarPerformance;
