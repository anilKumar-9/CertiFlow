export const queryKeys = {
  auth: {
    me: ['auth', 'me'] as const,
  },
  batches: {
    all: ['batches'] as const,
    lists: () => [...queryKeys.batches.all, 'list'] as const,
    list: (filters: Record<string, unknown> = {}) => [...queryKeys.batches.lists(), filters] as const,
    details: () => [...queryKeys.batches.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.batches.details(), id] as const,
    candidates: (batchId: string) => [...queryKeys.batches.detail(batchId), 'candidates'] as const,
  },
  district: {
    all: ['district'] as const,
    queue: (filters: Record<string, unknown> = {}) => [...queryKeys.district.all, 'queue', filters] as const,
  },
  quality: {
    all: ['quality'] as const,
    queue: (filters: Record<string, unknown> = {}) => [...queryKeys.quality.all, 'queue', filters] as const,
  },
  state: {
    overview: ['state', 'overview'] as const,
    queue: (filters: Record<string, unknown> = {}) => ['state', 'queue', filters] as const,
  },
  certificates: {
    all: ['certificates'] as const,
    detail: (id: string) => [...queryKeys.certificates.all, 'detail', id] as const,
  },
  verification: {
    token: (token: string) => ['verification', 'token', token] as const,
    search: (certNumber: string) => ['verification', 'search', certNumber] as const,
  },
};
