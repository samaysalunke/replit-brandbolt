import { useProfile } from '@/hooks/useProfile';
import { Card, CardContent } from '@/components/ui/card';
import CircleProgress from '@/components/ui/CircleProgress';
import { Button } from '@/components/ui/button';
import { PenIcon, UserIcon, CalendarIcon, TrendingUpIcon, TrendingDownIcon } from 'lucide-react';

export default function ProfileSummary() {
  const { data: profile, isLoading } = useProfile();
  
  if (isLoading) {
    return (
      <Card className="shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-48">
            <div className="text-center">Loading profile data...</div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (!profile || !profile.profileData) {
    return (
      <Card className="shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-48">
            <div className="text-center">
              <p className="mb-2">Profile data unavailable</p>
              <Button>Connect LinkedIn</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  const { score, activity } = profile.profileData as any;
  
  // Helper function to render trend indicators
  const renderTrend = (value: number) => {
    if (value > 0) {
      return <span className="text-xs text-success flex items-center"><TrendingUpIcon className="h-3 w-3 mr-1" /> {value}%</span>;
    }
    if (value < 0) {
      return <span className="text-xs text-destructive flex items-center"><TrendingDownIcon className="h-3 w-3 mr-1" /> {Math.abs(value)}%</span>;
    }
    return <span className="text-xs text-muted-foreground">--</span>;
  };

  return (
    <Card className="shadow-sm">
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Profile Score */}
          <div className="flex flex-col items-center justify-center">
            <CircleProgress value={score} />
            <div className="mt-3 text-center">
              <h3 className="font-semibold">Profile Score</h3>
              <p className="text-xs text-muted-foreground">Looking good!</p>
            </div>
          </div>
          
          {/* Profile Quick Stats */}
          <div className="col-span-2">
            <h3 className="font-semibold mb-3">Weekly Activity</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-secondary p-3 rounded-md">
                <p className="text-xs text-muted-foreground">Profile Views</p>
                <p className="text-xl font-semibold">{activity.profileViews.toLocaleString()}</p>
                {renderTrend(12)}
              </div>
              <div className="bg-secondary p-3 rounded-md">
                <p className="text-xs text-muted-foreground">Post Impressions</p>
                <p className="text-xl font-semibold">{(activity.postImpressions / 1000).toFixed(1)}K</p>
                {renderTrend(32)}
              </div>
              <div className="bg-secondary p-3 rounded-md">
                <p className="text-xs text-muted-foreground">New Connections</p>
                <p className="text-xl font-semibold">{activity.newConnections}</p>
                {renderTrend(-5)}
              </div>
              <div className="bg-secondary p-3 rounded-md">
                <p className="text-xs text-muted-foreground">Engagement Rate</p>
                <p className="text-xl font-semibold">{activity.engagementRate}%</p>
                {renderTrend(8)}
              </div>
            </div>
          </div>
          
          {/* Quick Actions */}
          <div>
            <h3 className="font-semibold mb-3">Quick Actions</h3>
            <div className="space-y-2">
              <Button className="w-full gap-2 justify-start" size="sm">
                <PenIcon className="h-4 w-4" /> Create new post
              </Button>
              <Button className="w-full gap-2 justify-start" variant="outline" size="sm">
                <UserIcon className="h-4 w-4" /> Optimize profile
              </Button>
              <Button className="w-full gap-2 justify-start" variant="secondary" size="sm">
                <CalendarIcon className="h-4 w-4" /> Schedule content
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
