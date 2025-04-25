import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, getDay } from 'date-fns';

export default function CalendarPreview() {
  const today = new Date();
  const monthStart = startOfMonth(today);
  const monthEnd = endOfMonth(today);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  
  // Mock scheduled posts
  const scheduledPosts = [
    { date: new Date(today.getFullYear(), today.getMonth(), 12), type: 'primary' },
    { date: new Date(today.getFullYear(), today.getMonth(), 14), type: 'warning' },
    { date: new Date(today.getFullYear(), today.getMonth(), 16), type: 'primary' },
    { date: new Date(today.getFullYear(), today.getMonth(), 21), type: 'primary' },
    { date: new Date(today.getFullYear(), today.getMonth(), 23), type: 'success' },
    { date: new Date(today.getFullYear(), today.getMonth(), 28), type: 'warning' }
  ];
  
  const hasPostScheduled = (date: Date) => {
    return scheduledPosts.find(post => 
      post.date.getDate() === date.getDate() && 
      post.date.getMonth() === date.getMonth() && 
      post.date.getFullYear() === date.getFullYear()
    );
  };
  
  const getPostType = (date: Date) => {
    const post = scheduledPosts.find(post => 
      post.date.getDate() === date.getDate() && 
      post.date.getMonth() === date.getMonth() && 
      post.date.getFullYear() === date.getFullYear()
    );
    return post ? post.type : null;
  };
  
  const getDotColor = (type: string | null) => {
    if (!type) return '';
    
    switch (type) {
      case 'primary':
        return 'bg-primary';
      case 'warning':
        return 'bg-amber-500';
      case 'success':
        return 'bg-success';
      default:
        return 'bg-primary';
    }
  };
  
  // Get day of week names
  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  
  // Get empty cells before start of month
  const firstDayOfMonth = getDay(monthStart);
  const emptyDaysBefore = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;
  
  return (
    <Card className="shadow-sm mt-6">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold">Content Calendar Preview</h2>
          <Button variant="link" className="text-primary px-0">View Full Calendar</Button>
        </div>
        
        <div className="grid grid-cols-7 gap-1 mb-2">
          {weekDays.map(day => (
            <div key={day} className="text-center text-xs text-muted-foreground">{day}</div>
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
            const postType = getPostType(day);
            
            return (
              <div 
                key={day.toString()} 
                className={`aspect-square border rounded-md flex flex-col ${isCurrentDay ? 'bg-secondary/50 border-muted-foreground/30' : 'border-muted'}`}
              >
                <div className={`text-xs p-1 text-right ${isCurrentDay ? 'font-medium' : ''}`}>
                  {format(day, 'd')}
                </div>
                <div className="flex-1 flex items-center justify-center">
                  {hasPostScheduled(day) && (
                    <div className={`w-2 h-2 rounded-full ${getDotColor(postType)}`} />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
