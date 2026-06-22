export default function Maintenance() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 text-center px-4 bg-slate-900">
      <div className="text-6xl">🔧</div>
      <h1 className="text-3xl font-black text-white">Em Manutenção</h1>
      <p className="text-slate-400 max-w-md">O sistema está temporariamente em manutenção. Voltaremos em breve. Pedimos desculpa pelo inconveniente.</p>
      <div className="flex items-center gap-2 text-slate-500 text-sm">
        <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
        Estimativa: alguns minutos
      </div>
    </div>
  );
}
