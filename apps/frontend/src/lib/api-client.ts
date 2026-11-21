import { ApiResponse } from '@certiflow/shared';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export interface RequestOptions extends Omit<RequestInit, 'body'> {
  params?: Record<string, string | number | boolean | undefined>;
  body?: any;
}

export async function apiClient<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { params, headers, ...customConfig } = options;

  let url = `${BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    });
    const queryString = searchParams.toString();
    if (queryString) {
      url += (url.includes('?') ? '&' : '?') + queryString;
    }
  }

  const token = localStorage.getItem('access_token');

  const body =
    customConfig.body && typeof customConfig.body === 'object' && !(customConfig.body instanceof FormData)
      ? JSON.stringify(customConfig.body)
      : customConfig.body;

  const config: RequestInit = {
    ...customConfig,
    body,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    credentials: 'include',
  };

  const response = await fetch(url, config);

  if (!response.ok) {
    let errorData: any;
    try {
      errorData = await response.json();
    } catch {
      errorData = { error: { message: response.statusText || 'Network request failed' } };
    }
    throw new Error(errorData?.error?.message || `Request failed with status ${response.status}`);
  }

  const json: ApiResponse<T> = await response.json();
  return (json.data !== undefined ? json.data : json) as T;
}
