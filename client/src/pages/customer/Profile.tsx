import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Save, KeyRound } from 'lucide-react';
import { api, ApiClientError } from '../../lib/api';
import { Card, CardBody, CardHeader, CardTitle } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../store/auth';

interface ProfileData {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  nuit: string | null;
  address: string | null;
  city: string | null;
  country: string | null;
}

export default function Profile() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const setUser = useAuthStore((s) => s.setUser);
  const authUser = useAuthStore((s) => s.user);

  const { data, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: () => api.get<{ data: ProfileData }>('/customer/profile').then((r) => r.data),
  });

  const [form, setForm] = useState<Partial<ProfileData>>({});
  const [savedMsg, setSavedMsg] = useState<string | null>(null);

  useEffect(() => {
    if (data) setForm(data);
  }, [data]);

  const updateProfile = useMutation({
    mutationFn: (payload: Partial<ProfileData>) => api.put('/customer/profile', payload),
    onSuccess: () => {
      setSavedMsg('Perfil actualizado com sucesso.');
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      if (authUser && form.name) setUser({ ...authUser, name: form.name, phone: form.phone ?? authUser.phone });
      setTimeout(() => setSavedMsg(null), 3000);
    },
  });

  function update<K extends keyof ProfileData>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    updateProfile.mutate({
      name: form.name,
      phone: form.phone || undefined,
      company: form.company || undefined,
      nuit: form.nuit || undefined,
      address: form.address || undefined,
      city: form.city || undefined,
    });
  }

  if (isLoading) return <Spinner />;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold">Perfil</h1>
        <p className="text-sm text-gray-500 dark:text-slate-400">Gerir os seus dados pessoais</p>
      </div>

      <Card>
        <CardHeader><CardTitle>Dados Pessoais</CardTitle></CardHeader>
        <CardBody>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input label="Nome" value={form.name || ''} onChange={(e) => update('name', e.target.value)} required />
            <Input label="Email" value={form.email || ''} disabled />
            <Input label="Telemóvel" value={form.phone || ''} onChange={(e) => update('phone', e.target.value)} placeholder="258840000000" />
            <Input label={t('profile_company')} value={form.company || ''} onChange={(e) => update('company', e.target.value)} />
            <Input label={t('profile_nuit')} value={form.nuit || ''} onChange={(e) => update('nuit', e.target.value)} />
            <Input label={t('profile_city')} value={form.city || ''} onChange={(e) => update('city', e.target.value)} />
            <div className="sm:col-span-2">
              <Input label={t('profile_address')} value={form.address || ''} onChange={(e) => update('address', e.target.value)} />
            </div>

            <div className="sm:col-span-2 flex items-center gap-3">
              <Button type="submit" icon={<Save className="h-4 w-4" />} loading={updateProfile.isPending}>
                Guardar
              </Button>
              {savedMsg && <span className="text-sm text-green-600">{savedMsg}</span>}
              {updateProfile.isError && (
                <span className="text-sm text-red-500">
                  {updateProfile.error instanceof ApiClientError ? updateProfile.error.message : 'Erro ao guardar.'}
                </span>
              )}
            </div>
          </form>
        </CardBody>
      </Card>

      <ChangePasswordCard />
    </div>
  );
}

function ChangePasswordCard() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [msg, setMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const changePassword = useMutation({
    mutationFn: () => api.put('/customer/password', { current_password: currentPassword, new_password: newPassword }),
    onSuccess: () => {
      setMsg('Senha alterada com sucesso.');
      setError(null);
      setCurrentPassword('');
      setNewPassword('');
      setTimeout(() => setMsg(null), 3000);
    },
    onError: (err) => {
      setError(err instanceof ApiClientError ? err.message : 'Erro ao alterar senha.');
    },
  });

  return (
    <Card>
      <CardHeader><CardTitle>{t('profile_change')}</CardTitle></CardHeader>
      <CardBody>
        <form
          onSubmit={(e) => { e.preventDefault(); changePassword.mutate(); }}
          className="grid grid-cols-1 gap-4 sm:grid-cols-2"
        >
          <Input label={t('profile_current_pwd')} type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required />
          <Input label={t('profile_new_pwd')} type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required minLength={6} />
          <div className="sm:col-span-2 flex items-center gap-3">
            <Button type="submit" variant="secondary" icon={<KeyRound className="h-4 w-4" />} loading={changePassword.isPending}>
              Alterar Senha
            </Button>
            {msg && <span className="text-sm text-green-600">{msg}</span>}
            {error && <span className="text-sm text-red-500">{error}</span>}
          </div>
        </form>
      </CardBody>
    </Card>
  );
}
