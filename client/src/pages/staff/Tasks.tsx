import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, CheckSquare, Circle, X } from 'lucide-react';
import { api, ApiClientError } from '../../lib/api';
import { Card, CardBody, CardHeader, CardTitle } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import { formatDate } from '../../lib/format';

const PRIORITY_COLORS: Record<string, string> = {
  high: 'danger', medium: 'warning', low: 'default',
};
const PRIORITY_LABELS: Record<string, string> = {
  high: 'Alta', medium: 'Média', low: 'Baixa',
};

export default function StaffTasks() {
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState('medium');
  const [deadline, setDeadline] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'done'>('all');
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['staff-tasks'],
    queryFn: () => api.get<{ data: any[] }>('/staff/tasks'),
  });

  const createTask = useMutation({
    mutationFn: (payload: any) => api.post('/staff/tasks', payload),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['staff-tasks'] }); setShowForm(false); setTitle(''); setDeadline(''); },
  });

  const toggleTask = useMutation({
    mutationFn: ({ id, done }: { id: number; done: boolean }) =>
      api.put(`/staff/tasks/${id}`, { is_done: done }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['staff-tasks'] }),
  });

  const deleteTask = useMutation({
    mutationFn: (id: number) => api.delete(`/staff/tasks/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['staff-tasks'] }),
  });

  const tasks = (data?.data ?? []).filter((t: any) => {
    if (filter === 'pending') return !t.is_done;
    if (filter === 'done') return t.is_done;
    return true;
  });

  const pending = data?.data?.filter((t: any) => !t.is_done).length ?? 0;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold">Tarefas</h1>
          <p className="text-sm text-gray-500 dark:text-slate-400">{pending} tarefa(s) pendente(s)</p>
        </div>
        <Button size="sm" icon={<Plus className="h-4 w-4" />} onClick={() => setShowForm((v) => !v)}>
          Nova Tarefa
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardBody>
            <form onSubmit={(e) => { e.preventDefault(); createTask.mutate({ title, priority, deadline: deadline || null }); }}
              className="flex flex-col gap-3">
              <Input label="Título" value={title} onChange={(e) => setTitle(e.target.value)} required />
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-gray-700 dark:text-slate-300">Prioridade</label>
                  <select value={priority} onChange={(e) => setPriority(e.target.value)}
                    className="rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-900">
                    <option value="low">Baixa</option>
                    <option value="medium">Média</option>
                    <option value="high">Alta</option>
                  </select>
                </div>
                <Input label="Prazo (opcional)" type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="secondary" type="button" size="sm" onClick={() => setShowForm(false)}>Cancelar</Button>
                <Button type="submit" size="sm" loading={createTask.isPending}>Criar</Button>
              </div>
            </form>
          </CardBody>
        </Card>
      )}

      <div className="flex gap-2">
        {(['all', 'pending', 'done'] as const).map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold ${filter === f ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600 dark:bg-slate-800 dark:text-slate-300'}`}>
            {f === 'all' ? 'Todas' : f === 'pending' ? 'Pendentes' : 'Concluídas'}
          </button>
        ))}
      </div>

      {isLoading ? <Spinner /> : (
        <div className="flex flex-col gap-2">
          {tasks.length === 0 ? (
            <p className="py-8 text-center text-sm text-gray-400">Sem tarefas{filter !== 'all' ? ' nesta categoria' : ''}.</p>
          ) : tasks.map((t: any) => (
            <Card key={t.id} className={t.is_done ? 'opacity-60' : ''}>
              <CardBody className="flex items-center gap-3 py-3">
                <button onClick={() => toggleTask.mutate({ id: t.id, done: !t.is_done })}
                  className={`flex-shrink-0 ${t.is_done ? 'text-green-500' : 'text-gray-300 hover:text-primary-500'}`}>
                  {t.is_done ? <CheckSquare className="h-5 w-5" /> : <Circle className="h-5 w-5" />}
                </button>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${t.is_done ? 'line-through text-gray-400' : ''}`}>{t.title}</p>
                  <div className="mt-0.5 flex items-center gap-2 flex-wrap">
                    <Badge variant={PRIORITY_COLORS[t.priority] as any}>{PRIORITY_LABELS[t.priority]}</Badge>
                    {t.deadline && <span className="text-xs text-gray-400">Prazo: {formatDate(t.deadline)}</span>}
                  </div>
                </div>
                <button onClick={() => deleteTask.mutate(t.id)}
                  className="flex-shrink-0 text-gray-300 hover:text-red-500 transition-colors">
                  <X className="h-4 w-4" />
                </button>
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
