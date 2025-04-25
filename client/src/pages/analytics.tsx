import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { AreaChart, BarChart, LineChart } from '@/components/ui/chart';
import { format, subDays } from 'date-fns';
import { 
  UsersIcon, 
  EyeIcon, 
  BarChart2Icon, 
  ThumbsUpIcon, 
  MessageCircleIcon, 
  Share2Icon,
  TrendingUpIcon,
  TrendingDownIcon,
  DownloadIcon,
  RefreshCw
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

// Generate dummy analytics data (would be real API data in production)
const generateTimelineData = (days: number, baseValue: number, volatility: number) => {
  return Array.from({ length: days }).map((_, i) => {
    const date = subDays(new Date(), days - i - 1);
    const value = Math.max(0, baseValue + Math.floor(Math.random() * volatility * 2) - volatility);
    return {
      date: format(date, 'MMM dd'),
      value
    };
  });
};

export default function Analytics() {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');
  const { data: analyticsData, isLoading, isError } = useQuery({
    queryKey: ['/api/analytics/overview'],
  });
  
  const profileViewsData = generateTimelineData(30, 120, 40);
  const engagementData = generateTimelineData(30, 80, 30);
  const followersData = generateTimelineData(30, 10, 5);
  const impressionsData = generateTimelineData(30, 2000, 500);
  
  // Filter data based on timeRange
  const filterDataByRange = (data: any[]) => {
    if (timeRange === '7d') return data.slice(-7);
    if (timeRange === '30d') return data;
    if (timeRange === '90d') return [...data, ...data, ...data]; // Mock for 90 days
    return data;
  };
  
  // Calculate trend percentage
  const calculateTrend = (data: any[]) => {
    if (data.length < 2) return 0;
    const current = data[data.length - 1].value;
    const previous = data[data.length - 2].value;
    if (previous === 0) return 100;
    return Math.round((current - previous) / previous * 100);
  };
  
  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      <header className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Analytics</h1>
          <p className="text-muted-foreground">Track your LinkedIn performance metrics</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-1">
            <RefreshCw className="h-4 w-4" /> Refresh Data
          </Button>
          <Button variant="outline" className="gap-1">
            <DownloadIcon className="h-4 w-4" /> Export Report
          </Button>
        </div>
      </header>
      
      <div className="mb-6">
        <Tabs defaultValue="30d" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="7d" onClick={() => setTimeRange('7d')}>7 Days</TabsTrigger>
            <TabsTrigger value="30d" onClick={() => setTimeRange('30d')}>30 Days</TabsTrigger>
            <TabsTrigger value="90d" onClick={() => setTimeRange('90d')}>90 Days</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      
      {/* Key Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div className="rounded-md bg-primary/10 p-2">
                <EyeIcon className="h-5 w-5 text-primary" />
              </div>
              <div className="flex items-center gap-1">
                {calculateTrend(profileViewsData) >= 0 ? (
                  <TrendingUpIcon className="h-4 w-4 text-success" />
                ) : (
                  <TrendingDownIcon className="h-4 w-4 text-destructive" />
                )}
                <span className={calculateTrend(profileViewsData) >= 0 ? "text-success" : "text-destructive"}>
                  {Math.abs(calculateTrend(profileViewsData))}%
                </span>
              </div>
            </div>
            <div className="mt-3">
              <p className="text-2xl font-semibold">
                {isLoading ? 'Loading...' : analyticsData?.profileViews || profileViewsData[profileViewsData.length - 1]?.value}
              </p>
              <p className="text-sm text-muted-foreground">Profile Views</p>
            </div>
            <div className="h-[60px] mt-4">
              <LineChart
                data={filterDataByRange(profileViewsData)}
                xField="date"
                yField="value"
                color="hsl(var(--chart-1))"
                showXAxis={false}
                showYAxis={false}
                showTooltip={false}
              />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div className="rounded-md bg-primary/10 p-2">
                <BarChart2Icon className="h-5 w-5 text-primary" />
              </div>
              <div className="flex items-center gap-1">
                {calculateTrend(impressionsData) >= 0 ? (
                  <TrendingUpIcon className="h-4 w-4 text-success" />
                ) : (
                  <TrendingDownIcon className="h-4 w-4 text-destructive" />
                )}
                <span className={calculateTrend(impressionsData) >= 0 ? "text-success" : "text-destructive"}>
                  {Math.abs(calculateTrend(impressionsData))}%
                </span>
              </div>
            </div>
            <div className="mt-3">
              <p className="text-2xl font-semibold">
                {isLoading ? 'Loading...' : (analyticsData?.postImpressions / 1000).toFixed(1) + 'K' || (impressionsData[impressionsData.length - 1]?.value / 1000).toFixed(1) + 'K'}
              </p>
              <p className="text-sm text-muted-foreground">Post Impressions</p>
            </div>
            <div className="h-[60px] mt-4">
              <AreaChart
                data={filterDataByRange(impressionsData)}
                xField="date"
                yField="value"
                color="hsl(var(--chart-2))"
                showXAxis={false}
                showYAxis={false}
                showTooltip={false}
              />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div className="rounded-md bg-primary/10 p-2">
                <UsersIcon className="h-5 w-5 text-primary" />
              </div>
              <div className="flex items-center gap-1">
                {calculateTrend(followersData) >= 0 ? (
                  <TrendingUpIcon className="h-4 w-4 text-success" />
                ) : (
                  <TrendingDownIcon className="h-4 w-4 text-destructive" />
                )}
                <span className={calculateTrend(followersData) >= 0 ? "text-success" : "text-destructive"}>
                  {Math.abs(calculateTrend(followersData))}%
                </span>
              </div>
            </div>
            <div className="mt-3">
              <p className="text-2xl font-semibold">
                {isLoading ? 'Loading...' : analyticsData?.newConnections || followersData[followersData.length - 1]?.value}
              </p>
              <p className="text-sm text-muted-foreground">New Connections</p>
            </div>
            <div className="h-[60px] mt-4">
              <LineChart
                data={filterDataByRange(followersData)}
                xField="date"
                yField="value"
                color="hsl(var(--chart-3))"
                showXAxis={false}
                showYAxis={false}
                showTooltip={false}
              />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div className="rounded-md bg-primary/10 p-2">
                <ThumbsUpIcon className="h-5 w-5 text-primary" />
              </div>
              <div className="flex items-center gap-1">
                {calculateTrend(engagementData) >= 0 ? (
                  <TrendingUpIcon className="h-4 w-4 text-success" />
                ) : (
                  <TrendingDownIcon className="h-4 w-4 text-destructive" />
                )}
                <span className={calculateTrend(engagementData) >= 0 ? "text-success" : "text-destructive"}>
                  {Math.abs(calculateTrend(engagementData))}%
                </span>
              </div>
            </div>
            <div className="mt-3">
              <p className="text-2xl font-semibold">
                {isLoading ? 'Loading...' : analyticsData?.engagementRate + '%' || engagementData[engagementData.length - 1]?.value / 20 + '%'}
              </p>
              <p className="text-sm text-muted-foreground">Engagement Rate</p>
            </div>
            <div className="h-[60px] mt-4">
              <AreaChart
                data={filterDataByRange(engagementData)}
                xField="date"
                yField="value"
                color="hsl(var(--chart-4))"
                showXAxis={false}
                showYAxis={false}
                showTooltip={false}
              />
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Detailed Analytics Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Post Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <BarChart
                data={[
                  { category: 'Text Only', value: 28 },
                  { category: 'With Image', value: 65 },
                  { category: 'With Video', value: 42 },
                  { category: 'With Document', value: 37 },
                  { category: 'Polls', value: 50 }
                ]}
                xField="category"
                yField="value"
                color="hsl(var(--chart-2))"
              />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Engagement Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <BarChart
                data={[
                  { category: 'Likes', value: 423, icon: <ThumbsUpIcon className="h-4 w-4" /> },
                  { category: 'Comments', value: 87, icon: <MessageCircleIcon className="h-4 w-4" /> },
                  { category: 'Shares', value: 32, icon: <Share2Icon className="h-4 w-4" /> }
                ]}
                xField="category"
                yField="value"
                color="hsl(var(--chart-1))"
              />
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Growth Metrics Chart */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Profile Growth Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px]">
            <LineChart
              data={filterDataByRange([
                ...profileViewsData.map(item => ({ date: item.date, metric: 'Profile Views', value: item.value })),
                ...followersData.map(item => ({ date: item.date, metric: 'New Connections', value: item.value * 10 })),
                ...engagementData.map(item => ({ date: item.date, metric: 'Engagement', value: item.value }))
              ])}
              xField="date"
              yField="value"
              categoryField="metric"
              colors={["hsl(var(--chart-1))", "hsl(var(--chart-3))", "hsl(var(--chart-4))"]}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
