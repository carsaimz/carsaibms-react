import { useState } from 'react';
import { Mail, Send } from 'lucide-react';
import { api, ApiClientError } from '../../lib/api';
import { Card, CardBody, CardHeader, CardTitle } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import Button from '../../components/ui/Button';

const TEMPLATES = [
  { key: 'order_confirmation', label: 'Confirmação de Pedido', vars: ['{{name}}', '{{order_number}}', '{{total}}'] },
  { key: 'payment_confirmation', label: 'Confirmação de Pagamento', vars: ['{{name}}', '{{order_number}}', '{{method}}', '{{total}}'] },
  { key: 'ticket_reply', label: 'Resposta a Ticket', vars: ['{{name}}', '{{ticket_number}}', '{{preview}}'] },
  { key: 'welcome', label: 'Boas-Vindas', vars: ['{{name}}'] },
];

export default function AdminEmails() {
  const [testEmail, setTestEmail] = useState('');
  const [loading, setLoading] = useState<string | null>(null);
  const [msg, setMsg] = useState('');

  async function sendTest(key: string) {
    if (!testEmail) { setMsg('Insira um email de teste.'); return; }
    setLoading(key); setMsg('');
    try {
      await api.post('/admin/emails/test', { template: key, to: testEmail });
      setMsg(`Email de teste "${key}" enviado para ${testEmail}`);
    } catch (err) {
      setMsg(err instanceof ApiClientError ? err.message : 'Erro ao enviar.');
    } finally { setLoading(null); }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Mail className="h-5 w-5 text-primary-600" />
        <h1 className="text-xl font-bold">Templates de Email</h1>
      </div>
      <p className="text-sm text-gray-500 dark:text-slate-400">Templates enviados automaticamente pelo sistema. Configure SMTP nas Definições.</p>

      <div className="max-w-sm">
        <Input label="Email de teste" type="email" value={testEmail} onChange={e => setTestEmail(e.target.value)} placeholder="teste@email.com" />
      </div>
      {msg && <p className={`text-sm ${msg.includes('Erro') ? 'text-red-500' : 'text-green-600'}`}>{msg}</p>}

      <div className="grid gap-4 sm:grid-cols-2">
        {TEMPLATES.map(t => (
          <Card key={t.key}>
            <CardHeader><CardTitle>{t.label}</CardTitle></CardHeader>
            <CardBody className="flex flex-col gap-3">
              <div>
                <p className="text-xs text-gray-500 dark:text-slate-400 mb-1 font-medium">Variáveis disponíveis:</p>
                <div className="flex flex-wrap gap-1">
                  {t.vars.map(v => (
                    <span key={v} className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-xs dark:bg-slate-700">{v}</span>
                  ))}
                </div>
              </div>
              <Button variant="secondary" size="sm" icon={<Send className="h-3.5 w-3.5" />}
                loading={loading === t.key} onClick={() => sendTest(t.key)}>
                Enviar Teste
              </Button>
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  );
}
