import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CheckSquare, Circle, Users } from 'lucide-react';
import { api } from '../../lib/api';
import { Card, CardBody, CardHeader, CardTitle } from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import { formatDate } from '../../lib/format';
import { useTranslation } from 'react-i18next';

const PRIORITY_LABELS: Record<string, string> = { high: 'Alta', medium: 'Média', low: 'Baixa' };
const PRIORITY_COLORS: Record<string, any> = { high: 'danger', medium: 'warning', low: 'default' };

export default function AdminTasks() {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ['admin-tasks-all'],
    queryFn: () => api.get<{ data: any[] }>('/admin/tasks'),
  });

  const toggle = useMutation({
    mutationFn: (t: any) => api.put(`/staff/tasks/${t.id}`, { ...t, is_done: !t.is_done }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-tasks-all'] }),
  });

  const pending = (data?.data ?? []).filter((t: any) => !t.is_done);
  const done    = (data?.data ?? []).filter((t: any) => t.is_done);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div><h1 className="text-xl font-bold">Vista de Tarefas (Admin)</h1>
          <p className="text-sm text-gray-500 dark:text-slate-400">{pending.length} pendentes de toda a equipa</p>
        </div>
      </div>
      {isLoading ? <Spinner /> : !data?.data.length ? (
        <EmptyState icon={<CheckSquare className="h-8 w-8" />} title="Sem tarefas" />
      ) : (
        <>
          {pending.length > 0 && (
            <Card>
              <CardHeader><CardTitle>Pendentes ({pending.length})</CardTitle></CardHeader>
              <CardBody className="p-0">
                <div className="divide-y divide-gray-50 dark:divide-slate-800">
                  {pending.map((t: any) => (
                    <div key={t.id} className="flex items-center gap-3 px-4 py-3">
                      <button onClick={() => toggle.mutate(t)} className="text-gray-300 hover:text-primary-500 flex-shrink-0"><Circle className="h-5 w-5" /></button>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{t.title}</p>
                        <div className="mt-0.5 flex items-center gap-2 flex-wrap">
                          <Badge variant={PRIORITY_COLORS[t.priority]}>{PRIORITY_LABELS[t.priority]}</Badge>
                          {t.deadline && <span className="text-xs text-gray-400">Prazo: {formatDate(t.deadline)}</span>}
                          {t.assigned_name && <span className="flex items-center gap-1 text-xs text-gray-400"><Users className="h-3 w-3" />{t.assigned_name}</span>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>
          )}
          {done.length > 0 && (
            <Card>
              <CardHeader><CardTitle>Concluídas ({done.length})</CardTitle></CardHeader>
              <CardBody className="p-0">
                <div className="divide-y divide-gray-50 dark:divide-slate-800">
                  {done.map((t: any) => (
                    <div key={t.id} className="flex items-center gap-3 px-4 py-3 opacity-60">
                      <button onClick={() => toggle.mutate(t)} className="text-green-500 flex-shrink-0"><CheckSquare className="h-5 w-5" /></button>
                      <p className="text-sm line-through text-gray-400">{t.title}</p>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
