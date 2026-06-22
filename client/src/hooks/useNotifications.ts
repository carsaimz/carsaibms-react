import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';

export interface Notification {
  id: number;
  title: string;
  body: string | null;
  url: string | null;
  is_read: boolean;
  created_at: string;
}

export function useNotifications() {
  const qc = useQueryClient();

  const { data } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => api.get<{ data: Notification[] }>('/customer/notifications'),
    refetchInterval: 30_000, // poll every 30s
  });

  const markRead = useMutation({
    mutationFn: (id: number) => api.post(`/customer/notifications/${id}/read`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const unreadCount = data?.data?.filter((n) => !n.is_read).length ?? 0;

  return { notifications: data?.data ?? [], unreadCount, markRead };
}
