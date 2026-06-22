import { WifiOff, RefreshCw } from 'lucide-react';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';

export default function OfflineBanner() {
  const online = useOnlineStatus();

  if (online) return null;

  return (
    <div className="flex items-center justify-between bg-amber-500 px-4 py-2 text-white">
      <div className="flex items-center gap-2 text-sm font-semibold">
        <WifiOff className="h-4 w-4" />
        Sem ligação — a trabalhar em modo offline
      </div>
      <button
        onClick={() => window.location.reload()}
        className="flex items-center gap-1 rounded-md bg-amber-600 px-2 py-1 text-xs font-bold hover:bg-amber-700"
      >
        <RefreshCw className="h-3 w-3" />
        Reconectar
      </button>
    </div>
  );
}
