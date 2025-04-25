import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CheckCircle, AlertTriangle } from 'lucide-react';

export default function OptimizationPanel() {
  const [selectedDate, setSelectedDate] = useState('');
  
  // Mock content score - this would be calculated from the content in real app
  const contentScore = 65;
  
  // Mock suggestions
  const optimizationTips = [
    {
      type: 'warning',
      title: 'Add more hashtags',
      description: 'Using 3-5 relevant hashtags can increase visibility'
    },
    {
      type: 'success',
      title: 'Good use of questions',
      description: 'Questions encourage engagement'
    },
    {
      type: 'warning',
      title: 'Add visual content',
      description: 'Posts with images get 2x more engagement'
    }
  ];
  
  // Mock AI suggestions
  const aiSuggestions = [
    'Add "What are your thoughts on this?" to encourage comments',
    'Include hashtag #MarketingStrategy to reach relevant audience',
    'Use "Thread 🧵" to indicate more content in comments'
  ];
  
  const renderIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-success" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-muted-foreground" />;
    }
  };
  
  return (
    <Card className="shadow-sm">
      <CardContent className="p-6">
        <h2 className="font-semibold mb-4">Content Optimization</h2>
        
        {/* Score Meter */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm">Content Score</p>
            <p className="text-sm font-medium">Good</p>
          </div>
          <div className="w-full h-2 bg-secondary rounded-full">
            <div 
              className="h-2 rounded-full" 
              style={{ 
                width: `${contentScore}%`, 
                backgroundColor: contentScore >= 80 ? 'hsl(var(--success))' : 
                                 contentScore >= 50 ? 'hsl(var(--chart-4))' : 
                                 'hsl(var(--destructive))'
              }} 
            />
          </div>
        </div>
        
        {/* Optimization Tips */}
        <div className="space-y-4 mb-6">
          {optimizationTips.map((tip, index) => (
            <div key={index} className="p-3 bg-secondary rounded-md">
              <div className="flex items-start">
                {renderIcon(tip.type)}
                <div className="ml-2">
                  <p className="text-sm font-medium">{tip.title}</p>
                  <p className="text-xs text-muted-foreground">{tip.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Content Suggestions */}
        <div className="mt-6">
          <h3 className="text-sm font-medium mb-3">AI Suggestions</h3>
          <div className="space-y-2">
            {aiSuggestions.map((suggestion, index) => (
              <Button 
                key={index}
                variant="outline" 
                className="w-full text-left h-auto py-2 justify-start font-normal"
              >
                {suggestion}
              </Button>
            ))}
          </div>
        </div>
        
        {/* Content Scheduling */}
        <div className="mt-6">
          <h3 className="text-sm font-medium mb-3">Post Schedule</h3>
          <div className="mb-3">
            <label className="block text-xs text-muted-foreground mb-1">Schedule for later</label>
            <Input 
              type="datetime-local" 
              value={selectedDate} 
              onChange={(e) => setSelectedDate(e.target.value)} 
            />
          </div>
          <Button variant="default" className="w-full" disabled={!selectedDate}>
            Schedule Post
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
