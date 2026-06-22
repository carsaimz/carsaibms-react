import { useState } from 'react';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import { api, ApiClientError } from '../../lib/api';
import { Input } from '../../components/ui/Input';
import Button from '../../components/ui/Button';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function update(key: string, val: string) { setForm((f) => ({ ...f, [key]: val })); }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setLoading(true); setError(null);
    try {
      await api.post('/contact', form, { skipAuth: true });
      setSuccess(true);
      setForm({ name: '', email: '', phone: '', subject: '', message: '' });
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Erro ao enviar. Tente novamente.');
    } finally { setLoading(false); }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 md:px-6">
      <div className="mb-12 text-center">
        <h1 className="text-3xl font-black">Contacte-nos</h1>
        <p className="mt-3 text-gray-500 dark:text-slate-400">Estamos disponíveis para ajudar o seu negócio</p>
      </div>

      <div className="grid gap-12 md:grid-cols-2">
        {/* Info */}
        <div>
          <h2 className="mb-6 text-xl font-bold">Informações de Contacto</h2>
          {[
            { icon: Mail,    label: 'Email',    value: 'info@carsai.co.mz' },
            { icon: Phone,   label: 'Telefone', value: '+258 84 000 0000' },
            { icon: MapPin,  label: 'Morada',   value: 'Maputo, Moçambique' },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="mb-5 flex items-start gap-4">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-primary-100 dark:bg-primary-900/40">
                <Icon className="h-5 w-5 text-primary-600" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-gray-400">{label}</p>
                <p className="mt-0.5 font-semibold">{value}</p>
              </div>
            </div>
          ))}

          <div className="mt-8 rounded-2xl bg-primary-50 p-6 dark:bg-primary-900/20">
            <h3 className="font-bold text-primary-800 dark:text-primary-300">Horário de Atendimento</h3>
            <p className="mt-2 text-sm text-primary-700 dark:text-primary-400">Segunda a Sexta: 8h00 – 17h00</p>
            <p className="text-sm text-primary-700 dark:text-primary-400">Sábado: 8h00 – 12h00</p>
          </div>
        </div>

        {/* Form */}
        <div>
          {success ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-green-200 bg-green-50 p-10 text-center dark:border-green-800/40 dark:bg-green-900/20">
              <div className="mb-3 text-4xl">✅</div>
              <h3 className="text-lg font-bold text-green-700 dark:text-green-300">Mensagem enviada!</h3>
              <p className="mt-2 text-sm text-green-600 dark:text-green-400">Entraremos em contacto em breve.</p>
              <button onClick={() => setSuccess(false)} className="mt-4 text-sm font-semibold text-green-700 hover:underline">Enviar outra mensagem</button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Input label="Nome" name="name" value={form.name} onChange={(e) => update('name', e.target.value)} required />
                <Input label="Email" type="email" name="email" value={form.email} onChange={(e) => update('email', e.target.value)} required />
              </div>
              <Input label="Telefone (opcional)" name="phone" value={form.phone} onChange={(e) => update('phone', e.target.value)} placeholder="+258 84 000 0000" />
              <Input label="Assunto" name="subject" value={form.subject} onChange={(e) => update('subject', e.target.value)} required />
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700 dark:text-slate-300">Mensagem</label>
                <textarea name="message" rows={5} value={form.message} onChange={(e) => update('message', e.target.value)}
                  className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-primary-500 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
                  required />
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
              <Button type="submit" loading={loading} icon={<Send className="h-4 w-4" />} className="w-full">
                Enviar Mensagem
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
