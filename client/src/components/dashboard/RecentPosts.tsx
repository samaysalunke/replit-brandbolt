import { useProfile } from '@/hooks/useProfile';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  ChevronRightIcon,
  EyeIcon,
  BarChart2Icon,
  MoreHorizontalIcon,
  FileTextIcon
} from 'lucide-react';
import { format } from 'date-fns';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

export default function RecentPosts() {
  const { data: profile, isLoading } = useProfile();
  
  if (isLoading) {
    return (
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Recent Posts Performance</h2>
        </div>
        <Card className="shadow-sm">
          <CardContent className="p-6 flex items-center justify-center h-48">
            <p className="text-muted-foreground">Loading recent posts...</p>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  if (!profile || !profile.profileData || !(profile.profileData as any).recentPosts) {
    return (
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Recent Posts Performance</h2>
        </div>
        <Card className="shadow-sm">
          <CardContent className="p-6">
            <p className="text-center text-muted-foreground">No recent posts available.</p>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  const { recentPosts } = profile.profileData as any;
  
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Recent Posts Performance</h2>
        <Button variant="ghost" size="sm" className="gap-1 text-primary">
          View All <ChevronRightIcon className="h-4 w-4" />
        </Button>
      </div>
      <Card className="shadow-sm">
        <CardContent className="p-4">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">Post Preview</th>
                  <th className="text-center py-3 px-4 text-xs font-medium text-muted-foreground">Date</th>
                  <th className="text-center py-3 px-4 text-xs font-medium text-muted-foreground">Impressions</th>
                  <th className="text-center py-3 px-4 text-xs font-medium text-muted-foreground">Engagement</th>
                  <th className="text-center py-3 px-4 text-xs font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {recentPosts.map((post: any) => (
                  <tr key={post.id} className="border-b last:border-b-0">
                    <td className="py-3 px-4">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 w-10 h-10 bg-secondary rounded flex items-center justify-center">
                          <FileTextIcon className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium truncate max-w-xs">{post.preview}</p>
                          <p className="text-xs text-muted-foreground">{post.type} • {post.imageCount} image{post.imageCount !== 1 ? 's' : ''}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-center">{format(new Date(post.date), 'MMM dd, yyyy')}</td>
                    <td className="py-3 px-4 text-center">
                      <span className="text-sm font-medium">{post.impressions.toLocaleString()}</span>
                      <p className={`text-xs ${post.impressionChange >= 0 ? 'text-success' : 'text-destructive'}`}>
                        {post.impressionChange >= 0 ? '+' : ''}{post.impressionChange}%
                      </p>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="text-sm font-medium">{post.engagement}%</span>
                      <p className={`text-xs ${post.engagementChange >= 0 ? 'text-success' : 'text-destructive'}`}>
                        {post.engagementChange >= 0 ? '+' : ''}{post.engagementChange}%
                      </p>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex justify-center space-x-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary">
                          <EyeIcon className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary">
                          <BarChart2Icon className="h-4 w-4" />
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary">
                              <MoreHorizontalIcon className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>View on LinkedIn</DropdownMenuItem>
                            <DropdownMenuItem>Copy Link</DropdownMenuItem>
                            <DropdownMenuItem>Duplicate Post</DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive">Delete Post</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
