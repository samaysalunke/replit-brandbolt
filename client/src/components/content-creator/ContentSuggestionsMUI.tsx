import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Chip,
  CircularProgress,
  Divider,
  IconButton,
  List,
  ListItem,
  Typography
} from '@mui/material';
import {
  AutoAwesome as SparklesIcon,
  Refresh as RefreshIcon,
  ContentCopy as CopyIcon,
  Check as CheckIcon
} from '@mui/icons-material';
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

export function ContentSuggestionsMUI({ onUseSuggestion }: ContentSuggestionsProps) {
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
        return 'success';
      case 'very-high':
        return 'secondary';
      case 'medium':
        return 'warning';
      default:
        return 'default';
    }
  };

  return (
    <Card>
      <CardHeader
        title={
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <SparklesIcon color="primary" sx={{ mr: 1 }} />
            <Typography variant="h6">
              AI Content Ideas
            </Typography>
          </Box>
        }
        subheader="Use these AI-generated ideas as inspiration for your LinkedIn posts"
      />
      
      <CardContent>
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
            <CircularProgress />
          </Box>
        ) : isError ? (
          <Box sx={{ textAlign: 'center', py: 5 }}>
            <Typography color="error">
              Failed to load content suggestions
            </Typography>
          </Box>
        ) : suggestions.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 5 }}>
            <Typography color="text.secondary" gutterBottom>
              No content suggestions available
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Click 'Generate Ideas' to get started
            </Typography>
          </Box>
        ) : (
          <List disablePadding>
            {suggestions.map((suggestion) => (
              <React.Fragment key={suggestion.id}>
                <ListItem sx={{ display: 'block', px: 0, py: 2 }} alignItems="flex-start">
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="subtitle1" component="h3">
                      {suggestion.title}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Chip 
                        label={`${suggestion.estimatedEngagement.charAt(0).toUpperCase() + suggestion.estimatedEngagement.slice(1)} Engagement`}
                        size="small"
                        color={getEngagementColor(suggestion.estimatedEngagement) as any}
                        variant="outlined"
                      />
                      <Chip 
                        label={suggestion.category}
                        size="small"
                        variant="outlined"
                      />
                    </Box>
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {suggestion.content}
                  </Typography>
                  
                  <Button
                    variant="outlined"
                    size="small"
                    fullWidth
                    startIcon={suggestion.id === selectedId ? <CheckIcon /> : <CopyIcon />}
                    onClick={() => handleUseSuggestion(suggestion)}
                    disabled={suggestion.id === selectedId}
                  >
                    {suggestion.id === selectedId ? 'Copied to Editor' : 'Use This Idea'}
                  </Button>
                </ListItem>
                <Divider />
              </React.Fragment>
            ))}
          </List>
        )}
      </CardContent>
      
      <CardActions>
        <Button
          variant="outlined"
          fullWidth
          startIcon={generateSuggestionsMutation.isPending ? <CircularProgress size={20} /> : <RefreshIcon />}
          onClick={() => generateSuggestionsMutation.mutate()}
          disabled={generateSuggestionsMutation.isPending}
        >
          {generateSuggestionsMutation.isPending ? 'Generating Ideas...' : 'Generate New Ideas'}
        </Button>
      </CardActions>
    </Card>
  );
}