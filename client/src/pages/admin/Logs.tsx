import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Activity } from 'lucide-react';
import { api } from '../../lib/api';
import { Card, CardBody } from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import { formatDateTime } from '../../lib/format';
import { useTranslation } from 'react-i18next';

export default function AdminLogs() {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const { data, isLoading } = useQuery({
    queryKey: ['admin-logs', page],
    queryFn: () => api.get<{ data: any[]; meta: any }>(`/admin/logs?page=${page}`),
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Activity className="h-5 w-5 text-primary-600" />
        <h1 className="text-xl font-bold">Logs do Sistema</h1>
      </div>
      {isLoading ? <Spinner /> : (
        <Card><CardBody className="p-0">
          <div className="divide-y divide-gray-50 dark:divide-slate-800">
            {(data?.data??[]).map((log:any) => (
              <div key={log.id} className="flex items-start gap-3 px-4 py-3">
                <div className="flex-shrink-0 mt-0.5">
                  <Badge variant={log.level==='error'?'danger':log.level==='warn'?'warning':'default'}>{log.level||'info'}</Badge>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{log.action||log.message}</p>
                  {log.details && <p className="text-xs text-gray-400 mt-0.5 truncate">{typeof log.details==='object'?JSON.stringify(log.details):log.details}</p>}
                  <p className="text-[10px] text-gray-400 mt-1">{log.user_name||'Sistema'} · {formatDateTime(log.created_at)}</p>
                </div>
              </div>
            ))}
            {!data?.data?.length && <p className="py-8 text-center text-sm text-gray-400">Sem logs disponíveis.</p>}
          </div>
        </CardBody></Card>
      )}
      {data && data.meta?.last_page > 1 && (
        <div className="flex justify-center gap-1">
          {Array.from({ length: data.meta.last_page }, (_, i) => i + 1).map((p) => (
            <button key={p} onClick={() => setPage(p)} className={`h-8 min-w-[2rem] rounded-lg px-2 text-sm font-semibold ${p===page?'bg-primary-600 text-white':'bg-gray-100 dark:bg-slate-800'}`}>{p}</button>
          ))}
        </div>
      )}
    </div>
  );
}
