import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { flushPendingActions } from '../lib/db';
import { api } from '../lib/api';

/**
 * When the user comes back online, replay any mutations that were
 * queued while offline (create_ticket, reply_ticket, update_profile).
 */
export function useFlushQueue() {
  const qc = useQueryClient();

  useEffect(() => {
    const handlers = {
      create_ticket: async (payload: any) => {
        await api.post('/customer/tickets', payload);
        qc.invalidateQueries({ queryKey: ['tickets'] });
      },
      reply_ticket: async (payload: any) => {
        await api.post(`/customer/tickets/${payload.ticketId}/messages`, { body: payload.body });
        qc.invalidateQueries({ queryKey: ['ticket', String(payload.ticketId)] });
      },
      update_profile: async (payload: any) => {
        await api.put('/customer/profile', payload);
        qc.invalidateQueries({ queryKey: ['profile'] });
      },
    };

    async function flush() {
      if (navigator.onLine) {
        try { await flushPendingActions(handlers); } catch { /* non-critical */ }
      }
    }

    window.addEventListener('online', flush);
    flush(); // also run on mount in case there are queued items
    return () => window.removeEventListener('online', flush);
  }, [qc]);
}
