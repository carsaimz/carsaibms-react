import { useAuthStore } from '../store/auth';

const API_URL = import.meta.env.VITE_API_URL || '/api';

interface ApiOptions extends RequestInit {
  skipAuth?: boolean;
}

class ApiClientError extends Error {
  status: number;
  errors?: Record<string, string[]>;
  constructor(message: string, status: number, errors?: Record<string, string[]>) {
    super(message);
    this.status = status;
    this.errors = errors;
  }
}

let refreshPromise: Promise<string | null> | null = null;

async function refreshToken(): Promise<string | null> {
  if (refreshPromise) return refreshPromise;
  refreshPromise = (async () => {
    try {
      const res = await fetch(`${API_URL}/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
      });
      if (!res.ok) return null;
      const json = await res.json();
      const token = json?.data?.token ?? null;
      if (token) useAuthStore.getState().setToken(token);
      if (json?.data?.user) useAuthStore.getState().setUser(json.data.user);
      return token;
    } catch {
      return null;
    } finally {
      refreshPromise = null;
    }
  })();
  return refreshPromise;
}

/** Core request function with automatic 401 -> refresh -> retry */
export async function apiRequest<T = any>(path: string, options: ApiOptions = {}): Promise<T> {
  const { skipAuth, headers, ...rest } = options;
  const token = useAuthStore.getState().token;

  const doFetch = (authToken: string | null) =>
    fetch(`${API_URL}${path}`, {
      ...rest,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...(authToken && !skipAuth ? { Authorization: `Bearer ${authToken}` } : {}),
        ...headers,
      },
    });

  let res = await doFetch(token);

  if (res.status === 401 && !skipAuth) {
    const newToken = await refreshToken();
    if (newToken) {
      res = await doFetch(newToken);
    } else {
      useAuthStore.getState().logout();
    }
  }

  const json = await res.json().catch(() => ({}));

  if (!res.ok || json.success === false) {
    throw new ApiClientError(json.message || 'Erro de rede', res.status, json.errors);
  }

  return json as T;
}

export const api = {
  get:    <T = any>(path: string) => apiRequest<T>(path, { method: 'GET' }),
  post:   <T = any>(path: string, body?: unknown, opts?: ApiOptions) =>
    apiRequest<T>(path, { method: 'POST', body: body ? JSON.stringify(body) : undefined, ...opts }),
  put:    <T = any>(path: string, body?: unknown) =>
    apiRequest<T>(path, { method: 'PUT', body: body ? JSON.stringify(body) : undefined }),
  delete: <T = any>(path: string) => apiRequest<T>(path, { method: 'DELETE' }),
};

export { ApiClientError };
