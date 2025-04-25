import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

export function useProfile() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const profileQuery = useQuery({
    queryKey: ['/api/profile'],
  });
  
  const updateProfileMutation = useMutation({
    mutationFn: async (profileData: any) => {
      return await apiRequest('PUT', '/api/profile', profileData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/profile'] });
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully."
      });
    },
    onError: () => {
      toast({
        title: "Failed to update profile",
        description: "There was an error updating your profile.",
        variant: "destructive"
      });
    }
  });
  
  const refreshProfileMutation = useMutation({
    mutationFn: async () => {
      // This would fetch the latest data from LinkedIn API in a real implementation
      return await apiRequest('GET', '/api/profile?refresh=true', undefined);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/profile'] });
      toast({
        title: "Profile refreshed",
        description: "Your profile data has been updated with the latest information."
      });
    },
    onError: () => {
      toast({
        title: "Refresh failed",
        description: "There was an error refreshing your profile data.",
        variant: "destructive"
      });
    }
  });
  
  const updateProfile = (data: any) => {
    updateProfileMutation.mutate(data);
  };
  
  const refreshProfile = () => {
    refreshProfileMutation.mutate();
  };
  
  return {
    ...profileQuery,
    updateProfile,
    refreshProfile,
    isUpdating: updateProfileMutation.isPending,
    isRefreshing: refreshProfileMutation.isPending
  };
}
