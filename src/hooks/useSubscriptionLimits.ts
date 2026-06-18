import { useCallback, useEffect, useState } from 'react';
import { authApi } from '@/services/api';
import type { SubscriptionLimitsStatus } from '@/types/models';
import { useAuth } from '@/contexts/AuthContext';

export function useSubscriptionLimits(eventId?: string) {
  const { user } = useAuth();
  const [limits, setLimits] = useState<SubscriptionLimitsStatus | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!user || user.role === 'superadmin') {
      setLimits(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const res = await authApi.getSubscriptionLimits(eventId);
      if (res.success) {
        setLimits(res.data);
      }
    } catch {
      setLimits(null);
    } finally {
      setLoading(false);
    }
  }, [user, eventId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { limits, loading, refresh };
}
