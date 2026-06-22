import { Link } from 'react-router-dom';
export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center px-4">
      <div className="text-8xl font-black text-gray-100 dark:text-slate-800">404</div>
      <h1 className="text-2xl font-black">Página não encontrada</h1>
      <p className="text-gray-500 dark:text-slate-400">A página que procura não existe ou foi removida.</p>
      <Link to="/" className="rounded-xl bg-primary-600 px-6 py-2.5 text-sm font-bold text-white hover:bg-primary-700">← Ir para o início</Link>
    </div>
  );
}
