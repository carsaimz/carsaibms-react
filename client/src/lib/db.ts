import Dexie, { type Table } from 'dexie';

export interface CachedOrder {
  id: number;
  order_number: string;
  status: string;
  payment_status: string;
  total: number;
  currency: string;
  created_at: string;
  cached_at: number;
}

export interface CachedTicket {
  id: number;
  ticket_number: string;
  subject: string;
  status: string;
  priority: string;
  updated_at: string;
  cached_at: number;
}

export interface PendingAction {
  id?: number;
  type: 'create_ticket' | 'reply_ticket' | 'update_profile';
  payload: unknown;
  created_at: number;
}

/**
 * Offline cache (IndexedDB via Dexie).
 * Stores the latest known orders/tickets for offline viewing,
 * and queues mutations made while offline for later sync.
 */
class CarsaiDB extends Dexie {
  orders!: Table<CachedOrder, number>;
  tickets!: Table<CachedTicket, number>;
  pendingActions!: Table<PendingAction, number>;

  constructor() {
    super('carsai-offline');
    this.version(1).stores({
      orders: 'id, order_number, status, payment_status',
      tickets: 'id, ticket_number, status',
      pendingActions: '++id, type, created_at',
    });
  }
}

export const db = new CarsaiDB();

/** Queue an action to be replayed when back online */
export async function queueAction(type: PendingAction['type'], payload: unknown) {
  await db.pendingActions.add({ type, payload, created_at: Date.now() });
}

/** Replay all queued actions (called on reconnect) */
export async function flushPendingActions(handlers: Record<PendingAction['type'], (payload: any) => Promise<void>>) {
  const actions = await db.pendingActions.toArray();
  for (const action of actions) {
    try {
      await handlers[action.type](action.payload);
      await db.pendingActions.delete(action.id!);
    } catch {
      // keep in queue, retry next time
    }
  }
}
