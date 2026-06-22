import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { FileQuestion, Send } from 'lucide-react';
import { api, ApiClientError } from '../../lib/api';
import { Card, CardBody, CardHeader, CardTitle } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';

export default function CustomerQuote() {
  const [form, setForm] = useState({ subject:'', items:'', notes:'' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string|null>(null);

  const { data: services } = useQuery({
    queryKey: ['pub-services-quote'],
    queryFn: () => api.get<{ data: any[] }>('/services?per_page=50'),
    staleTime: 120_000,
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setLoading(true); setError(null);
    try {
      await api.post('/customer/quotes', form);
      setSuccess(true);
    } catch(err) { setError(err instanceof ApiClientError ? err.message : 'Erro ao enviar pedido de orçamento.'); }
    finally { setLoading(false); }
  }

  if (success) return (
    <div className="flex flex-col items-center justify-center py-16 text-center gap-4">
      <div className="text-4xl">✅</div>
      <h2 className="text-lg font-bold text-green-700 dark:text-green-400">Pedido de Orçamento Enviado!</h2>
      <p className="text-sm text-gray-500">A nossa equipa entrará em contacto em breve com um orçamento personalizado.</p>
      <Button onClick={() => { setSuccess(false); setForm({ subject:'', items:'', notes:'' }); }}>Novo Pedido</Button>
    </div>
  );

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold flex items-center gap-2"><FileQuestion className="h-5 w-5 text-primary-600" /> Pedir Orçamento</h1>
        <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">Solicite um orçamento personalizado para produtos ou serviços.</p>
      </div>
      {services?.data && services.data.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Serviços Disponíveis</CardTitle></CardHeader>
          <CardBody className="grid gap-2 sm:grid-cols-2">
            {services.data.map((s: any) => (
              <div key={s.id} className="flex items-center justify-between rounded-lg border border-gray-100 p-3 dark:border-slate-700">
                <span className="text-sm font-medium">{s.sname || s.name}</span>
                <span className="text-sm font-bold text-primary-600">A partir de MT {(s.price||0).toFixed(2)}</span>
              </div>
            ))}
          </CardBody>
        </Card>
      )}
      <Card>
        <CardHeader><CardTitle>Formulário de Orçamento</CardTitle></CardHeader>
        <CardBody>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input label="Assunto / Referência" value={form.subject} onChange={(e)=>setForm(f=>({...f,subject:e.target.value}))} placeholder="Ex: Orçamento para 50 unidades de Produto X" required />
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700 dark:text-slate-300">Itens / Produtos / Serviços</label>
              <textarea rows={5} value={form.items} onChange={(e)=>setForm(f=>({...f,items:e.target.value}))}
                placeholder="Descreva os produtos ou serviços que precisa, com quantidades se possível..."
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-900" required />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700 dark:text-slate-300">Notas adicionais (opcional)</label>
              <textarea rows={3} value={form.notes} onChange={(e)=>setForm(f=>({...f,notes:e.target.value}))}
                placeholder="Prazo de entrega, condições especiais, etc."
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-900" />
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <Button type="submit" loading={loading} icon={<Send className="h-4 w-4" />}>Enviar Pedido de Orçamento</Button>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}
