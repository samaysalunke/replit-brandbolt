import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { CalendarIcon, ImageIcon, Hash, Plus, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useContent, CreatePostData } from '@/hooks/useContent';
import { OptimizeButton } from './OptimizeButton';

// Define the form schema
const postFormSchema = z.object({
  content: z.string().min(1, "Content is required"),
  postType: z.string().min(1, "Post type is required"),
  hashtags: z.array(z.string()).optional(),
  mediaUrls: z.array(z.string()).optional(),
  scheduledFor: z.date().optional().nullable(),
  status: z.enum(['draft', 'scheduled', 'published']),
});

type PostFormValues = z.infer<typeof postFormSchema>;

interface ContentFormProps {
  onSuccess?: () => void;
}

export function ContentForm({ onSuccess }: ContentFormProps) {
  const { createPost, isCreating } = useContent();
  const [hashtagInput, setHashtagInput] = useState('');
  
  // Initialize form with default values
  const form = useForm<PostFormValues>({
    resolver: zodResolver(postFormSchema),
    defaultValues: {
      content: '',
      postType: 'text',
      hashtags: [],
      mediaUrls: [],
      scheduledFor: null,
      status: 'draft',
    },
  });
  
  const onSubmit = (data: PostFormValues) => {
    createPost(data as CreatePostData);
    if (onSuccess) {
      onSuccess();
    }
    form.reset();
  };
  
  const addHashtag = () => {
    if (hashtagInput.trim()) {
      const tag = hashtagInput.trim().startsWith('#') ? hashtagInput.trim() : `#${hashtagInput.trim()}`;
      const currentTags = form.getValues('hashtags') || [];
      if (!currentTags.includes(tag)) {
        form.setValue('hashtags', [...currentTags, tag]);
      }
      setHashtagInput('');
    }
  };
  
  const removeHashtag = (tag: string) => {
    const currentTags = form.getValues('hashtags') || [];
    form.setValue('hashtags', currentTags.filter(t => t !== tag));
  };
  
  const handleOptimizedContent = (optimizedContent: string) => {
    form.setValue('content', optimizedContent);
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Tabs defaultValue="compose" className="w-full">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="compose">Compose</TabsTrigger>
            <TabsTrigger value="schedule">Schedule</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="compose" className="space-y-4">
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Post Content</FormLabel>
                  <FormControl>
                    <div className="space-y-2">
                      <Textarea 
                        placeholder="What do you want to share on LinkedIn?" 
                        className="min-h-[200px]" 
                        {...field} 
                      />
                      <div className="flex justify-end">
                        <OptimizeButton 
                          content={field.value} 
                          onApplyOptimized={handleOptimizedContent} 
                          disabled={isCreating}
                        />
                      </div>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="hashtags"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Hashtags</FormLabel>
                  <FormControl>
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <Input 
                          placeholder="Add hashtag (e.g. #marketing)" 
                          value={hashtagInput}
                          onChange={(e) => setHashtagInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              addHashtag();
                            }
                          }}
                        />
                        <Button 
                          type="button" 
                          variant="outline" 
                          size="icon" 
                          onClick={addHashtag}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      {field.value && field.value.length > 0 ? (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {field.value.map((tag, index) => (
                            <div 
                              key={index}
                              className="flex items-center gap-1 bg-secondary text-secondary-foreground rounded-full px-3 py-1 text-sm"
                            >
                              <Hash className="h-3 w-3" />
                              <span>{tag.replace('#', '')}</span>
                              <Button 
                                type="button" 
                                variant="ghost" 
                                size="icon" 
                                className="h-4 w-4 rounded-full ml-1 hover:bg-destructive hover:text-destructive-foreground"
                                onClick={() => removeHashtag(tag)}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground mt-2">No hashtags added yet</p>
                      )}
                    </div>
                  </FormControl>
                  <FormDescription>
                    Add relevant hashtags to increase your post's visibility
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="mediaUrls"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Media</FormLabel>
                  <FormControl>
                    <div className="border border-dashed border-gray-300 rounded-md p-6 text-center cursor-pointer hover:bg-secondary/50 transition-colors">
                      <ImageIcon className="h-8 w-8 mx-auto text-muted-foreground" />
                      <p className="text-sm text-muted-foreground mt-2">
                        Upload images or videos (coming soon)
                      </p>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </TabsContent>
          
          <TabsContent value="schedule" className="space-y-4">
            <FormField
              control={form.control}
              name="scheduledFor"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Schedule Post</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Schedule a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value || undefined}
                        onSelect={field.onChange}
                        disabled={(date) => date < new Date()}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormDescription>
                    Choose when to publish your post on LinkedIn
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Post Status</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select post status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="scheduled">Scheduled</SelectItem>
                      <SelectItem value="published">Publish Now</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Set the status for your post
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </TabsContent>
          
          <TabsContent value="settings" className="space-y-4">
            <FormField
              control={form.control}
              name="postType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Post Type</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select post type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="text">Text Post</SelectItem>
                      <SelectItem value="article">Article</SelectItem>
                      <SelectItem value="poll">Poll (Coming Soon)</SelectItem>
                      <SelectItem value="document">Document (Coming Soon)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Select the type of content you want to post
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </TabsContent>
        </Tabs>
        
        <div className="flex justify-end gap-2">
          <Button 
            type="button"
            variant="outline"
            onClick={() => form.reset()}
            disabled={isCreating}
          >
            Cancel
          </Button>
          <Button 
            type="submit"
            disabled={isCreating}
          >
            {isCreating ? 'Creating...' : 'Create Post'}
          </Button>
        </div>
      </form>
    </Form>
  );
}