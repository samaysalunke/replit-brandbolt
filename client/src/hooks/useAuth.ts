import { useEffect, useState } from 'react';
import axios from 'axios';
import { Profile } from '../../../shared/schema';

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

  const fetchProfile = async () => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));
      const response = await axios.get('/api/profile', {
        withCredentials: true,
      });
      setAuthState({
        user: response.data.profile,
        loading: false,
        error: null,
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
      setAuthState({
        user: null,
        loading: false,
        error: 'Failed to fetch user profile',
      });
    }
  };

  const logout = async () => {
    try {
      setAuthState(prev => ({ ...prev, loading: true }));
      await axios.post('/api/auth/logout', {}, { withCredentials: true });
      setAuthState({
        user: null,
        loading: false,
        error: null,
      });
    } catch (error) {
      console.error('Error logging out:', error);
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to logout',
      }));
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  return {
    ...authState,
    login: () => {
      window.location.href = '/api/auth/linkedin';
    },
    logout,
    refreshProfile: fetchProfile,
  };
};