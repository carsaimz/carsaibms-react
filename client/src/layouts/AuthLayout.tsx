import { Outlet, Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth';

export default function AuthLayout() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated());
  if (isAuthenticated) return <Navigate to="/" replace />;

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary-700 to-slate-900 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center text-white">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 text-2xl font-black">
            C
          </div>
          <h1 className="text-xl font-bold">Carsai BMS</h1>
          <p className="text-sm text-white/70">Portal do Cliente</p>
        </div>
        <div className="rounded-2xl bg-white p-6 shadow-xl dark:bg-slate-800">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
