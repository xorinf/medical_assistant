// hooks/useNotifications.js
// -----------------------------------------------------------------------------
// Polls /api/notifications every 30 seconds while a user is logged in.
// Gives the bell its unread badge + the dropdown list.
// -----------------------------------------------------------------------------

import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api.js';
import { useAuthStore } from '../store/authStore.js';

export function useNotifications() {
  const token = useAuthStore((s) => s.token);
  const query = useQuery({
    queryKey: ['notifications'],
    queryFn:  () => api.get('/api/notifications'),
    enabled:  !!token,
    refetchInterval: 30_000,
    refetchOnWindowFocus: true,
  });

  // Keep it warm
  const qc = useQueryClient();
  useEffect(() => {
    if (!token) qc.removeQueries({ queryKey: ['notifications'] });
  }, [token, qc]);

  return query;
}
