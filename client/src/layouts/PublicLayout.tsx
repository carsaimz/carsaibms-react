import { useState } from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import { Menu, X, Code } from 'lucide-react';
import { useAuthStore } from '../store/auth';

const links = [
  { to: '/',          label: 'Início',   end: true },
  { to: '/products',  label: 'Produtos'  },
  { to: '/services',  label: 'Serviços'  },
  { to: '/blog',      label: 'Blog'      },
  { to: '/api-docs',  label: 'API'       },
  { to: '/contact',   label: 'Contacto'  },
];

export default function PublicLayout() {
  const [open, setOpen] = useState(false);
  const user = useAuthStore((s) => s.user);
  const isAuth = useAuthStore((s) => s.isAuthenticated());

  return (
    <div className="flex min-h-screen flex-col bg-white dark:bg-slate-950">
      {/* ── Navbar ─────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/90 backdrop-blur dark:border-slate-800 dark:bg-slate-950/90">
        <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-6">
          <Link to="/" className="flex items-center gap-2 font-black text-primary-600 text-lg">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600 text-white text-sm font-black">C</div>
            Carsai BMS
          </Link>

          {/* Desktop links */}
          <div className="hidden items-center gap-1 md:flex">
            {links.map(({ to, label, end }) => (
              <NavLink key={to} to={to} end={end}
                className={({ isActive }) =>
                  `rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    isActive ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400'
                             : 'text-gray-600 hover:bg-gray-100 dark:text-slate-300 dark:hover:bg-slate-800'
                  }`
                }>{label}</NavLink>
            ))}
          </div>

          <div className="hidden items-center gap-2 md:flex">
            {isAuth ? (
              <>
                {['admin','manager'].includes(user?.role ?? '') && (
                  <Link to="/admin" className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-bold text-white hover:bg-slate-700 dark:bg-slate-700">Admin</Link>
                )}
                <Link to="/" className="rounded-lg bg-primary-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-primary-700">Portal</Link>
              </>
            ) : (
              <>
                <Link to="/login"    className="rounded-lg px-3 py-1.5 text-sm font-semibold text-gray-600 hover:bg-gray-100 dark:text-slate-300">Entrar</Link>
                <Link to="/register" className="rounded-lg bg-primary-600 px-3 py-1.5 text-sm font-bold text-white hover:bg-primary-700">Criar conta</Link>
              </>
            )}
          </div>

          <button onClick={() => setOpen((v) => !v)} className="text-gray-500 md:hidden">
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </nav>

        {/* Mobile menu */}
        {open && (
          <div className="border-t border-gray-100 bg-white px-4 pb-4 dark:border-slate-800 dark:bg-slate-950 md:hidden">
            {links.map(({ to, label, end }) => (
              <NavLink key={to} to={to} end={end} onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `block rounded-lg px-3 py-2.5 text-sm font-medium ${isActive ? 'text-primary-600' : 'text-gray-700 dark:text-slate-300'}`
                }>{label}</NavLink>
            ))}
            <hr className="my-2 border-gray-100 dark:border-slate-800" />
            {isAuth
              ? <Link to="/" onClick={() => setOpen(false)} className="block rounded-lg bg-primary-600 px-3 py-2.5 text-center text-sm font-bold text-white">Portal do Cliente</Link>
              : <div className="flex gap-2">
                  <Link to="/login"    onClick={() => setOpen(false)} className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-center text-sm font-semibold">Entrar</Link>
                  <Link to="/register" onClick={() => setOpen(false)} className="flex-1 rounded-lg bg-primary-600 px-3 py-2 text-center text-sm font-bold text-white">Registar</Link>
                </div>
            }
          </div>
        )}
      </header>

      {/* ── Content ────────────────────────────────────────────────── */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* ── Footer ─────────────────────────────────────────────────── */}
      <footer className="border-t border-gray-200 bg-gray-50 dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto max-w-7xl px-4 py-10 md:px-6">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 font-black text-primary-600">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary-600 text-white text-xs font-black">C</div>
                Carsai BMS
              </div>
              <p className="mt-2 text-sm text-gray-500 dark:text-slate-400">Sistema de Gestão Empresarial para o mercado moçambicano.</p>
            </div>
            <div>
              <p className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-400">Plataforma</p>
              {[['/', 'Início'], ['/products', 'Produtos'], ['/services', 'Serviços'], ['/blog', 'Blog']].map(([to, label]) => (
                <Link key={to} to={to} className="block py-1 text-sm text-gray-500 hover:text-primary-600 dark:text-slate-400">{label}</Link>
              ))}
            </div>
            <div>
              <p className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-400">Conta</p>
              {[['/login', 'Entrar'], ['/register', 'Criar conta'], ['/', 'Portal do Cliente'], ['/admin', 'Painel Admin']].map(([to, label]) => (
                <Link key={to} to={to} className="block py-1 text-sm text-gray-500 hover:text-primary-600 dark:text-slate-400">{label}</Link>
              ))}
            </div>
            <div>
              <p className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-400">Developers</p>
              {[['/api-docs', 'API Docs'], ['/contact', 'Contacto']].map(([to, label]) => (
                <Link key={to} to={to} className="block py-1 text-sm text-gray-500 hover:text-primary-600 dark:text-slate-400">{label}</Link>
              ))}
            </div>
          </div>
          <div className="mt-8 flex items-center justify-between border-t border-gray-200 pt-6 dark:border-slate-800">
            <p className="text-xs text-gray-400">© {new Date().getFullYear()} Carsai BMS</p>
            <a href="https://carsaidev.linkpc.net" target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs text-gray-400 hover:text-primary-600">
              CarsaiDev <Code className="h-3 w-3" />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
