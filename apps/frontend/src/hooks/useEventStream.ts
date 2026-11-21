import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../lib/query-keys';

export function useEventStream(enabled = true) {
  const queryClient = useQueryClient();
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    if (!enabled) return;

    try {
      const token = localStorage.getItem('access_token');
      // Only connect if user is authenticated with a token
      if (!token) return;

      const url = `/api/v1/events/stream?token=${encodeURIComponent(token)}`;
      const es = new EventSource(url);
      eventSourceRef.current = es;

      es.addEventListener('BATCH_UPDATED', () => {
        queryClient.invalidateQueries({ queryKey: queryKeys.batches.all });
        queryClient.invalidateQueries({ queryKey: queryKeys.district.all });
        queryClient.invalidateQueries({ queryKey: queryKeys.quality.all });
        queryClient.invalidateQueries({ queryKey: queryKeys.state.overview });
      });

      es.addEventListener('SLA_BREACHED', () => {
        queryClient.invalidateQueries({ queryKey: queryKeys.district.all });
        queryClient.invalidateQueries({ queryKey: queryKeys.state.overview });
      });

      es.addEventListener('CERTIFICATES_ISSUED', () => {
        queryClient.invalidateQueries({ queryKey: queryKeys.batches.all });
        queryClient.invalidateQueries({ queryKey: queryKeys.certificates.all });
      });

      es.onerror = () => {
        // EventSource will automatically handle reconnections without throwing noisy uncaught errors
        if (es.readyState === EventSource.CLOSED) {
          es.close();
        }
      };

      return () => {
        es.close();
      };
    } catch {
      // EventSource fallback
    }
  }, [enabled, queryClient]);
}
