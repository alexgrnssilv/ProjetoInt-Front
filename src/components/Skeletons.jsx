// =====================================================
// Skeletons.jsx — Componentes de Carregamento
// Proporcionam uma transição suave enquanto os dados carregam.
// =====================================================

import React from 'react';

/**
 * SkeletonCard
 * Representa o carregamento de um MetricCard.
 */
export const SkeletonCard = () => (
    <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl animate-pulse">
        <div className="flex justify-between items-center mb-4">
            <div className="h-2 w-24 bg-slate-800 rounded"></div>
            <div className="h-8 w-8 bg-slate-800 rounded-lg"></div>
        </div>
        <div className="h-8 w-32 bg-slate-800 rounded mb-2"></div>
        <div className="h-3 w-40 bg-slate-800 rounded"></div>
    </div>
);

/**
 * SkeletonRadar
 * Simula o gráfico de radar em carregamento.
 */
export const SkeletonRadar = () => (
    <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl animate-pulse">
        <div className="h-4 w-40 bg-slate-800 rounded mb-4"></div>
        <div className="h-[250px] w-full flex items-center justify-center">
            <div className="w-48 h-48 border-4 border-slate-800 rounded-full border-dashed"></div>
        </div>
        <div className="mt-4 h-16 w-full bg-slate-800 rounded-lg"></div>
    </div>
);

/**
 * Explicação Didática: 
 * Por que usar Skeletons em vez de Spinners?
 * Skeletons reduzem a percepção de tempo de espera do usuário ao manter o layout estruturado, 
 * evitando "pulos" de conteúdo quando os dados finalmente chegam.
 */
