import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../../lib/api-client';
import { queryKeys } from '../../../lib/query-keys';
import { Batch } from '@certiflow/shared';

export interface BatchFilterParams {
  [key: string]: unknown;
  page?: number;
  limit?: number;
  status?: string;
  districtId?: string;
  search?: string;
}

export function useBatches(filters: BatchFilterParams = {}) {
  return useQuery({
    queryKey: queryKeys.batches.list(filters),
    queryFn: ({ signal }) =>
      apiClient<{ items: Batch[]; total: number }>('/api/v1/batches', {
        signal,
        params: filters as Record<string, string | number | boolean | undefined>,
      }),
  });
}

export function useBatchDetail(batchId: string) {
  return useQuery({
    queryKey: queryKeys.batches.detail(batchId),
    queryFn: ({ signal }) =>
      apiClient<Batch>(`/api/v1/batches/${batchId}`, { signal }),
    enabled: Boolean(batchId),
  });
}
