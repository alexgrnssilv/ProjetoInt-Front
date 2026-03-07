// =====================================================
// MetricCard.jsx — Card de Métrica do Dashboard
// =====================================================

/**
 * @param {string} rotulo - Título do card (ex: "Média Global")
 * @param {string|number} valor - Valor em destaque
 * @param {string} subtexto - Texto complementar
 * @param {React.ReactNode} icone - Ícone Lucide
 * @param {string} corIcone - Cor hexadecimal do ícone/fundo
 * @param {number} progresso - Valor de 0 a 100 para a barra de progresso (opcional)
 */
export default function MetricCard({ rotulo, valor, subtexto, icone, corIcone = '#3B82F6', progresso }) {
    const corFundoIcone = `${corIcone}20` // 20 = 12% opacidade em hex

    return (
        <div className="card card-metrica animar-entrada">
            <div className="flex items-center justify-between">
                <span className="rotulo">{rotulo}</span>
                {icone && (
                    <div className="icone-wrapper" style={{ background: corFundoIcone, color: corIcone }}>
                        {icone}
                    </div>
                )}
            </div>

            <div className="valor" style={{ color: corIcone }}>
                {valor ?? '—'}
            </div>

            {subtexto && <span className="subtexto">{subtexto}</span>}

            {/* Barra de progresso opcional — usada para mostrar percentual */}
            {progresso !== undefined && (
                <div className="barra-progresso">
                    <div
                        className="barra-progresso-preenchimento"
                        style={{ width: `${progresso}%`, background: corIcone }}
                    />
                </div>
            )}
        </div>
    )
}
