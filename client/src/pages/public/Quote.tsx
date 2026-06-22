import { useState } from 'react';
import { FileQuestion, Send, CheckCircle } from 'lucide-react';
import { api, ApiClientError } from '../../lib/api';
import { Input } from '../../components/ui/Input';
import Button from '../../components/ui/Button';

export default function PublicQuote() {
  const [form, setForm] = useState({ name:'', email:'', phone:'', subject:'', items:'', notes:'' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string|null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setLoading(true); setError(null);
    try {
      await api.post('/contact', { ...form, message: `ORÇAMENTO:\n${form.items}\n\nNotas: ${form.notes}` }, { skipAuth: true });
      setSuccess(true);
    } catch(err) { setError(err instanceof ApiClientError ? err.message : 'Erro ao enviar.'); }
    finally { setLoading(false); }
  }

  if (success) return (
    <div className="mx-auto max-w-lg px-4 py-20 text-center">
      <CheckCircle className="mx-auto mb-4 h-16 w-16 text-green-500" />
      <h2 className="text-2xl font-black text-green-700 dark:text-green-400">Pedido Enviado!</h2>
      <p className="mt-3 text-gray-500">Entraremos em contacto em breve com o seu orçamento.</p>
      <button onClick={() => setSuccess(false)} className="mt-6 text-sm font-semibold text-primary-600 hover:underline">Enviar outro pedido</button>
    </div>
  );

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 md:px-6">
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-100 dark:bg-primary-900/40">
          <FileQuestion className="h-7 w-7 text-primary-600" />
        </div>
        <h1 className="text-3xl font-black">Pedir Orçamento</h1>
        <p className="mt-2 text-gray-500 dark:text-slate-400">Preencha o formulário e receberá uma proposta personalizada.</p>
      </div>
      <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-800">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Nome completo" value={form.name} onChange={(e)=>setForm(f=>({...f,name:e.target.value}))} required />
            <Input label="Email" type="email" value={form.email} onChange={(e)=>setForm(f=>({...f,email:e.target.value}))} required />
          </div>
          <Input label="Telefone (opcional)" value={form.phone} onChange={(e)=>setForm(f=>({...f,phone:e.target.value}))} placeholder="+258 84 000 0000" />
          <Input label="Assunto" value={form.subject} onChange={(e)=>setForm(f=>({...f,subject:e.target.value}))} required />
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700 dark:text-slate-300">Produtos / Serviços e Quantidades</label>
            <textarea rows={5} value={form.items} onChange={(e)=>setForm(f=>({...f,items:e.target.value}))}
              placeholder="Descreva o que precisa com o máximo de detalhe possível..."
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-primary-500 dark:border-slate-600 dark:bg-slate-900" required />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700 dark:text-slate-300">Observações (opcional)</label>
            <textarea rows={3} value={form.notes} onChange={(e)=>setForm(f=>({...f,notes:e.target.value}))}
              placeholder="Prazo de entrega, condições especiais..."
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-primary-500 dark:border-slate-600 dark:bg-slate-900" />
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <Button type="submit" loading={loading} icon={<Send className="h-4 w-4" />} className="w-full">Enviar Pedido de Orçamento</Button>
        </form>
      </div>
    </div>
  );
}
