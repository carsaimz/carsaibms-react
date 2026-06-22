import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';

/**
 * Polls for new orders every 30 seconds when the user is online.
 * In a future session this will be replaced by Supabase Realtime / WebSocket.
 */
export function useRealtimeOrders(enabled = true) {
  const qc = useQueryClient();
  useEffect(() => {
    if (!enabled) return;
    const id = setInterval(() => {
      qc.invalidateQueries({ queryKey: ['admin-orders'] });
      qc.invalidateQueries({ queryKey: ['admin-dashboard'] });
    }, 30_000);
    return () => clearInterval(id);
  }, [qc, enabled]);
}
