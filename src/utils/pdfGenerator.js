export const generatePDF = async (elementId, fileName = 'relatorio-performance.pdf') => {
  const el = document.getElementById(elementId);
  if (!el) {
    console.error(`Elemento com ID ${elementId} não encontrado.`);
    return;
  }

  // Cria um clone do elemento para manipular sem afetar a tela original
  const clone = el.cloneNode(true);

  // Remove os botões de controle para não aparecerem no PDF
  const buttons = clone.querySelectorAll('button, a');
  buttons.forEach(b => b.remove());

  // Abre uma janela invisível (ou pop-up isolado) gerando o HTML de impressão perfeitamente legível na folha branca
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert("Por favor, permita pop-ups no seu navegador para gerar o PDF.");
    return;
  }

  printWindow.document.write(`
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head>
            <meta charset="UTF-8">
            <title>${fileName}</title>
            <style>
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap');
                
                body {
                    font-family: 'Inter', sans-serif;
                    background-color: #ffffff;
                    color: #020617;
                    padding: 40px;
                    margin: 0;
                    -webkit-print-color-adjust: exact;
                    print-color-adjust: exact;
                }
                
                /* Títulos e Headers */
                h2 { margin-bottom: 24px; font-weight: 900; color: #020617; font-size: 28px; border-bottom: 2px solid #e2e8f0; padding-bottom: 12px; }
                h3 { font-size: 20px; color: #0f172a; margin: 0 0 20px 0; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;}
                
                /* Estrutura da Tabela do Ranking */
                table { width: 100%; border-collapse: collapse; margin-top: 10px; }
                th { 
                    text-align: left; 
                    padding: 14px 16px; 
                    color: #64748b; 
                    text-transform: uppercase; 
                    font-size: 13px; 
                    border-bottom: 3px solid #e2e8f0; 
                    font-weight: 900;
                }
                td { 
                    padding: 16px; 
                    border-bottom: 1px solid #f1f5f9; 
                    color: #0f172a;
                    font-size: 15px;
                }
                tr:nth-child(even) { background-color: #f8fafc; }
                
                /* Utilitarios flex copiados do layout React */
                .flex { display: flex; align-items: center; gap: 12px; }
                .justify-between { justify-content: space-between; }
                .text-right { text-align: right; }
                .p-6 { padding: 8px; }
                
                /* Textos pontuais de nota */
                .text-xl { font-size: 24px; font-weight: 900; color: #0f172a; }
                .text-xs { font-size: 12px; color: #64748b; font-weight: bold; }
                
                /* Cores das Badges forçadas para Leitura em Papel Branco */
                span[style] {
                    display: inline-block;
                    padding: 6px 14px;
                    border-radius: 8px;
                    font-size: 12px;
                    font-weight: 900;
                    border: 2px solid #e2e8f0 !important;
                    background-color: #ffffff !important;
                    color: #0f172a !important; /* Preto forte para leitura no papel independente da cor web */
                    box-shadow: 2px 2px 0px #cbd5e1;
                }
                
                /* Limpa e esconde detalhes não pertinentes à impressão */
                .text-slate-200 { color: #0f172a !important; font-weight: 700; font-size: 16px; }
                .text-slate-600 { color: #64748b !important; }
                .text-slate-700 { color: #3b82f6 !important; font-size: 16px;}
            </style>
        </head>
        <body>
            <h2>Relatório de Performance Consolidado</h2>
            <div style="margin-bottom: 20px; font-size: 14px; color: #64748b;">
                <strong>Data de Geração:</strong> ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}
            </div>
            ${clone.innerHTML}
        </body>
        </html>
    `);

  printWindow.document.close();
  printWindow.focus();

  // Aguarda carregar as fontes e DOM antes de pedir pro sistema abrir a janela de "Salvar como PDF"
  setTimeout(() => {
    printWindow.print();
    printWindow.close();
  }, 700);
};
