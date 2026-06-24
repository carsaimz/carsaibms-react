import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Save, KeyRound } from 'lucide-react';
import { api, ApiClientError } from '../../lib/api';
import { useAuthStore } from '../../store/auth';
import { Card, CardBody, CardHeader, CardTitle } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Avatar from '../../components/shared/Avatar';
import Spinner from '../../components/ui/Spinner';

export default function StaffProfile() {
  const user = useAuthStore(s => s.user);
  const setUser = useAuthStore(s => s.setUser);
  const [form, setForm] = useState({ name: user?.name || '' });
  const [pwd, setPwd] = useState({ current: '', new: '' });
  const [msg, setMsg] = useState('');
  const [pwdMsg, setPwdMsg] = useState('');

  const save = useMutation({
    mutationFn: () => api.put('/customer/profile', form),
    onSuccess: () => {
      if (user) setUser({ ...user, name: form.name });
      setMsg('Guardado!'); setTimeout(() => setMsg(''), 3000);
    },
  });
  const changePwd = useMutation({
    mutationFn: () => api.put('/customer/password', { current_password: pwd.current, new_password: pwd.new }),
    onSuccess: () => { setPwdMsg('Senha alterada!'); setPwd({ current: '', new: '' }); setTimeout(() => setPwdMsg(''), 3000); },
    onError: (err) => setPwdMsg(err instanceof ApiClientError ? err.message : 'Erro'),
  });

  return (
    <div className="flex flex-col gap-6 max-w-lg">
      <div className="flex items-center gap-4">
        <Avatar name={user?.name} size="lg" />
        <div><h1 className="text-xl font-bold">{user?.name}</h1><p className="text-sm text-gray-500 capitalize">{user?.role} · {user?.email}</p></div>
      </div>
      <Card>
        <CardHeader><CardTitle>Dados Pessoais</CardTitle></CardHeader>
        <CardBody>
          <form onSubmit={e => { e.preventDefault(); save.mutate(); }} className="flex flex-col gap-4">
            <Input label="Nome" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
            <Input label="Email" value={user?.email || ''} disabled />
            <div className="flex items-center gap-3">
              <Button type="submit" icon={<Save className="h-4 w-4" />} loading={save.isPending}>Guardar</Button>
              {msg && <span className="text-sm text-green-600">{msg}</span>}
            </div>
          </form>
        </CardBody>
      </Card>
      <Card>
        <CardHeader><CardTitle>Alterar Senha</CardTitle></CardHeader>
        <CardBody>
          <form onSubmit={e => { e.preventDefault(); changePwd.mutate(); }} className="flex flex-col gap-4">
            <Input label="Senha actual" type="password" value={pwd.current} onChange={e => setPwd(p => ({ ...p, current: e.target.value }))} required />
            <Input label="Nova senha" type="password" value={pwd.new} onChange={e => setPwd(p => ({ ...p, new: e.target.value }))} required minLength={6} />
            <div className="flex items-center gap-3">
              <Button type="submit" variant="secondary" icon={<KeyRound className="h-4 w-4" />} loading={changePwd.isPending}>Alterar</Button>
              {pwdMsg && <span className={`text-sm ${pwdMsg.includes('Erro') ? 'text-red-500' : 'text-green-600'}`}>{pwdMsg}</span>}
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}
