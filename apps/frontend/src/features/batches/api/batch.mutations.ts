import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../lib/api-client';
import { queryKeys } from '../../../lib/query-keys';
import { CreateBatchInput, Batch } from '@certiflow/shared';

export function useCreateBatch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateBatchInput) =>
      apiClient<Batch>('/api/v1/batches', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      // Targeted cache invalidation of batch lists
      queryClient.invalidateQueries({ queryKey: queryKeys.batches.lists() });
    },
  });
}

export function useSubmitBatch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (batchId: string) =>
      apiClient<{ status: string }>(`/api/v1/batches/${batchId}/submit`, {
        method: 'POST',
      }),
    onSuccess: (_, batchId) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.batches.detail(batchId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.batches.lists() });
    },
  });
}

export function useApproveDistrictBatch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ batchId, remarks }: { batchId: string; remarks?: string }) =>
      apiClient<{ status: string }>(`/api/v1/district/batches/${batchId}/approve`, {
        method: 'POST',
        body: JSON.stringify({ remarks }),
      }),
    onSuccess: (_, { batchId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.batches.detail(batchId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.district.queue() });
    },
  });
}
