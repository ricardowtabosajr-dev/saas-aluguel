
import { Reservation } from '../types';

export const handlePrintContract = (res: Reservation) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const today = new Date().toLocaleDateString('pt-BR');
    const valueStr = res.total_value.toLocaleString('pt-BR', { minimumFractionDigits: 2 });
    const depositStr = res.deposit_value.toLocaleString('pt-BR', { minimumFractionDigits: 2 });
    const paymentInfo = res.payment_method === 'parcelado'
        ? "PARCELADO (Entrada na retirada e o restante na devolução)"
        : "À VISTA (Pagamento integral no ato da reserva/retirada)";

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Contrato de Aluguel - ${res.customer?.name}</title>
        <style>
          body { font-family: 'Inter', sans-serif; padding: 40px; color: #1e293b; line-height: 1.6; max-width: 800px; margin: 0 auto; }
          .header { text-align: center; margin-bottom: 40px; border-bottom: 2px solid #e2e8f0; padding-bottom: 20px; }
          .title { font-size: 24px; font-weight: 800; text-transform: uppercase; margin: 0; }
          .section { margin-bottom: 25px; }
          .section-title { font-weight: 800; text-transform: uppercase; font-size: 14px; color: #4f46e5; margin-bottom: 10px; border-bottom: 1px solid #f1f5f9; }
          .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
          .label { font-size: 12px; font-weight: 700; color: #64748b; text-transform: uppercase; }
          .value { font-size: 14px; font-weight: 600; }
          .clauses { font-size: 11px; color: #475569; text-align: justify; }
          .clause-item { margin-bottom: 8px; }
          .signatures { margin-top: 60px; display: grid; grid-template-columns: 1fr 1fr; gap: 40px; text-align: center; }
          .sig-line { border-top: 1px solid #94a3b8; padding-top: 10px; font-size: 12px; font-weight: 700; }
          .payment-box { background: #f8fafc; border: 1px solid #e2e8f0; padding: 15px; border-radius: 8px; margin-top: 10px; }
          @media print { .no-print { display: none; } body { padding: 0; } }
        </style>
      </head>
      <body>
        <div class="header">
          <h1 class="title">Contrato de Locação de Trajes</h1>
          <p style="font-size: 12px; font-weight: 600; color: #64748b;">Reserva: #${res.id.substring(0, 8).toUpperCase()} | Data: ${today}</p>
        </div>

        <div class="section">
          <div class="section-title">1. Partes</div>
          <div class="grid">
            <div>
              <div class="label">Locadora</div>
              <div class="value">CLOSET SAAS - GESTÃO DE ALUGUÉIS</div>
            </div>
            <div>
              <div class="label">Locatário(a)</div>
              <div class="value">${res.customer?.name}</div>
              <div class="value">Contato: ${res.customer?.phone || '---'}</div>
            </div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">2. Objeto e Prazos</div>
          <div class="grid">
            <div>
              <div class="label">Item(ns) Alugado(s)</div>
              ${res.clothes?.map(c => `
                <div class="value" style="margin-bottom: 5px; padding: 5px; border-left: 2px solid #e2e8f0;">
                  ${c.name} (${c.category}) - <strong>Tam: ${res.item_sizes?.[c.id] || c.size}</strong>
                </div>
              `).join('')}
            </div>
            <div>
              <div class="label">Período de Locação</div>
              <div class="value">De: ${new Date(res.start_date).toLocaleDateString('pt-BR')}</div>
              <div class="value">Até: ${new Date(res.end_date).toLocaleDateString('pt-BR')}</div>
            </div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">3. Valores e Caução</div>
          <div class="grid">
            <div>
              <div class="label">Valor Total do Aluguel</div>
              <div class="value">R$ ${valueStr}</div>
              <div class="label" style="font-size: 10px; margin-top: 5px;">Forma de Pagamento:</div>
              <div class="value" style="font-size: 12px; color: #4f46e5;">${paymentInfo}</div>
            </div>
            <div>
              <div class="label">Valor Caução (Garantia)</div>
              <div class="value">R$ ${depositStr}</div>
            </div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">4. Cláusulas e Condições Gerais (Normas Vigentes)</div>
          <div class="clauses">
            <div class="clause-item"><strong>4.1. ESTADO DO TRAJE:</strong> O Locatário declara receber o traje em perfeitas condições de uso, conservação e limpeza, obrigando-se a devolvê-lo no mesmo estado sob pena de arcar com custos de manutenção.</div>
            <div class="clause-item"><strong>4.2. DEVOLUÇÃO E ATRASO:</strong> A devolução deverá ocorrer na data aprazada. O atraso injustificado implicará em multa de 10% sobre o valor da locação por cada dia de atraso, acrescido de juros moratórios.</div>
            <div class="clause-item"><strong>4.3. DANOS E EXTRAVIO:</strong> Conforme normas de locação, danos como rasgos, manchas permanentes ou queimaduras serão cobrados do Locatário através do caução ou cobrança complementar se o dano exceder a garantia.</div>
            <div class="clause-item"><strong>4.4. HIGIENE:</strong> A lavagem técnica é de responsabilidade exclusiva da Locadora. O Locatário NÃO deve efetuar qualquer tipo de lavagem ou ajuste por conta própria.</div>
            <div class="clause-item"><strong>4.5. CANCELAMENTO:</strong> Reservas canceladas com menos de 7 dias úteis não terão direito a reembolso do sinal de reserva, conforme política de vacância.</div>
            <div class="clause-item"><strong>4.6. RESPONSABILIDADE:</strong> O Locatário assume total responsabilidade civil e criminal pelo uso e posse do bem locado durante o período descrito neste contrato.</div>
          </div>
        </div>

        <div class="signatures">
          <div>
            <div class="sig-line">CLOSET SAAS (Locadora)</div>
          </div>
          <div>
            <div class="sig-line">${res.customer?.name} (Locatário)</div>
          </div>
        </div>

        <script>
          window.onload = () => { 
            window.print();
            setTimeout(() => { window.close(); }, 500);
          };
        </script>
      </body>
      </html>
    `;
    printWindow.document.write(html);
    printWindow.document.close();
};

export const handlePrintReceipt = (res: Reservation) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const today = new Date().toLocaleDateString('pt-BR');
    const totalValue = res.total_value;
    const amountPaid = res.amount_paid || 0;
    const remainingBalance = Math.max(0, totalValue - amountPaid);

    const fmt = (v: number) => v.toLocaleString('pt-BR', { minimumFractionDigits: 2, style: 'currency', currency: 'BRL' });

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Recibo Finaceiro - ${res.customer?.name}</title>
        <style>
          body { font-family: 'Courier New', Courier, monospace; padding: 40px; color: #000; max-width: 600px; margin: 0 auto; background: #fff; }
          .receipt-box { border: 2px dashed #000; padding: 30px; position: relative; }
          .header { text-align: center; margin-bottom: 30px; border-bottom: 1px dashed #000; padding-bottom: 20px; }
          .title { font-size: 24px; font-weight: 900; text-transform: uppercase; margin: 0; letter-spacing: 2px; }
          .subtitle { font-size: 14px; margin-top: 5px; }
          .row { display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 14px; }
          .total-row { margin-top: 20px; border-top: 1px dashed #000; pt-4; font-weight: bold; font-size: 18px; padding-top: 15px; }
          .highlight { background: #eee; padding: 2px 5px; }
          .status-paid { color: green; border: 2px solid green; padding: 5px 10px; transform: rotate(-5deg); position: absolute; top: 20px; right: 20px; font-weight: bold; font-size: 20px; opacity: 0.8; }
          .status-pending { color: red; border: 2px solid red; padding: 5px 10px; transform: rotate(-5deg); position: absolute; top: 20px; right: 20px; font-weight: bold; font-size: 20px; opacity: 0.8; }
          .footer { margin-top: 40px; text-align: center; font-size: 10px; }
          .watermark { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); opacity: 0.05; font-size: 100px; z-index: 0; pointer-events: none; }
        </style>
      </head>
      <body>
        <div class="receipt-box">
          <div class="watermark">RECIBO</div>
          ${remainingBalance <= 0 ? '<div class="status-paid">QUITADO</div>' : '<div class="status-pending">PENDENTE</div>'}
          
          <div class="header">
            <h1 class="title">RECIBO</h1>
            <div class="subtitle">#${res.id ? res.id.substring(0, 8).toUpperCase() : '---'}</div>
            <div class="subtitle">${today}</div>
          </div>

          <div class="row">
            <strong>CLIENTE:</strong>
            <span>${res.customer?.name}</span>
          </div>
          <div class="row">
            <strong>DOCUMENTO:</strong>
            <span>${res.customer?.document || '---'}</span>
          </div>
          <div class="row" style="margin-bottom: 20px;">
            <strong>PERÍODO LOCAÇÃO:</strong>
            <span>${new Date(res.start_date).toLocaleDateString('pt-BR')} a ${new Date(res.end_date).toLocaleDateString('pt-BR')}</span>
          </div>

          <div style="margin-bottom: 20px; border: 1px solid #ccc; padding: 10px;">
             <div style="font-weight: bold; border-bottom: 1px solid #ccc; margin-bottom: 10px;">ITENS DO PACOTE</div>
             ${res.clothes?.map(c => `
               <div class="row" style="margin-bottom: 5px; font-size: 12px;">
                 <span>${c.name} (${c.category}) | Tam: ${res.item_sizes?.[c.id] || c.size}</span>
                 <span>${fmt(c.rental_value)}</span>
               </div>
             `).join('')}
          </div>

          <div class="row">
             <span>Valor Total do Contrato:</span>
             <strong>${fmt(totalValue)}</strong>
          </div>
          
          <div class="row">
             <span>Valor Pago (Sinal/Entrada):</span>
             <strong>${fmt(amountPaid)}</strong>
          </div>

          <div class="row total-row">
             <span>RESTANTE A PAGAR:</span>
             <span class="highlight">${fmt(remainingBalance)}</span>
          </div>
          
          <div class="row" style="margin-top: 10px; font-size: 12px; color: #666;">
             <span>Modalidade de Pagamento:</span>
             <span style="text-transform: uppercase;">${res.payment_method || 'À Vista'}</span>
          </div>

          <div class="footer">
            <p>__________________________________________</p>
            <p>Assinatura Responsável</p>
            <br/>
            <p>Este documento não substitui nota fiscal.</p>
          </div>
        </div>
        <script>window.print(); window.onafterprint = function(){ window.close(); }</script>
      </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
};
