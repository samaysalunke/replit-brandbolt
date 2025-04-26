import { useEffect, useState } from 'react';
import { Profile } from '../../../shared/schema';
import { LinkedInAPI } from '../lib/linkedin-api';
import { useQuery, useMutation } from '@tanstack/react-query';

interface AuthState {
  user: Profile | null;
  loading: boolean;
  error: string | null;
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
  });

  // Use React Query to fetch and cache the profile data
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['/api/profile'],
    queryFn: async () => {
      try {
        const result = await LinkedInAPI.getProfile();
        return result.profile;
      } catch (error) {
        console.error('Error fetching profile:', error);
        return null;
      }
    },
    retry: 0, // Don't retry on 401 unauthorized
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: LinkedInAPI.logout,
    onSuccess: () => {
      setAuthState({
        user: null,
        loading: false,
        error: null,
      });
    },
    onError: (error: Error) => {
      console.error('Error logging out:', error);
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to logout',
      }));
    },
  });

  // Update state when data changes
  useEffect(() => {
    if (!isLoading) {
      setAuthState({
        user: data || null,
        loading: false,
        error: error ? (error as Error).message : null,
      });
    }
  }, [data, isLoading, error]);

  return {
    ...authState,
    login: LinkedInAPI.login,
    logout: async () => {
      setAuthState(prev => ({ ...prev, loading: true }));
      await logoutMutation.mutateAsync();
    },
    refreshProfile: async () => {
      setAuthState(prev => ({ ...prev, loading: true }));
      await refetch();
    },
  };
};