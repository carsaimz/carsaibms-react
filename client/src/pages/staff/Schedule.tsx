import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CalendarDays, Plus, X } from 'lucide-react';
import { api } from '../../lib/api';
import { Card, CardBody } from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { formatDate } from '../../lib/format';

const DAYS_PT = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'];
const MONTHS_PT = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];

function getMonthDays(year: number, month: number) {
  const first = new Date(year, month, 1).getDay();
  const total = new Date(year, month + 1, 0).getDate();
  return { first, total };
}

export default function StaffSchedule() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', priority: 'medium', deadline: '' });
  const qc = useQueryClient();

  const { data } = useQuery({
    queryKey: ['staff-tasks-all'],
    queryFn: () => api.get<{ data: any[] }>('/staff/tasks'),
  });

  const tasks = data?.data ?? [];
  const createTask = useMutation({
    mutationFn: () => api.post('/staff/tasks', form),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['staff-tasks-all'] }); setShowForm(false); setForm({ title: '', priority: 'medium', deadline: '' }); },
  });

  const { first, total } = getMonthDays(year, month);
  const blanks = Array(first).fill(null);
  const days = Array.from({ length: total }, (_, i) => i + 1);

  function taskDaysInMonth() {
    const map: Record<number, any[]> = {};
    for (const t of tasks) {
      if (!t.deadline) continue;
      const d = new Date(t.deadline);
      if (d.getFullYear() === year && d.getMonth() === month) {
        const day = d.getDate();
        if (!map[day]) map[day] = [];
        map[day].push(t);
      }
    }
    return map;
  }
  const taskMap = taskDaysInMonth();

  const prevMonth = () => { if (month === 0) { setMonth(11); setYear(y => y - 1); } else setMonth(m => m - 1); };
  const nextMonth = () => { if (month === 11) { setMonth(0); setYear(y => y + 1); } else setMonth(m => m + 1); };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <CalendarDays className="h-5 w-5 text-primary-600" />
          <h1 className="text-xl font-bold">Agenda</h1>
        </div>
        <Button size="sm" icon={<Plus className="h-4 w-4" />} onClick={() => setShowForm(v => !v)}>Nova Tarefa</Button>
      </div>

      {showForm && (
        <Card><CardBody>
          <form onSubmit={e => { e.preventDefault(); createTask.mutate(); }} className="grid grid-cols-2 gap-3">
            <div className="col-span-2"><Input label="Título" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required /></div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700 dark:text-slate-300">Prioridade</label>
              <select value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))} className="rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-900">
                <option value="low">Baixa</option><option value="medium">Média</option><option value="high">Alta</option>
              </select>
            </div>
            <Input label="Prazo" type="date" value={form.deadline} onChange={e => setForm(f => ({ ...f, deadline: e.target.value }))} />
            <div className="col-span-2 flex justify-end gap-2">
              <Button variant="secondary" type="button" size="sm" onClick={() => setShowForm(false)}>Cancelar</Button>
              <Button type="submit" size="sm" loading={createTask.isPending}>Criar</Button>
            </div>
          </form>
        </CardBody></Card>
      )}

      <Card><CardBody>
        <div className="flex items-center justify-between mb-4">
          <button onClick={prevMonth} className="rounded-lg px-3 py-1.5 text-sm hover:bg-gray-100 dark:hover:bg-slate-700">←</button>
          <span className="font-bold">{MONTHS_PT[month]} {year}</span>
          <button onClick={nextMonth} className="rounded-lg px-3 py-1.5 text-sm hover:bg-gray-100 dark:hover:bg-slate-700">→</button>
        </div>
        <div className="grid grid-cols-7 gap-1">
          {DAYS_PT.map(d => <div key={d} className="text-center text-[10px] font-bold text-gray-400 uppercase pb-1">{d}</div>)}
          {blanks.map((_, i) => <div key={`b${i}`} />)}
          {days.map(day => {
            const ts = taskMap[day] || [];
            const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
            return (
              <div key={day} className={`min-h-[3.5rem] rounded-lg border p-1 ${isToday ? 'border-primary-400 bg-primary-50 dark:bg-primary-900/20' : 'border-gray-100 dark:border-slate-700'}`}>
                <p className={`text-xs font-bold mb-0.5 ${isToday ? 'text-primary-600' : 'text-gray-500'}`}>{day}</p>
                {ts.map((t: any) => (
                  <div key={t.id} className={`rounded text-[9px] font-semibold px-1 truncate ${t.priority === 'high' ? 'bg-red-100 text-red-700' : t.priority === 'medium' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-600'}`}>
                    {t.title}
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </CardBody></Card>

      <Card><CardBody>
        <h3 className="text-sm font-bold mb-3">Tarefas com prazo este mês</h3>
        <div className="space-y-2">
          {tasks.filter((t: any) => {
            if (!t.deadline) return false;
            const d = new Date(t.deadline);
            return d.getFullYear() === year && d.getMonth() === month;
          }).sort((a: any, b: any) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
           .map((t: any) => (
            <div key={t.id} className="flex items-center gap-2 text-sm">
              <Badge variant={t.priority === 'high' ? 'danger' : t.priority === 'medium' ? 'warning' : 'default'}>{new Date(t.deadline).getDate()}</Badge>
              <span className={t.is_done ? 'line-through text-gray-400' : ''}>{t.title}</span>
            </div>
          ))}
          {!tasks.filter((t: any) => t.deadline && new Date(t.deadline).getFullYear() === year && new Date(t.deadline).getMonth() === month).length && (
            <p className="text-sm text-gray-400">Sem tarefas com prazo este mês.</p>
          )}
        </div>
      </CardBody></Card>
    </div>
  );
}
