import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Package, ShoppingCart, Users, LifeBuoy, BarChart3,
  Settings, LogOut, Menu, X, FileText, Tag, Building2, Wrench,
  Activity, Bell, CreditCard, Layers, ShoppingBag, BookOpen,
  TrendingUp, User, Download, Shield, ScrollText, Mail, Image, CheckSquare,
} from 'lucide-react';
import { useAuthStore } from '../store/auth';
import { api } from '../lib/api';
import Avatar from '../components/shared/Avatar';
import NotificationBell from '../components/shared/NotificationBell';
import LangSwitcher from '../components/shared/LangSwitcher';
import OfflineBanner from '../components/shared/OfflineBanner';

const navGroups = [
  { label: 'Principal', items: [
    { to: '/admin',                end: true, label: 'Dashboard',    icon: LayoutDashboard },
    { to: '/admin/orders',                    label: 'Pedidos',      icon: ShoppingCart },
    { to: '/admin/orders/new',                label: 'Novo Pedido',  icon: ShoppingCart },
    { to: '/admin/customers',                 label: 'Clientes',     icon: Users },
    { to: '/admin/tickets',                   label: 'Tickets',      icon: LifeBuoy },
    { to: '/admin/notifications',             label: 'Notificações', icon: Bell },
    { to: '/admin/tasks',                     label: 'Tarefas',      icon: CheckSquare },
  ]},
  { label: 'Catálogo', items: [
    { to: '/admin/products',                  label: 'Produtos',     icon: Package },
    { to: '/admin/services',                  label: 'Serviços',     icon: Wrench },
    { to: '/admin/categories',                label: 'Categorias',   icon: Layers },
    { to: '/admin/stock',                     label: 'Stock',        icon: BarChart3 },
    { to: '/admin/suppliers',                 label: 'Fornecedores', icon: Building2 },
    { to: '/admin/coupons',                   label: 'Cupões',       icon: Tag },
    { to: '/admin/banners',                   label: 'Banners',      icon: Image },
  ]},
  { label: 'Finanças', items: [
    { to: '/admin/financial',                 label: 'Financeiro',   icon: TrendingUp },
    { to: '/admin/payments',                  label: 'Pagamentos',   icon: CreditCard },
    { to: '/admin/sales',                     label: 'Vendas POS',   icon: ShoppingBag },
    { to: '/admin/reports',                   label: 'Relatórios',   icon: BarChart3 },
    { to: '/admin/export',                    label: 'Exportação',   icon: Download },
  ]},
  { label: 'Conteúdo', items: [
    { to: '/admin/posts',                     label: 'Blog',         icon: BookOpen },
    { to: '/admin/pages',                     label: 'Páginas',      icon: FileText },
    { to: '/admin/emails',                    label: 'Emails',       icon: Mail },
  ]},
  { label: 'Sistema', items: [
    { to: '/admin/users',                     label: 'Utilizadores', icon: Users },
    { to: '/admin/roles',                     label: 'Roles',        icon: Shield },
    { to: '/admin/logs',                      label: 'Logs',         icon: Activity },
    { to: '/admin/changelog',                 label: 'Changelog',    icon: ScrollText },
    { to: '/admin/settings',                  label: 'Definições',   icon: Settings },
    { to: '/admin/profile',                   label: 'Meu Perfil',   icon: User },
  ]},
];

function SideLink({ to, label, icon: Icon, end }: { to: string; label: string; icon: any; end?: boolean }) {
  return (
    <NavLink to={to} end={end}
      className={({ isActive }) =>
        `flex items-center gap-2.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
          isActive ? 'bg-slate-700 text-white' : 'text-slate-300 hover:bg-slate-700/60 hover:text-white'
        }`
      }
    >
      <Icon className="h-4 w-4 flex-shrink-0" />
      {label}
    </NavLink>
  );
}

export default function AdminLayout() {
  const [open, setOpen] = useState(false);
  const user = useAuthStore(s => s.user);
  const logout = useAuthStore(s => s.logout);
  const navigate = useNavigate();

  async function handleLogout() {
    try { await api.post('/auth/logout'); } catch { }
    logout(); navigate('/login');
  }

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 dark:bg-slate-950">
      <OfflineBanner />
      <div className="flex flex-1">
        <aside className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-slate-900 transition-transform md:relative md:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="flex h-14 items-center justify-between px-4 border-b border-slate-800 flex-shrink-0">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary-600 font-black text-white text-sm">C</div>
              <span className="font-bold text-white text-sm">Carsai Admin</span>
            </div>
            <button onClick={() => setOpen(false)} className="text-slate-400 md:hidden"><X className="h-5 w-5" /></button>
          </div>

          <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-4">
            {navGroups.map(group => (
              <div key={group.label}>
                <p className="px-3 mb-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">{group.label}</p>
                <div className="space-y-0.5">
                  {group.items.map(item => <SideLink key={item.to} {...item} />)}
                </div>
              </div>
            ))}
          </nav>

          <div className="border-t border-slate-800 p-3 flex-shrink-0">
            <div className="mb-2 flex items-center gap-2 rounded-lg bg-slate-800 px-3 py-2">
              <Avatar name={user?.name} size="sm" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold text-white leading-none">{user?.name}</p>
                <p className="truncate text-[10px] text-slate-400 capitalize">{user?.role}</p>
              </div>
            </div>
            <button onClick={handleLogout} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs text-slate-400 hover:bg-slate-800 hover:text-white">
              <LogOut className="h-4 w-4" /> Sair
            </button>
          </div>
        </aside>

        {open && <div className="fixed inset-0 z-40 bg-black/60 md:hidden" onClick={() => setOpen(false)} />}

        <div className="flex flex-1 flex-col min-w-0">
          <header className="flex h-14 items-center justify-between border-b border-gray-200 bg-white px-4 dark:border-slate-800 dark:bg-slate-900 md:px-6">
            <button onClick={() => setOpen(true)} className="text-gray-500 md:hidden"><Menu className="h-5 w-5" /></button>
            <div className="hidden text-sm font-semibold text-gray-700 dark:text-slate-200 md:block">Painel Administrativo</div>
            <div className="flex items-center gap-2">
              <LangSwitcher compact />
              <NotificationBell />
              <div className="h-5 w-px bg-gray-200 dark:bg-slate-700" />
              <NavLink to="/" className="rounded-lg px-2.5 py-1 text-xs font-semibold text-gray-500 hover:bg-gray-100 dark:text-slate-400 dark:hover:bg-slate-800">← Portal</NavLink>
              <NavLink to="/pos" className="rounded-lg bg-green-100 px-2.5 py-1 text-xs font-bold text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400">POS</NavLink>
            </div>
          </header>
          <main className="flex-1 overflow-y-auto p-4 md:p-6"><Outlet /></main>
        </div>
      </div>
    </div>
  );
}
