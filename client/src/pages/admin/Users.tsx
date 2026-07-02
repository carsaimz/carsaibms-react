import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, UserCheck, UserX, Plus } from 'lucide-react';
import { api, ApiClientError } from '../../lib/api';
import { Card, CardBody } from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import Spinner from '../../components/ui/Spinner';
import Avatar from '../../components/shared/Avatar';
import { formatDate } from '../../lib/format';
import { useTranslation } from 'react-i18next';

const ROLES = ['admin','manager','seller','staff','customer'];

export default function AdminUsers() {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name:'', email:'', password:'', role:'staff' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string|null>(null);
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-users', search, page],
    queryFn: () => api.get<{ data: any[]; meta: any }>(`/admin/users?page=${page}&search=${encodeURIComponent(search)}`),
  });

  const toggleActive = useMutation({
    mutationFn: ({ id, is_active }: { id: number; is_active: boolean }) =>
      api.put(`/admin/users/${id}/active`, { is_active }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-users'] }),
  });

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault(); setSaving(true); setError(null);
    try {
      await api.post('/admin/users', form);
      qc.invalidateQueries({ queryKey: ['admin-users'] });
      setShowForm(false); setForm({ name:'', email:'', password:'', role:'staff' });
    } catch(err) { setError(err instanceof ApiClientError ? err.message : 'Erro'); }
    finally { setSaving(false); }
  }

  const ROLE_COLORS: Record<string,any> = { admin:'danger', manager:'warning', seller:'info', staff:'default', customer:'success' };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-xl font-bold">Utilizadores</h1>
        <Button size="sm" icon={<Plus className="h-4 w-4" />} onClick={() => setShowForm(v=>!v)}>Novo Utilizador</Button>
      </div>
      {showForm && (
        <Card><CardBody>
          <form onSubmit={handleCreate} className="grid grid-cols-2 gap-3">
            <div className="col-span-2"><Input label="Nome" value={form.name} onChange={(e)=>setForm(f=>({...f,name:e.target.value}))} required /></div>
            <Input label="Email" type="email" value={form.email} onChange={(e)=>setForm(f=>({...f,email:e.target.value}))} required />
            <Input label="Senha" type="password" value={form.password} onChange={(e)=>setForm(f=>({...f,password:e.target.value}))} required minLength={6} />
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700 dark:text-slate-300">Role</label>
              <select value={form.role} onChange={(e)=>setForm(f=>({...f,role:e.target.value}))} className="rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-900">
                {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            {error && <p className="col-span-2 text-sm text-red-500">{error}</p>}
            <div className="col-span-2 flex justify-end gap-2">
              <Button variant="secondary" type="button" onClick={()=>setShowForm(false)}>Cancelar</Button>
              <Button type="submit" loading={saving}>Criar</Button>
            </div>
          </form>
        </CardBody></Card>
      )}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
        <input className="w-full rounded-lg border border-gray-300 py-2 pl-9 pr-4 text-sm dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
          placeholder="Pesquisar..." value={search} onChange={(e)=>{ setSearch(e.target.value); setPage(1); }} />
      </div>
      {isLoading ? <Spinner /> : (
        <Card><CardBody className="p-0">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-gray-100 bg-gray-50 text-xs font-semibold uppercase text-gray-500 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-400">
              <th className="px-4 py-3 text-left">Utilizador</th><th className="px-4 py-3 text-left">Role</th><th className="px-4 py-3 text-left">Último Acesso</th><th className="px-4 py-3 text-left">Estado</th><th className="px-4 py-3"></th>
            </tr></thead>
            <tbody className="divide-y divide-gray-50 dark:divide-slate-800">
              {(data?.data??[]).map((u:any) => (
                <tr key={u.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/40">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar name={u.name} size="sm" />
                      <div><p className="font-semibold">{u.name}</p><p className="text-xs text-gray-400">{u.email}</p></div>
                    </div>
                  </td>
                  <td className="px-4 py-3"><Badge variant={ROLE_COLORS[u.role]||'default'}>{u.role}</Badge></td>
                  <td className="px-4 py-3 text-xs text-gray-400">{u.last_login_at?formatDate(u.last_login_at):'Nunca'}</td>
                  <td className="px-4 py-3"><Badge variant={u.is_active?'success':'danger'}>{u.is_active?'Activo':'Inactivo'}</Badge></td>
                  <td className="px-4 py-3">
                    <button onClick={()=>toggleActive.mutate({id:u.id,is_active:!u.is_active})} className="rounded p-1.5 text-gray-400 hover:bg-gray-100">
                      {u.is_active?<UserX className="h-4 w-4 text-red-400"/>:<UserCheck className="h-4 w-4 text-green-500"/>}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardBody></Card>
      )}
      {data && data.meta?.last_page > 1 && (
        <div className="flex justify-center gap-1">
          {Array.from({length:data.meta.last_page},(_,i)=>i+1).map(p=>(
            <button key={p} onClick={()=>setPage(p)} className={`h-8 min-w-[2rem] rounded-lg px-2 text-sm font-semibold ${p===page?'bg-primary-600 text-white':'bg-gray-100 dark:bg-slate-800'}`}>{p}</button>
          ))}
        </div>
      )}
    </div>
  );
}
