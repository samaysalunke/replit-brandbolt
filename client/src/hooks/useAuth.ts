import { useState } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';

interface UserData {
  id: number;
  username: string;
  email: string;
  fullName: string;
  linkedinId?: string;
  accessToken?: string;
  isConnected?: boolean;
  profileImage?: string;
  headline?: string;
  createdAt: string;
}

interface AuthResponse {
  message: string;
  user: UserData;
}

interface LoginCredentials {
  username: string;
  password: string;
}

interface RegisterCredentials extends LoginCredentials {
  email?: string;
  fullName?: string;
}

interface LinkedInProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  profilePicture: string | null;
  headline: string | null;
}

export function useAuth() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  
  const loginMutation = useMutation<AuthResponse, Error, LoginCredentials>({
    mutationFn: async (credentials: LoginCredentials) => {
      const response = await apiRequest('POST', '/api/auth/login', credentials);
      const data = await response.json();
      return data as AuthResponse;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
      toast({
        title: "Login successful",
        description: "You have successfully logged in"
      });
      setLocation('/dashboard');
    },
    onError: (error) => {
      toast({
        title: "Login failed",
        description: "Invalid username or password",
        variant: "destructive"
      });
    }
  });
  
  // Type the register mutation variables
  const registerMutation = useMutation<{message: string}, Error, RegisterCredentials>({
    mutationFn: async (credentials: RegisterCredentials) => {
      const response = await apiRequest('POST', '/api/auth/register', credentials);
      const data = await response.json();
      return data as {message: string};
    },
    onSuccess: (data, variables) => {
      toast({
        title: "Registration successful",
        description: "Your account has been created. You can now log in."
      });
      // Use the variables directly from the onSuccess parameters
      loginMutation.mutate({ 
        username: variables.username, 
        password: variables.password 
      });
    },
    onError: (error) => {
      toast({
        title: "Registration failed",
        description: "There was an error creating your account",
        variant: "destructive"
      });
    }
  });
  
  const logoutMutation = useMutation<{message: string}, Error, void>({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/auth/logout', {});
      const data = await response.json();
      return data as {message: string};
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
      queryClient.clear();
      toast({
        title: "Logout successful",
        description: "You have been logged out"
      });
      setLocation('/auth');
    },
    onError: () => {
      toast({
        title: "Logout failed",
        description: "There was an error logging out",
        variant: "destructive"
      });
    }
  });
  
  const login = (credentials: LoginCredentials) => {
    setIsLoading(true);
    loginMutation.mutate(credentials);
  };
  
  const register = (credentials: RegisterCredentials) => {
    setIsLoading(true);
    registerMutation.mutate(credentials);
  };
  
  const logout = () => {
    logoutMutation.mutate();
  };
  
  // Get current user with proper type definitions
  const { data: userData, isLoading: isUserLoading } = useQuery<{ user: UserData } | null>({
    queryKey: ['/api/auth/user'],
    enabled: true,
    retry: false,
  });

  // Fetch LinkedIn profile data with proper type
  const linkedinProfileQuery = useQuery<LinkedInProfile>({
    queryKey: ['/api/auth/linkedin/profile'],
    // Only query if the user is connected to LinkedIn and has an access token
    enabled: !!(userData?.user?.isConnected && userData?.user?.accessToken),
    refetchOnWindowFocus: false,
  });

  return {
    login,
    register,
    logout,
    currentUser: userData?.user, 
    isAuthenticated: !!userData?.user,
    linkedinProfile: linkedinProfileQuery.data,
    isLoading: isLoading || loginMutation.isPending || registerMutation.isPending || 
               logoutMutation.isPending || isUserLoading || linkedinProfileQuery.isLoading
  };
}
