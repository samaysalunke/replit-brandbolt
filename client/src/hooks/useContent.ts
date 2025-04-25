import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

export interface Post {
  id: number;
  content: string;
  postType: string;
  hashtags: string[];
  mediaUrls: string[];
  scheduledFor: string | null;
  publishedAt: string | null;
  status: 'draft' | 'scheduled' | 'published';
  engagementData: any | null;
  linkedinPostId: string | null;
  createdAt: string;
}

export interface CreatePostData {
  content: string;
  postType: string;
  hashtags?: string[];
  mediaUrls?: string[];
  scheduledFor?: Date | null;
  status: 'draft' | 'scheduled' | 'published';
}

export function useContent() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const postsQuery = useQuery<Post[]>({
    queryKey: ['/api/posts'],
  });
  
  const createPostMutation = useMutation({
    mutationFn: async (postData: CreatePostData) => {
      return await apiRequest('POST', '/api/posts', postData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/posts'] });
      toast({
        title: "Post created",
        description: "Your post has been created successfully."
      });
    },
    onError: () => {
      toast({
        title: "Failed to create post",
        description: "There was an error creating your post.",
        variant: "destructive"
      });
    }
  });
  
  const updatePostMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<Post> }) => {
      return await apiRequest('PUT', `/api/posts/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/posts'] });
      toast({
        title: "Post updated",
        description: "Your post has been updated successfully."
      });
    },
    onError: () => {
      toast({
        title: "Failed to update post",
        description: "There was an error updating your post.",
        variant: "destructive"
      });
    }
  });
  
  const deletePostMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest('DELETE', `/api/posts/${id}`, undefined);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/posts'] });
      toast({
        title: "Post deleted",
        description: "Your post has been deleted successfully."
      });
    },
    onError: () => {
      toast({
        title: "Failed to delete post",
        description: "There was an error deleting your post.",
        variant: "destructive"
      });
    }
  });
  
  const createPost = (data: CreatePostData) => {
    createPostMutation.mutate(data);
  };
  
  const updatePost = (id: number, data: Partial<Post>) => {
    updatePostMutation.mutate({ id, data });
  };
  
  const deletePost = (id: number) => {
    deletePostMutation.mutate(id);
  };
  
  const getDraftPosts = () => {
    return postsQuery.data?.filter(post => post.status === 'draft') || [];
  };
  
  const getScheduledPosts = () => {
    return postsQuery.data?.filter(post => post.status === 'scheduled') || [];
  };
  
  const getPublishedPosts = () => {
    return postsQuery.data?.filter(post => post.status === 'published') || [];
  };
  
  return {
    ...postsQuery,
    createPost,
    updatePost,
    deletePost,
    getDraftPosts,
    getScheduledPosts,
    getPublishedPosts,
    isCreating: createPostMutation.isPending,
    isUpdating: updatePostMutation.isPending,
    isDeleting: deletePostMutation.isPending
  };
}
