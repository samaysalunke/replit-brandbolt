import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';

interface LoginCredentials {
  username: string;
  password: string;
}

interface RegisterCredentials extends LoginCredentials {
  email?: string;
  fullName?: string;
}

export function useAuth() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  
  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      return await apiRequest('POST', '/api/auth/login', credentials);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
      toast({
        title: "Login successful",
        description: "You have successfully logged in"
      });
      setLocation('/');
    },
    onError: (error) => {
      toast({
        title: "Login failed",
        description: "Invalid username or password",
        variant: "destructive"
      });
    }
  });
  
  const registerMutation = useMutation({
    mutationFn: async (credentials: RegisterCredentials) => {
      return await apiRequest('POST', '/api/auth/register', credentials);
    },
    onSuccess: () => {
      toast({
        title: "Registration successful",
        description: "Your account has been created. You can now log in."
      });
      return loginMutation.mutate({ 
        username: registerMutation.variables?.username || '', 
        password: registerMutation.variables?.password || '' 
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
  
  const logoutMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest('POST', '/api/auth/logout', {});
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
  
  return {
    login,
    register,
    logout,
    isLoading: isLoading && (loginMutation.isPending || registerMutation.isPending || logoutMutation.isPending)
  };
}
