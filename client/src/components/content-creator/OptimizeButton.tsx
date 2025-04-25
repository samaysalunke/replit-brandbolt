import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Sparkles, ThumbsUp, Globe, Users, Award } from 'lucide-react';
import { useContent, OptimizePostData, OptimizedPost } from '@/hooks/useContent';
import { Separator } from '@/components/ui/separator';
import { Loader2 } from 'lucide-react';

interface OptimizeButtonProps {
  content: string;
  onApplyOptimized: (optimizedContent: string) => void;
  disabled?: boolean;
}

export function OptimizeButton({ content, onApplyOptimized, disabled = false }: OptimizeButtonProps) {
  const [open, setOpen] = useState(false);
  const [optimizationGoal, setOptimizationGoal] = useState<'engagement' | 'connections' | 'visibility' | 'thought-leadership'>('engagement');
  const [optimizedResult, setOptimizedResult] = useState<OptimizedPost | null>(null);
  const { optimizePost, isOptimizing } = useContent();

  const handleOptimize = async () => {
    if (!content.trim()) return;
    
    try {
      const data: OptimizePostData = {
        content,
        goal: optimizationGoal
      };
      
      const result = await optimizePost(data);
      setOptimizedResult(result);
    } catch (error) {
      console.error('Error optimizing post:', error);
    }
  };

  const handleApply = () => {
    if (optimizedResult) {
      onApplyOptimized(optimizedResult.optimizedContent);
      setOpen(false);
    }
  };

  return (
    <>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={() => setOpen(true)}
        disabled={disabled || !content.trim()}
        className="gap-2"
      >
        <Sparkles className="h-4 w-4" />
        AI Optimize
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>AI Post Optimization</DialogTitle>
            <DialogDescription>
              Use AI to optimize your LinkedIn post for better engagement and results.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-2">
            <Tabs 
              defaultValue="engagement" 
              value={optimizationGoal}
              onValueChange={(value) => setOptimizationGoal(value as any)}
              className="w-full"
            >
              <TabsList className="grid grid-cols-4 w-full">
                <TabsTrigger value="engagement" className="flex items-center gap-2">
                  <ThumbsUp className="h-4 w-4" />
                  <span className="hidden sm:inline">Engagement</span>
                </TabsTrigger>
                <TabsTrigger value="connections" className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span className="hidden sm:inline">Connections</span>
                </TabsTrigger>
                <TabsTrigger value="visibility" className="flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  <span className="hidden sm:inline">Visibility</span>
                </TabsTrigger>
                <TabsTrigger value="thought-leadership" className="flex items-center gap-2">
                  <Award className="h-4 w-4" />
                  <span className="hidden sm:inline">Leadership</span>
                </TabsTrigger>
              </TabsList>
            </Tabs>
            
            <div className="flex flex-col space-y-4">
              <div>
                <h3 className="text-sm font-medium mb-2">Original Content</h3>
                <Textarea value={content} readOnly className="h-32" />
              </div>
              
              <Separator />
              
              {isOptimizing ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <span className="ml-2">Optimizing your content with AI...</span>
                </div>
              ) : optimizedResult ? (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium mb-2">Optimized Content</h3>
                    <Textarea value={optimizedResult.optimizedContent} readOnly className="h-32" />
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium mb-2">Suggestions for Further Improvement</h3>
                    <ul className="list-disc pl-5 space-y-1">
                      {optimizedResult.suggestions.map((suggestion, index) => (
                        <li key={index} className="text-sm">{suggestion}</li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="bg-secondary/50 p-3 rounded-md">
                    <p className="text-sm font-medium">Estimated Improvement: <span className="text-primary">{optimizedResult.estimatedImprovement}</span></p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">Click the button below to optimize your content</p>
                </div>
              )}
            </div>
          </div>
          
          <DialogFooter className="flex space-x-2 justify-end">
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            {optimizedResult ? (
              <Button onClick={handleApply}>Apply Optimized Content</Button>
            ) : (
              <Button onClick={handleOptimize} disabled={isOptimizing}>
                {isOptimizing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Optimize with AI
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}