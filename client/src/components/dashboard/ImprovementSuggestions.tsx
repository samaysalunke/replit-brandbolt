import { useProfile } from '@/hooks/useProfile';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  UserIcon, 
  FileTextIcon, 
  MessageSquareIcon, 
  ChevronRightIcon
} from 'lucide-react';

export default function ImprovementSuggestions() {
  const { data: profile, isLoading } = useProfile();
  
  if (isLoading) {
    return (
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Profile Improvement Suggestions</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="shadow-sm">
              <CardContent className="p-4 h-48 flex items-center justify-center">
                <p className="text-sm text-muted-foreground">Loading suggestions...</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }
  
  if (!profile || !profile.profileData || !(profile.profileData as any).suggestions) {
    return (
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Profile Improvement Suggestions</h2>
        </div>
        <Card className="shadow-sm">
          <CardContent className="p-6">
            <p className="text-center text-muted-foreground">No improvement suggestions available.</p>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  const { suggestions } = profile.profileData as any;
  
  const getIcon = (type: string) => {
    switch (type) {
      case 'headline':
        return <UserIcon className="h-5 w-5" />;
      case 'projects':
        return <FileTextIcon className="h-5 w-5" />;
      case 'engagement':
        return <MessageSquareIcon className="h-5 w-5" />;
      default:
        return <UserIcon className="h-5 w-5" />;
    }
  };
  
  const getActionText = (type: string) => {
    switch (type) {
      case 'headline':
        return 'Update Headline';
      case 'projects':
        return 'Add Projects';
      case 'engagement':
        return 'Find Posts';
      default:
        return 'Take Action';
    }
  };
  
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Profile Improvement Suggestions</h2>
        <Button variant="ghost" size="sm" className="gap-1 text-primary">
          View All <ChevronRightIcon className="h-4 w-4" />
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {suggestions.map((suggestion: any) => (
          <Card key={suggestion.id} className="shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center mb-3">
                <div className="bg-primary-light/20 text-primary rounded-full p-2">
                  {getIcon(suggestion.type)}
                </div>
                <div className="ml-3">
                  <h3 className="font-medium text-sm">{suggestion.title}</h3>
                  <p className="text-xs text-muted-foreground">{suggestion.impact}</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-3">{suggestion.description}</p>
              <Button variant="outline" size="sm" className="w-full text-primary bg-primary/10 border-0 hover:bg-primary/20">
                {getActionText(suggestion.type)}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
