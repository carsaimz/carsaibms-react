import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api, ApiClientError } from '../../lib/api';
import { useAuthStore } from '../../store/auth';
import { Input } from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { isNative } from '../../lib/native/capacitor';
import { signInWithGoogleNative, setAnalyticsUserId, crashlyticsSetUser, logEvent } from '../../lib/native/firebase-native';

export default function Login() {
  const navigate = useNavigate();
  const setToken = useAuthStore((s) => s.setToken);
  const setUser = useAuthStore((s) => s.setUser);

  const [email, setEmail] = useState('cliente@carsai.co.mz');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  async function afterLogin(data: { token: string; user: any }) {
    setToken(data.token);
    setUser(data.user);
    setAnalyticsUserId(String(data.user.id));
    crashlyticsSetUser(String(data.user.id));
    logEvent('login', { method: 'password' });
    navigate('/');
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await api.post<{ data: { token: string; user: any } }>(
        '/auth/login',
        { email, password },
        { skipAuth: true }
      );
      await afterLogin(res.data);
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Erro ao iniciar sessão.');
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleLogin() {
    setError(null);
    setGoogleLoading(true);
    try {
      const googleUser = await signInWithGoogleNative();
      if (!googleUser) { setGoogleLoading(false); return; }

      // Exchange the Firebase ID token for our own access/refresh tokens
      const res = await api.post<{ data: { token: string; user: any } }>(
        '/auth/google',
        {
          id_token: (googleUser as any).idToken,
          name: googleUser.displayName,
          email: googleUser.email,
          photo_url: googleUser.photoUrl,
        },
        { skipAuth: true }
      );
      await afterLogin(res.data);
      logEvent('login', { method: 'google' });
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Erro ao entrar com Google.');
    } finally {
      setGoogleLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <h2 className="text-lg font-bold">Entrar na conta</h2>

      <Input
        label="Email"
        type="email"
        name="email"
        autoComplete="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <Input
        label="Senha"
        type="password"
        name="password"
        autoComplete="current-password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />

      {error && <p className="text-sm text-red-500">{error}</p>}

      <Button type="submit" loading={loading} className="w-full">
        Entrar
      </Button>

      {isNative && (
        <>
          <div className="flex items-center gap-3 text-xs text-gray-400">
            <div className="h-px flex-1 bg-gray-200 dark:bg-slate-700" />
            ou
            <div className="h-px flex-1 bg-gray-200 dark:bg-slate-700" />
          </div>
          <Button
            type="button"
            variant="secondary"
            loading={googleLoading}
            onClick={handleGoogleLogin}
            className="w-full"
          >
            Continuar com Google
          </Button>
        </>
      )}

      <p className="text-center text-sm text-gray-500 dark:text-slate-400">
        Não tem conta?{' '}
        <Link to="/register" className="font-semibold text-primary-600 hover:underline">
          Registar
        </Link>
      </p>

      <p className="text-center text-xs text-gray-400">
        Demo: cliente@carsai.co.mz / password
      </p>
    </form>
  );
}
