import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  CheckSquare, LifeBuoy, MessageSquare, ShoppingBag, LogOut, Menu, X,
  ShoppingCart, Package, Users, Bell, User, CalendarDays,
} from 'lucide-react';
import { useAuthStore } from '../store/auth';
import { api } from '../lib/api';
import Avatar from '../components/shared/Avatar';
import NotificationBell from '../components/shared/NotificationBell';
import OfflineBanner from '../components/shared/OfflineBanner';
import { useFlushQueue } from '../hooks/useFlushQueue';

const navGroups = [
  { label: 'Trabalho', items: [
    { to: '/staff',           label: 'Tarefas',     icon: CheckSquare, end: true },
    { to: '/staff/schedule',  label: 'Agenda',      icon: CalendarDays },
    { to: '/staff/tickets',   label: 'Tickets',     icon: LifeBuoy },
    { to: '/staff/messages',  label: 'Mensagens',   icon: MessageSquare },
    { to: '/staff/notifications', label: 'Notificações', icon: Bell },
  ]},
  { label: 'Consulta', items: [
    { to: '/staff/orders',    label: 'Pedidos',     icon: ShoppingCart },
    { to: '/staff/products',  label: 'Produtos',    icon: Package },
    { to: '/staff/customers', label: 'Clientes',    icon: Users },
    { to: '/staff/sales',     label: 'Minhas Vendas', icon: ShoppingBag },
  ]},
  { label: 'Conta', items: [
    { to: '/staff/profile',   label: 'Perfil',      icon: User },
    { to: '/pos',             label: 'POS / Caixa', icon: ShoppingBag },
  ]},
];

export default function StaffLayout() {
  const [open, setOpen] = useState(false);
  const user = useAuthStore(s => s.user);
  const logout = useAuthStore(s => s.logout);
  const navigate = useNavigate();
  useFlushQueue();

  async function handleLogout() {
    try { await api.post('/auth/logout'); } catch { }
    logout(); navigate('/login');
  }

  return (
    <div className="flex min-h-screen flex-col">
      <OfflineBanner />
      <div className="flex flex-1">
        <aside className={`fixed inset-y-0 left-0 z-50 flex w-60 flex-col border-r border-gray-200 bg-white dark:border-slate-700 dark:bg-slate-800 transition-transform md:relative md:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="flex h-14 items-center justify-between border-b border-gray-100 px-4 dark:border-slate-700">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary-600 font-black text-white text-sm">C</div>
              <div><p className="text-sm font-bold leading-none">Carsai BMS</p><p className="text-[10px] text-gray-400">Área de Staff</p></div>
            </div>
            <button onClick={() => setOpen(false)} className="text-gray-400 md:hidden"><X className="h-5 w-5" /></button>
          </div>
          <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-4">
            {navGroups.map(group => (
              <div key={group.label}>
                <p className="px-3 mb-1 text-[10px] font-bold uppercase tracking-wider text-gray-400">{group.label}</p>
                <div className="space-y-0.5">
                  {group.items.map(({ to, label, icon: Icon, end }: any) => (
                    <NavLink key={to} to={to} end={end} onClick={() => setOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${isActive ? 'bg-primary-50 text-primary-700 dark:bg-primary-600/10 dark:text-primary-400' : 'text-gray-600 hover:bg-gray-100 dark:text-slate-300 dark:hover:bg-slate-700'}`
                      }>
                      <Icon className="h-4 w-4 flex-shrink-0" />{label}
                    </NavLink>
                  ))}
                </div>
              </div>
            ))}
          </nav>
          <div className="border-t border-gray-100 p-3 dark:border-slate-700">
            <div className="mb-2 flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-2 dark:bg-slate-900/50">
              <Avatar name={user?.name} size="sm" />
              <div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold leading-none">{user?.name}</p><p className="truncate text-[10px] text-gray-400 capitalize">{user?.role}</p></div>
            </div>
            <button onClick={handleLogout} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-500 hover:bg-gray-100 dark:text-slate-400 dark:hover:bg-slate-700">
              <LogOut className="h-4 w-4" /> Sair
            </button>
          </div>
        </aside>

        {open && <div className="fixed inset-0 z-40 bg-black/40 md:hidden" onClick={() => setOpen(false)} />}

        <div className="flex flex-1 flex-col">
          <header className="flex h-14 items-center justify-between border-b border-gray-200 bg-white px-4 dark:border-slate-700 dark:bg-slate-800 md:px-6">
            <button onClick={() => setOpen(true)} className="text-gray-500 md:hidden"><Menu className="h-5 w-5" /></button>
            <span className="hidden text-sm font-semibold text-gray-600 dark:text-slate-300 md:block">Área de Staff</span>
            <div className="flex items-center gap-2">
              <NotificationBell />
              <div className="h-5 w-px bg-gray-200 dark:bg-slate-700" />
              <Avatar name={user?.name} size="sm" />
            </div>
          </header>
          <main className="flex-1 overflow-y-auto p-4 pb-6 md:p-6"><Outlet /></main>
        </div>
      </div>
    </div>
  );
}
