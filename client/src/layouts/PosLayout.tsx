import { Outlet, Link } from 'react-router-dom';
import { ArrowLeft, Wifi, WifiOff } from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { useAuthStore } from '../store/auth';
import Avatar from '../components/shared/Avatar';

export default function PosLayout() {
  const online = useOnlineStatus();
  const user   = useAuthStore((s) => s.user);

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-gray-50 dark:bg-slate-950">
      {/* Topbar */}
      <header className="flex h-14 flex-shrink-0 items-center justify-between border-b border-gray-200 bg-white px-4 dark:border-slate-700 dark:bg-slate-900">
        <div className="flex items-center gap-3">
          <Link to="/staff" className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-primary-600">
            <ArrowLeft className="h-4 w-4" /> Staff
          </Link>
          <span className="text-gray-300 dark:text-slate-600">|</span>
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary-600 text-xs font-black text-white">C</div>
            <span className="font-bold text-sm">POS — Ponto de Venda</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${online ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'}`}>
            {online ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
            {online ? 'Online' : 'Offline'}
          </div>
          <Avatar name={user?.name} size="sm" />
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-hidden p-4">
        <Outlet />
      </main>
    </div>
  );
}
