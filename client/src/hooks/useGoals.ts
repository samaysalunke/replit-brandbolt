import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

export interface Goal {
  id: number;
  title: string;
  targetValue: number;
  currentValue: number;
  goalType: string;
  startDate: string;
  endDate: string | null;
  isCompleted: boolean;
  createdAt: string;
}

export interface CreateGoalData {
  title: string;
  targetValue: number;
  currentValue?: number;
  goalType: string;
  endDate?: Date | null;
}

export function useGoals() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const goalsQuery = useQuery<Goal[]>({
    queryKey: ['/api/goals'],
  });
  
  const createGoalMutation = useMutation({
    mutationFn: async (goalData: CreateGoalData) => {
      return await apiRequest('POST', '/api/goals', goalData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/goals'] });
      toast({
        title: "Goal created",
        description: "Your goal has been created successfully."
      });
    },
    onError: () => {
      toast({
        title: "Failed to create goal",
        description: "There was an error creating your goal.",
        variant: "destructive"
      });
    }
  });
  
  const updateGoalMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<Goal> }) => {
      return await apiRequest('PUT', `/api/goals/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/goals'] });
      toast({
        title: "Goal updated",
        description: "Your goal has been updated successfully."
      });
    },
    onError: () => {
      toast({
        title: "Failed to update goal",
        description: "There was an error updating your goal.",
        variant: "destructive"
      });
    }
  });
  
  const deleteGoalMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest('DELETE', `/api/goals/${id}`, undefined);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/goals'] });
      toast({
        title: "Goal deleted",
        description: "Your goal has been deleted successfully."
      });
    },
    onError: () => {
      toast({
        title: "Failed to delete goal",
        description: "There was an error deleting your goal.",
        variant: "destructive"
      });
    }
  });
  
  const createGoal = (data: CreateGoalData) => {
    createGoalMutation.mutate(data);
  };
  
  const updateGoal = (id: number, data: Partial<Goal>) => {
    updateGoalMutation.mutate({ id, data });
  };
  
  const deleteGoal = (id: number) => {
    deleteGoalMutation.mutate(id);
  };
  
  const getActiveGoals = () => {
    return goalsQuery.data?.filter(goal => !goal.isCompleted) || [];
  };
  
  const getCompletedGoals = () => {
    return goalsQuery.data?.filter(goal => goal.isCompleted) || [];
  };
  
  return {
    ...goalsQuery,
    createGoal,
    updateGoal,
    deleteGoal,
    getActiveGoals,
    getCompletedGoals,
    isCreating: createGoalMutation.isPending,
    isUpdating: updateGoalMutation.isPending,
    isDeleting: deleteGoalMutation.isPending
  };
}
