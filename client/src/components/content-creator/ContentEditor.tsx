import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { apiRequest } from '@/lib/queryClient';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { 
  Image, 
  Video, 
  File, 
  Smile, 
  Link2, 
  AtSign, 
  Hash,
  Save,
  Wand2
} from 'lucide-react';

export default function ContentEditor() {
  const { toast } = useToast();
  const [postType, setPostType] = useState('text');
  const [content, setContent] = useState('');
  
  const saveDraftMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest('POST', '/api/posts', {
        content,
        postType,
        status: 'draft',
        hashtags: [],
        mediaUrls: []
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/posts'] });
      toast({
        title: "Draft saved",
        description: "Your post has been saved as a draft."
      });
    },
    onError: () => {
      toast({
        title: "Failed to save draft",
        description: "There was an error saving your draft.",
        variant: "destructive"
      });
    }
  });
  
  const optimizeContentMutation = useMutation({
    mutationFn: async () => {
      // This would connect to AI optimization in real implementation
      return await new Promise(resolve => setTimeout(resolve, 1000));
    },
    onSuccess: () => {
      toast({
        title: "Content optimized",
        description: "Your content has been analyzed and optimized for engagement."
      });
    },
    onError: () => {
      toast({
        title: "Optimization failed",
        description: "There was an error optimizing your content.",
        variant: "destructive"
      });
    }
  });
  
  const postNowMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest('POST', '/api/posts', {
        content,
        postType,
        status: 'published',
        publishedAt: new Date(),
        hashtags: [],
        mediaUrls: []
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/posts'] });
      toast({
        title: "Post created",
        description: "Your post has been created successfully."
      });
      setContent('');
    },
    onError: () => {
      toast({
        title: "Failed to create post",
        description: "There was an error creating your post.",
        variant: "destructive"
      });
    }
  });
  
  const handleSaveDraft = () => {
    if (!content.trim()) {
      toast({
        title: "Empty content",
        description: "Please add some content before saving a draft.",
        variant: "destructive"
      });
      return;
    }
    saveDraftMutation.mutate();
  };
  
  const handleOptimizeContent = () => {
    if (!content.trim()) {
      toast({
        title: "Empty content",
        description: "Please add some content before optimizing.",
        variant: "destructive"
      });
      return;
    }
    optimizeContentMutation.mutate();
  };
  
  const handlePostNow = () => {
    if (!content.trim()) {
      toast({
        title: "Empty content",
        description: "Please add some content before posting.",
        variant: "destructive"
      });
      return;
    }
    postNowMutation.mutate();
  };
  
  return (
    <Card className="shadow-sm">
      <CardContent className="p-6">
        <div className="mb-4">
          <Select defaultValue={postType} onValueChange={setPostType}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select post type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="text">Text Post</SelectItem>
              <SelectItem value="image">Image Post</SelectItem>
              <SelectItem value="document">Document Post</SelectItem>
              <SelectItem value="poll">Poll</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="mb-4">
          <Textarea 
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What do you want to talk about?"
            className="min-h-[160px] resize-none"
          />
        </div>
        <div className="flex flex-wrap gap-2 mb-4">
          <Button variant="outline" size="icon" className="rounded-md h-10 w-10">
            <Image className="h-5 w-5 text-muted-foreground" />
          </Button>
          <Button variant="outline" size="icon" className="rounded-md h-10 w-10">
            <Video className="h-5 w-5 text-muted-foreground" />
          </Button>
          <Button variant="outline" size="icon" className="rounded-md h-10 w-10">
            <File className="h-5 w-5 text-muted-foreground" />
          </Button>
          <Button variant="outline" size="icon" className="rounded-md h-10 w-10">
            <Smile className="h-5 w-5 text-muted-foreground" />
          </Button>
          <Button variant="outline" size="icon" className="rounded-md h-10 w-10">
            <Link2 className="h-5 w-5 text-muted-foreground" />
          </Button>
          <Button variant="outline" size="icon" className="rounded-md h-10 w-10">
            <AtSign className="h-5 w-5 text-muted-foreground" />
          </Button>
          <Button variant="outline" size="icon" className="rounded-md h-10 w-10">
            <Hash className="h-5 w-5 text-muted-foreground" />
          </Button>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              onClick={handleSaveDraft}
              disabled={saveDraftMutation.isPending}
              className="gap-1"
            >
              <Save className="h-4 w-4" /> Save Draft
            </Button>
            <Button 
              variant="secondary" 
              onClick={handleOptimizeContent}
              disabled={optimizeContentMutation.isPending}
              className="gap-1"
            >
              <Wand2 className="h-4 w-4" /> Optimize Content
            </Button>
          </div>
          <div>
            <Button 
              onClick={handlePostNow}
              disabled={postNowMutation.isPending}
            >
              Post Now
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
