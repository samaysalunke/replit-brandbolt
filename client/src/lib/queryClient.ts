import { QueryClient } from '@tanstack/react-query';

// Create a client
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 30000, // 30 seconds
    },
  },
});

type RequestMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

interface FetchOptions {
  on401?: 'throw' | 'returnNull';
}

export async function apiRequest(
  method: RequestMethod,
  endpoint: string,
  data?: any,
  customHeaders?: HeadersInit
) {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...customHeaders,
  };

  const config: RequestInit = {
    method,
    headers,
    credentials: 'include', // Include cookies for authentication
  };

  if (data && method !== 'GET') {
    config.body = JSON.stringify(data);
  }

  const response = await fetch(endpoint, config);

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || `HTTP error! Status: ${response.status}`);
  }

  return response;
}

export function getQueryFn(options: FetchOptions = {}) {
  return async ({ queryKey }: { queryKey: (string | number)[] }) => {
    try {
      // Extract the URL from the queryKey
      const [url, ...params] = queryKey;
      // Construct the full URL with any params
      const fullUrl = typeof url === 'string' ? url : '';
      
      const response = await fetch(fullUrl, {
        credentials: 'include',
      });

      if (response.status === 401 && options.on401 === 'returnNull') {
        return null;
      }

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      }
      
      return await response.text();
    } catch (error) {
      if (options.on401 === 'returnNull' && (error as Error).message.includes('401')) {
        return null;
      }
      throw error;
    }
  };
}