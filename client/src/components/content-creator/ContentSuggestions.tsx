import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { RefreshCw, Sparkles, Copy, Check, Loader2 } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface ContentSuggestion {
  id: number;
  title: string;
  content: string;
  category: string;
  estimatedEngagement: string;
}

interface ContentSuggestionsProps {
  onUseSuggestion?: (content: string) => void;
}

export function ContentSuggestions({ onUseSuggestion }: ContentSuggestionsProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedId, setSelectedId] = useState<number | null>(null);
  
  // Query content suggestions
  const { data: suggestions = [], isLoading, isError } = useQuery<ContentSuggestion[]>({
    queryKey: ['/api/content-suggestions'],
  });

  // Generate new suggestions
  const generateSuggestionsMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest('POST', '/api/content-suggestions/generate', undefined);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/content-suggestions'] });
      toast({
        title: "New ideas generated",
        description: "Fresh content suggestions are ready for you"
      });
    },
    onError: () => {
      toast({
        title: "Failed to generate suggestions",
        description: "There was an error generating content ideas",
        variant: "destructive"
      });
    }
  });

  // Mark a suggestion as used
  const useSuggestionMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest('PUT', `/api/content-suggestions/${id}`, { used: true });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/content-suggestions'] });
    }
  });

  const handleUseSuggestion = (suggestion: ContentSuggestion) => {
    if (onUseSuggestion) {
      onUseSuggestion(suggestion.content);
      useSuggestionMutation.mutate(suggestion.id);
      setSelectedId(suggestion.id);
      
      setTimeout(() => {
        setSelectedId(null);
      }, 2000);
    }
  };

  // Get engagement color based on level
  const getEngagementColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'high':
        return 'text-green-500';
      case 'very-high':
        return 'text-purple-500';
      case 'medium':
        return 'text-yellow-500';
      default:
        return 'text-gray-500';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Sparkles className="h-5 w-5 mr-2 text-primary" />
          AI Content Ideas
        </CardTitle>
        <CardDescription>
          Use these AI-generated ideas as inspiration for your LinkedIn posts
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : isError ? (
          <div className="text-center py-10">
            <p className="text-destructive">Failed to load content suggestions</p>
          </div>
        ) : suggestions.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-muted-foreground">No content suggestions available</p>
            <p className="text-sm text-muted-foreground mt-1">Click 'Generate Ideas' to get started</p>
          </div>
        ) : (
          <div className="space-y-4">
            {suggestions.map((suggestion) => (
              <div key={suggestion.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">{suggestion.title}</h3>
                  <div className="flex items-center gap-1">
                    <span 
                      className={`text-xs font-medium ${getEngagementColor(suggestion.estimatedEngagement)}`}
                    >
                      {suggestion.estimatedEngagement.charAt(0).toUpperCase() + suggestion.estimatedEngagement.slice(1)} Engagement
                    </span>
                    <span className="text-xs bg-secondary text-secondary-foreground px-2 py-0.5 rounded-full">
                      {suggestion.category}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">{suggestion.content}</p>
                <div className="pt-1">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full justify-start"
                    onClick={() => handleUseSuggestion(suggestion)}
                    disabled={suggestion.id === selectedId}
                  >
                    {suggestion.id === selectedId ? (
                      <>
                        <Check className="h-4 w-4 mr-2" />
                        Copied to Editor
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4 mr-2" />
                        Use This Idea
                      </>
                    )}
                  </Button>
                </div>
                <Separator className="mt-3" />
              </div>
            ))}
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button 
          variant="outline" 
          className="w-full"
          onClick={() => generateSuggestionsMutation.mutate()}
          disabled={generateSuggestionsMutation.isPending}
        >
          {generateSuggestionsMutation.isPending ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Generating Ideas...
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4 mr-2" />
              Generate New Ideas
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}