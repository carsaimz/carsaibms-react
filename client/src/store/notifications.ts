import { create } from 'zustand';

interface NotificationsState {
  unread: number;
  setUnread: (n: number) => void;
  decrement: () => void;
}

export const useNotificationsStore = create<NotificationsState>((set) => ({
  unread: 0,
  setUnread: (n) => set({ unread: n }),
  decrement: () => set((s) => ({ unread: Math.max(0, s.unread - 1) })),
}));
