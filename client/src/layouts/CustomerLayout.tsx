import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Package, LifeBuoy, User, LogOut, Menu, X, FileText,
} from 'lucide-react';
import { useAuthStore } from '../store/auth';
import { api } from '../lib/api';
import { useFlushQueue } from '../hooks/useFlushQueue';
import NotificationBell from '../components/shared/NotificationBell';
import OfflineBanner from '../components/shared/OfflineBanner';
import Avatar from '../components/shared/Avatar';
import LangSwitcher from '../components/shared/LangSwitcher';

const navItems = [
  { to: '/',         label: 'Painel',   icon: LayoutDashboard, exact: true },
  { to: '/orders',   label: 'Pedidos',  icon: Package },
  { to: '/invoices', label: 'Facturas', icon: FileText },
  { to: '/tickets',  label: 'Suporte',  icon: LifeBuoy },
  { to: '/profile',  label: 'Perfil',   icon: User },
];

const mobileNavItems = navItems.filter((n) => n.to !== '/invoices');

function NavItem({ to, label, icon: Icon, onClick }: { to: string; label: string; icon: any; onClick?: () => void }) {
  return (
    <NavLink
      to={to}
      end={to === '/'}
      onClick={onClick}
      className={({ isActive }) =>
        `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
          isActive
            ? 'bg-primary-50 text-primary-700 dark:bg-primary-600/10 dark:text-primary-400'
            : 'text-gray-600 hover:bg-gray-100 dark:text-slate-300 dark:hover:bg-slate-700'
        }`
      }
    >
      <Icon className="h-4 w-4" />
      {label}
    </NavLink>
  );
}

export default function CustomerLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();

  // Flush offline queue whenever the user comes back online
  useFlushQueue();

  async function handleLogout() {
    try { await api.post('/auth/logout'); } catch { /* ignore */ }
    logout();
    navigate('/login');
  }

  const close = () => setSidebarOpen(false);

  return (
    <div className="flex min-h-screen flex-col">
      {/* ── Offline banner ────────────────────────────────────────────── */}
      <OfflineBanner />

      <div className="flex flex-1">
        {/* ── Sidebar (desktop) ─────────────────────────────────────── */}
        <aside className="hidden w-60 flex-col border-r border-gray-200 bg-white dark:border-slate-700 dark:bg-slate-800 md:flex">
          <div className="flex h-16 items-center gap-2.5 border-b border-gray-100 px-5 dark:border-slate-700">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600 text-base font-black text-white">
              C
            </div>
            <div>
              <p className="text-sm font-bold leading-none">Carsai BMS</p>
              <p className="text-[10px] text-gray-400">Portal do Cliente</p>
            </div>
          </div>

          <nav className="flex-1 space-y-0.5 p-3">
            {navItems.map((item) => (
              <NavItem key={item.to} {...item} />
            ))}
          </nav>

          <div className="border-t border-gray-100 p-3 dark:border-slate-700">
            <div className="mb-2 flex items-center gap-2.5 rounded-lg bg-gray-50 px-3 py-2 dark:bg-slate-900/50">
              <Avatar name={user?.name} src={user?.avatar} size="sm" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold leading-none">{user?.name}</p>
                <p className="truncate text-[10px] text-gray-400">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-white"
            >
              <LogOut className="h-4 w-4" />
              Terminar sessão
            </button>
          </div>
        </aside>

        {/* ── Mobile sidebar overlay ─────────────────────────────────── */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-40 flex md:hidden">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={close} />
            <aside className="relative z-50 flex w-72 flex-col bg-white shadow-xl dark:bg-slate-800">
              <div className="flex h-16 items-center justify-between border-b border-gray-100 px-5 dark:border-slate-700">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600 font-black text-white">C</div>
                  <span className="font-bold">Carsai BMS</span>
                </div>
                <button onClick={close}><X className="h-5 w-5" /></button>
              </div>
              <nav className="flex-1 space-y-0.5 p-3">
                {navItems.map((item) => (
                  <NavItem key={item.to} {...item} onClick={close} />
                ))}
              </nav>
              <div className="border-t border-gray-100 p-3 dark:border-slate-700">
                <button
                  onClick={() => { close(); handleLogout(); }}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 dark:text-slate-300"
                >
                  <LogOut className="h-4 w-4" /> Terminar sessão
                </button>
              </div>
            </aside>
          </div>
        )}

        {/* ── Main column ───────────────────────────────────────────── */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Topbar */}
          <header className="flex h-16 flex-shrink-0 items-center justify-between border-b border-gray-200 bg-white px-4 dark:border-slate-700 dark:bg-slate-800 md:px-6">
            <button
              className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:text-slate-400 dark:hover:bg-slate-700 md:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="hidden text-sm font-semibold text-gray-700 dark:text-slate-200 md:block">
              Bem-vindo, {user?.name?.split(' ')[0]}
            </div>
            <div className="flex items-center gap-2">
              <LangSwitcher compact />
              <NotificationBell />
              <div className="h-6 w-px bg-gray-200 dark:bg-slate-700" />
              <Avatar name={user?.name} src={user?.avatar} size="sm" />
            </div>
          </header>

          {/* Page content */}
          <main className="flex-1 overflow-y-auto p-4 pb-24 md:p-6 md:pb-6">
            <Outlet />
          </main>

          {/* Bottom nav (mobile) */}
          <nav className="fixed bottom-0 left-0 right-0 z-30 flex border-t border-gray-200 bg-white dark:border-slate-700 dark:bg-slate-800 md:hidden">
            {mobileNavItems.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                className={({ isActive }) =>
                  `flex flex-1 flex-col items-center gap-1 py-2.5 text-[10px] font-medium transition-colors ${
                    isActive ? 'text-primary-600 dark:text-primary-400' : 'text-gray-500 dark:text-slate-400'
                  }`
                }
              >
                <Icon className="h-5 w-5" />
                {label}
              </NavLink>
            ))}
          </nav>
        </div>
      </div>
    </div>
  );
}
