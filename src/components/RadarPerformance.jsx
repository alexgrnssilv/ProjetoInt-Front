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

    // Lógica para determinar a cor baseada na média (Escala SoftSkills 360 de 1 a 10)
    const calcularMedia = () => {
        if (!dados || dados.length === 0) return 0;
        const soma = dados.reduce((acc, item) => acc + item.nota, 0);
        return soma / dados.length;
    };

    const media = calcularMedia();

    const competenciaMaisForte = dados?.reduce((anterior, atual) => (
        atual.nota > anterior.nota ? atual : anterior
    ), dados[0]);
    const competenciaPrioritaria = dados?.reduce((anterior, atual) => (
        atual.nota < anterior.nota ? atual : anterior
    ), dados[0]);

    // Definição de cores conforme o nível de desempenho
    const obterCorPorMedia = (valor) => {
        if (valor >= 8.5) return "#3b82f6"; // Azul (Excedeu)
        if (valor >= 6.5) return "#22c55e"; // Verde (Atingiu)
        if (valor >= 4.5) return "#eab308"; // Amarelo (Em Desenvolvimento)
        return "#ef4444"; // Vermelho (Crítico)
    };

    const corPrincipal = obterCorPorMedia(media);

    return (
        <div className="radar-card animar-entrada">
            <div className="radar-card-header">
                <div>
                    <span className="radar-card-eyebrow">Feedback 360</span>
                    <h3>Perfil de competências</h3>
                    <p>{nomeColaborador}</p>
                </div>
                <div className="radar-score">
                    <strong>{media.toFixed(1)}</strong>
                    <span>/ 10</span>
                </div>
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

            <div className="radar-reading">
                <div>
                    <span>Maior domínio</span>
                    <strong>{competenciaMaisForte?.competencia || '—'}</strong>
                    <small>{competenciaMaisForte?.nota ?? '—'} / 10</small>
                </div>
                <div>
                    <span>Foco de evolução</span>
                    <strong>{competenciaPrioritaria?.competencia || '—'}</strong>
                    <small>{competenciaPrioritaria?.nota ?? '—'} / 10</small>
                </div>
            </div>
        </div>
    );
};

export default RadarPerformance;
