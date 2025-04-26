import { apiRequest } from './queryClient';
import { Profile } from '../../../shared/schema';

/**
 * LinkedIn API service for managing all LinkedIn-related API calls
 */
export const LinkedInAPI = {
  /**
   * Initiates the LinkedIn OAuth flow
   */
  login: () => {
    window.location.href = '/api/auth/linkedin';
  },

  /**
   * Logs out the current user
   */
  logout: async () => {
    await apiRequest('POST', '/api/auth/logout');
  },

  /**
   * Gets the current user's profile
   */
  getProfile: async (): Promise<{ profile: Profile }> => {
    const response = await apiRequest('GET', '/api/profile');
    return response.json();
  },

  /**
   * Checks if the user is authenticated
   */
  isAuthenticated: async (): Promise<boolean> => {
    try {
      const response = await fetch('/api/profile', {
        credentials: 'include',
      });
      return response.ok;
    } catch (error) {
      return false;
    }
  }
};