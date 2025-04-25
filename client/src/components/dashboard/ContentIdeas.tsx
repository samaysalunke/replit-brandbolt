import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { apiRequest } from '@/lib/queryClient';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type ContentIdea = {
  id: number;
  title: string;
  content: string;
  category: string;
  estimatedEngagement: string;
  isSaved: boolean;
  isUsed: boolean;
};

export default function ContentIdeas() {
  const { toast } = useToast();
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const { data: contentIdeas = [], isLoading } = useQuery<ContentIdea[]>({
    queryKey: ['/api/content-suggestions'],
  });
  
  const refreshMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest('POST', '/api/content-suggestions/generate', {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/content-suggestions'] });
      toast({
        title: "Ideas refreshed",
        description: "New content ideas have been generated for you."
      });
      setIsRefreshing(false);
    },
    onError: () => {
      toast({
        title: "Failed to refresh ideas",
        description: "There was an error generating new content ideas.",
        variant: "destructive"
      });
      setIsRefreshing(false);
    }
  });
  
  const updateIdeaMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<ContentIdea> }) => {
      return await apiRequest('PUT', `/api/content-suggestions/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/content-suggestions'] });
    },
    onError: () => {
      toast({
        title: "Failed to update idea",
        description: "There was an error updating the content idea.",
        variant: "destructive"
      });
    }
  });
  
  const handleRefreshIdeas = () => {
    setIsRefreshing(true);
    refreshMutation.mutate();
  };
  
  const handleUseIdea = (idea: ContentIdea) => {
    updateIdeaMutation.mutate({ id: idea.id, data: { isUsed: true } });
    toast({
      title: "Using this idea",
      description: "The content has been copied to the content creator."
    });
    // In a real app, we would navigate to content creator with this idea
  };
  
  const handleSaveIdea = (idea: ContentIdea) => {
    updateIdeaMutation.mutate({ id: idea.id, data: { isSaved: !idea.isSaved } });
  };
  
  const getBorderColor = (engagement: string) => {
    switch (engagement) {
      case 'very-high':
        return 'border-l-success';
      case 'high':
        return 'border-l-primary';
      case 'medium':
        return 'border-l-amber-400';
      default:
        return 'border-l-primary';
    }
  };
  
  if (isLoading) {
    return (
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">AI-Generated Content Ideas</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="shadow-sm border-l-4 border-l-primary">
              <CardContent className="p-6 h-36 flex items-center justify-center">
                <p className="text-muted-foreground">Loading content ideas...</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }
  
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">AI-Generated Content Ideas</h2>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleRefreshIdeas}
          disabled={isRefreshing}
          className="gap-1 text-primary"
        >
          Refresh Ideas <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {contentIdeas.map((idea) => (
          <Card 
            key={idea.id} 
            className={`shadow-sm border-l-4 ${getBorderColor(idea.estimatedEngagement)}`}
          >
            <CardContent className="p-4">
              <h3 className="font-medium text-sm mb-2">{idea.title}</h3>
              <p className="text-sm text-muted-foreground mb-3">"{idea.content}"</p>
              <div className="flex justify-between">
                <div className="text-xs text-muted-foreground">
                  Estimated engagement: {idea.estimatedEngagement.charAt(0).toUpperCase() + idea.estimatedEngagement.slice(1)}
                </div>
                <div className="flex space-x-2">
                  <Button 
                    onClick={() => handleUseIdea(idea)}
                    size="sm" 
                    className="text-xs py-1 h-auto"
                  >
                    Use This
                  </Button>
                  <Button 
                    onClick={() => handleSaveIdea(idea)}
                    size="sm" 
                    variant="outline" 
                    className="text-xs py-1 h-auto"
                  >
                    {idea.isSaved ? 'Unsave' : 'Save'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
