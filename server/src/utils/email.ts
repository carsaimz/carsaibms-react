import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.mailtrap.io',
  port: Number(process.env.SMTP_PORT || 2525),
  auth: {
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
  },
});

const FROM = process.env.MAIL_FROM || `"${process.env.COMPANY_NAME || 'Carsai BMS'}" <noreply@carsai.co.mz>`;
const COMPANY = process.env.COMPANY_NAME || 'Carsai BMS';

function html(title: string, body: string): string {
  return `<!DOCTYPE html><html><body style="font-family:Arial,sans-serif;background:#f8fafc;padding:32px">
  <div style="max-width:560px;margin:0 auto;background:#fff;border-radius:12px;padding:32px;box-shadow:0 1px 4px rgba(0,0,0,.08)">
    <h1 style="font-size:20px;color:#1e40af;margin:0 0 16px">${COMPANY}</h1>
    <h2 style="font-size:16px;color:#111827;margin:0 0 12px">${title}</h2>
    ${body}
    <hr style="margin:24px 0;border:none;border-top:1px solid #e5e7eb">
    <p style="font-size:12px;color:#9ca3af">© ${new Date().getFullYear()} ${COMPANY}</p>
  </div></body></html>`;
}

export async function sendOrderConfirmation(to: string, name: string, orderNumber: string, total: string) {
  await transporter.sendMail({
    from: FROM, to,
    subject: `Pedido ${orderNumber} confirmado — ${COMPANY}`,
    html: html('Pedido Confirmado!', `
      <p style="color:#374151">Olá <strong>${name}</strong>,</p>
      <p style="color:#374151">O seu pedido <strong>${orderNumber}</strong> foi recebido com sucesso.</p>
      <div style="background:#f0fdf4;border-radius:8px;padding:16px;margin:16px 0">
        <p style="margin:0;font-size:18px;font-weight:bold;color:#15803d">Total: ${total}</p>
      </div>
      <p style="color:#374151">Irá receber uma actualização quando o pedido for processado.</p>
    `),
  });
}

export async function sendPaymentConfirmation(to: string, name: string, orderNumber: string, method: string, total: string) {
  await transporter.sendMail({
    from: FROM, to,
    subject: `Pagamento recebido — ${orderNumber}`,
    html: html('Pagamento Confirmado!', `
      <p style="color:#374151">Olá <strong>${name}</strong>,</p>
      <p style="color:#374151">Recebemos o pagamento do pedido <strong>${orderNumber}</strong> via <strong>${method}</strong>.</p>
      <div style="background:#eff6ff;border-radius:8px;padding:16px;margin:16px 0">
        <p style="margin:0;font-size:18px;font-weight:bold;color:#1d4ed8">Total pago: ${total}</p>
      </div>
    `),
  });
}

export async function sendTicketReply(to: string, name: string, ticketNumber: string, preview: string) {
  await transporter.sendMail({
    from: FROM, to,
    subject: `Nova resposta no ticket ${ticketNumber}`,
    html: html('Resposta ao Ticket de Suporte', `
      <p style="color:#374151">Olá <strong>${name}</strong>,</p>
      <p style="color:#374151">Recebeu uma nova resposta no ticket <strong>${ticketNumber}</strong>:</p>
      <blockquote style="border-left:4px solid #2563eb;padding:12px 16px;margin:16px 0;color:#374151;background:#f8fafc">${preview}</blockquote>
    `),
  });
}

export async function sendWelcome(to: string, name: string) {
  await transporter.sendMail({
    from: FROM, to,
    subject: `Bem-vindo ao ${COMPANY}!`,
    html: html('Bem-vindo!', `
      <p style="color:#374151">Olá <strong>${name}</strong>,</p>
      <p style="color:#374151">A sua conta foi criada com sucesso em <strong>${COMPANY}</strong>.</p>
      <p style="color:#374151">Já pode aceder ao portal do cliente para ver os seus pedidos, facturas e suporte.</p>
    `),
  });
}
