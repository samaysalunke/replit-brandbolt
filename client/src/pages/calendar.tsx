import { useState } from 'react';
import { useContent } from '@/hooks/useContent';
import { 
  Card, 
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  CalendarIcon, 
  Plus, 
  List, 
  Grid, 
  LayoutGrid 
} from 'lucide-react';
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isToday,
  isSameMonth,
  getDay,
  addMonths,
  subMonths,
  parseISO
} from 'date-fns';

export default function Calendar() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [view, setView] = useState<'month' | 'list'>('month');
  const { data: posts = [], isLoading } = useContent();
  
  const scheduledPosts = posts.filter(post => post.status === 'scheduled');
  
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  
  const handlePreviousMonth = () => {
    setCurrentMonth(prev => subMonths(prev, 1));
  };
  
  const handleNextMonth = () => {
    setCurrentMonth(prev => addMonths(prev, 1));
  };
  
  const getPostsForDay = (date: Date) => {
    return scheduledPosts.filter(post => {
      if (!post.scheduledFor) return false;
      const postDate = parseISO(post.scheduledFor);
      return (
        postDate.getDate() === date.getDate() &&
        postDate.getMonth() === date.getMonth() &&
        postDate.getFullYear() === date.getFullYear()
      );
    });
  };
  
  // Get day of week names
  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  
  // Get empty cells before start of month
  const firstDayOfMonth = getDay(monthStart);
  const emptyDaysBefore = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;
  
  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      <header className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Content Calendar</h1>
          <p className="text-muted-foreground">Schedule and manage your LinkedIn content</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" /> Create Post
        </Button>
      </header>
      
      <Card className="shadow-sm mb-6">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <div className="flex space-x-2 items-center">
              <CalendarIcon className="h-5 w-5 text-muted-foreground" />
              <CardTitle>Content Schedule</CardTitle>
            </div>
            <div className="flex space-x-2">
              <Button variant="ghost" size="sm" onClick={handlePreviousMonth}>Previous</Button>
              <div className="font-medium">{format(currentMonth, 'MMMM yyyy')}</div>
              <Button variant="ghost" size="sm" onClick={handleNextMonth}>Next</Button>
            </div>
          </div>
          <CardDescription>
            Manage and schedule your LinkedIn content from a single calendar
          </CardDescription>
          <div className="flex justify-between mt-3">
            <Tabs defaultValue="month" className="w-[200px]">
              <TabsList>
                <TabsTrigger value="month" onClick={() => setView('month')}>
                  <LayoutGrid className="h-4 w-4 mr-1" /> Month
                </TabsTrigger>
                <TabsTrigger value="list" onClick={() => setView('list')}>
                  <List className="h-4 w-4 mr-1" /> List
                </TabsTrigger>
              </TabsList>
            </Tabs>
            <Button variant="outline" size="sm">Today</Button>
          </div>
        </CardHeader>
        <CardContent>
          {view === 'month' ? (
            <>
              <div className="grid grid-cols-7 gap-1 mb-2">
                {weekDays.map(day => (
                  <div key={day} className="text-center text-xs font-medium text-muted-foreground p-2">{day}</div>
                ))}
              </div>
              
              <div className="grid grid-cols-7 gap-1">
                {/* Empty cells before start of month */}
                {Array.from({ length: emptyDaysBefore }).map((_, index) => (
                  <div key={`empty-before-${index}`} className="aspect-square border border-muted rounded-md flex flex-col opacity-40" />
                ))}
                
                {/* Days of month */}
                {days.map(day => {
                  const isCurrentDay = isToday(day);
                  const dayPosts = getPostsForDay(day);
                  
                  return (
                    <div 
                      key={day.toString()} 
                      className={`min-h-[100px] border rounded-md flex flex-col ${isCurrentDay ? 'bg-secondary/50 border-muted-foreground/30' : 'border-muted'}`}
                    >
                      <div className={`text-xs p-2 text-right ${isCurrentDay ? 'font-medium' : ''}`}>
                        {format(day, 'd')}
                      </div>
                      <div className="flex-1 p-1">
                        {dayPosts.map((post, idx) => (
                          <div 
                            key={post.id} 
                            className="text-xs p-1 mb-1 bg-primary/10 rounded truncate"
                            title={post.content}
                          >
                            {post.scheduledFor && format(parseISO(post.scheduledFor), 'h:mm a')} - {post.content.substring(0, 15)}...
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="divide-y">
              {scheduledPosts.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No scheduled posts yet.</p>
                  <Button variant="outline" className="mt-4">Create Your First Post</Button>
                </div>
              ) : (
                scheduledPosts.map(post => (
                  <div key={post.id} className="py-3 flex justify-between items-center">
                    <div>
                      <p className="font-medium">{post.content.substring(0, 60)}...</p>
                      <p className="text-xs text-muted-foreground">
                        {post.scheduledFor ? format(parseISO(post.scheduledFor), 'MMM d, yyyy - h:mm a') : 'Not scheduled'}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">Edit</Button>
                      <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">Delete</Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
