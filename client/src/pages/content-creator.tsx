import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ContentForm } from '@/components/content-creator/ContentForm';
import CalendarPreview from '@/components/content-creator/CalendarPreview';
import { ContentSuggestions } from '@/components/content-creator/ContentSuggestions';
import { useContent } from '@/hooks/useContent';
import { CalendarIcon, PlusCircle, Clock, AlignLeft } from 'lucide-react';

export default function ContentCreator() {
  const { getDraftPosts, getScheduledPosts, getPublishedPosts } = useContent();
  const [activeTab, setActiveTab] = useState<string>('create');

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      <header className="mb-6">
        <h1 className="text-2xl font-bold">Content Creator</h1>
        <p className="text-muted-foreground">Create and optimize LinkedIn posts with AI assistance</p>
      </header>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content Area */}
        <div className="lg:col-span-2">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-3 mb-4">
              <TabsTrigger value="create" className="flex items-center gap-2">
                <PlusCircle className="h-4 w-4" />
                Create
              </TabsTrigger>
              <TabsTrigger value="drafts" className="flex items-center gap-2">
                <AlignLeft className="h-4 w-4" />
                Drafts ({getDraftPosts().length})
              </TabsTrigger>
              <TabsTrigger value="scheduled" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Scheduled ({getScheduledPosts().length})
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="create">
              <Card>
                <CardHeader>
                  <CardTitle>Create LinkedIn Post</CardTitle>
                  <CardDescription>
                    Craft a new post with AI-powered optimization for maximum engagement
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ContentForm />
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="drafts">
              <Card>
                <CardHeader>
                  <CardTitle>Draft Posts</CardTitle>
                  <CardDescription>
                    Your saved drafts that are ready to be published
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {getDraftPosts().length > 0 ? (
                    <div className="space-y-4">
                      {getDraftPosts().map(post => (
                        <div 
                          key={post.id} 
                          className="p-4 border rounded-lg hover:bg-accent/50 cursor-pointer transition-colors"
                        >
                          <p className="font-medium truncate">{post.content.substring(0, 80)}...</p>
                          <div className="flex items-center text-xs text-muted-foreground mt-2">
                            <AlignLeft className="h-3 w-3 mr-1" />
                            <span>Draft • </span>
                            <span className="ml-1">{new Date(post.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <AlignLeft className="h-10 w-10 mx-auto mb-2 opacity-30" />
                      <p>No draft posts yet</p>
                      <p className="text-sm">Create a post and save it as a draft to see it here</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="scheduled">
              <Card>
                <CardHeader>
                  <CardTitle>Scheduled Posts</CardTitle>
                  <CardDescription>
                    Posts scheduled to be published at a future date
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {getScheduledPosts().length > 0 ? (
                    <div className="space-y-4">
                      {getScheduledPosts().map(post => (
                        <div 
                          key={post.id} 
                          className="p-4 border rounded-lg hover:bg-accent/50 cursor-pointer transition-colors"
                        >
                          <p className="font-medium truncate">{post.content.substring(0, 80)}...</p>
                          <div className="flex items-center text-xs text-muted-foreground mt-2">
                            <Clock className="h-3 w-3 mr-1" />
                            <span>Scheduled for • </span>
                            <span className="ml-1">{post.scheduledFor && new Date(post.scheduledFor).toLocaleDateString()}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Clock className="h-10 w-10 mx-auto mb-2 opacity-30" />
                      <p>No scheduled posts yet</p>
                      <p className="text-sm">Schedule a post to see it here</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
        
        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CalendarIcon className="h-5 w-5 mr-2" />
                Content Calendar
              </CardTitle>
              <CardDescription>
                Your scheduled posts and content plan
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CalendarPreview />
            </CardContent>
          </Card>
          
          {/* Added Content Suggestions section */}
          {activeTab === 'create' && (
            <div className="mt-6">
              <ContentSuggestions 
                onUseSuggestion={(content) => {
                  // We'll implement this functionality later to auto-fill the content form
                  console.log("Using suggestion:", content);
                }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
