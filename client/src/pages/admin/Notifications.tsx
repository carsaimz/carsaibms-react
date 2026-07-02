import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Bell, CheckCheck, Trash2, Plus } from 'lucide-react';
import { useState } from 'react';
import { api, ApiClientError } from '../../lib/api';
import { Card, CardBody } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import Spinner from '../../components/ui/Spinner';
import { formatDateTime } from '../../lib/format';
import { useTranslation } from 'react-i18next';

export default function AdminNotifications() {
  const { t } = useTranslation();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title:'', body:'', user_id:'' });
  const [saving, setSaving] = useState(false);
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-notifications'],
    queryFn: () => api.get<{ data: any[] }>('/admin/notifications'),
  });

  async function handleSend(e: React.FormEvent) {
    e.preventDefault(); setSaving(true);
    try {
      await api.post('/admin/notifications', form);
      qc.invalidateQueries({ queryKey: ['admin-notifications'] });
      setShowForm(false); setForm({ title:'', body:'', user_id:'' });
    } catch(err) { alert(err instanceof ApiClientError ? err.message : 'Erro'); }
    finally { setSaving(false); }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-xl font-bold">Notificações</h1>
        <Button size="sm" icon={<Plus className="h-4 w-4" />} onClick={() => setShowForm(v=>!v)}>Enviar Notificação</Button>
      </div>
      {showForm && (
        <Card><CardBody>
          <form onSubmit={handleSend} className="flex flex-col gap-3">
            <Input label="Título" value={form.title} onChange={(e)=>setForm(f=>({...f,title:e.target.value}))} required />
            <Input label="Mensagem" value={form.body} onChange={(e)=>setForm(f=>({...f,body:e.target.value}))} />
            <Input label="ID do utilizador (deixar vazio = todos)" type="number" value={form.user_id} onChange={(e)=>setForm(f=>({...f,user_id:e.target.value}))} />
            <div className="flex justify-end gap-2">
              <Button variant="secondary" type="button" onClick={()=>setShowForm(false)}>Cancelar</Button>
              <Button type="submit" loading={saving}>Enviar</Button>
            </div>
          </form>
        </CardBody></Card>
      )}
      {isLoading ? <Spinner /> : (
        <Card><CardBody className="p-0">
          <div className="divide-y divide-gray-50 dark:divide-slate-800">
            {(data?.data??[]).length===0 && <p className="py-8 text-center text-sm text-gray-400">Sem notificações.</p>}
            {(data?.data??[]).map((n:any) => (
              <div key={n.id} className={`flex items-start gap-3 px-4 py-3 ${!n.is_read?'bg-blue-50/50 dark:bg-blue-900/10':''}`}>
                <Bell className={`h-4 w-4 mt-0.5 flex-shrink-0 ${!n.is_read?'text-blue-500':'text-gray-300'}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold">{n.title}</p>
                  {n.body && <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">{n.body}</p>}
                  <p className="text-[10px] text-gray-400 mt-1">{formatDateTime(n.created_at)}</p>
                </div>
                {!n.is_read && <span className="h-2 w-2 rounded-full bg-blue-500 flex-shrink-0 mt-1.5" />}
              </div>
            ))}
          </div>
        </CardBody></Card>
      )}
    </div>
  );
}
