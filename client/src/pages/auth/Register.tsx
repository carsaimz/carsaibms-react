import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api, ApiClientError } from '../../lib/api';
import { useAuthStore } from '../../store/auth';
import { Input } from '../../components/ui/Input';
import Button from '../../components/ui/Button';

export default function Register() {
  const navigate = useNavigate();
  const setToken = useAuthStore((s) => s.setToken);
  const setUser = useAuthStore((s) => s.setUser);

  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(false);

  function update(key: keyof typeof form, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setFieldErrors({});
    setLoading(true);
    try {
      const res = await api.post<{ data: { token: string; user: any } }>(
        '/auth/register',
        form,
        { skipAuth: true }
      );
      setToken(res.data.token);
      setUser(res.data.user);
      navigate('/');
    } catch (err) {
      if (err instanceof ApiClientError) {
        setError(err.message);
        if (err.errors) setFieldErrors(err.errors);
      } else {
        setError('Erro ao criar conta.');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <h2 className="text-lg font-bold">Criar conta</h2>

      <Input
        label="Nome completo"
        name="name"
        value={form.name}
        onChange={(e) => update('name', e.target.value)}
        error={fieldErrors.name?.[0]}
        required
      />
      <Input
        label="Email"
        type="email"
        name="email"
        value={form.email}
        onChange={(e) => update('email', e.target.value)}
        error={fieldErrors.email?.[0]}
        required
      />
      <Input
        label="Telemóvel (opcional)"
        name="phone"
        value={form.phone}
        onChange={(e) => update('phone', e.target.value)}
        placeholder="258840000000"
      />
      <Input
        label="Senha"
        type="password"
        name="password"
        value={form.password}
        onChange={(e) => update('password', e.target.value)}
        error={fieldErrors.password?.[0]}
        minLength={6}
        required
      />

      {error && <p className="text-sm text-red-500">{error}</p>}

      <Button type="submit" loading={loading} className="w-full">
        Criar conta
      </Button>

      <p className="text-center text-sm text-gray-500 dark:text-slate-400">
        Já tem conta?{' '}
        <Link to="/login" className="font-semibold text-primary-600 hover:underline">
          Entrar
        </Link>
      </p>
    </form>
  );
}
