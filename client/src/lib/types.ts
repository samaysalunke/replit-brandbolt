// User related types
export interface User {
  id: number;
  username: string;
  linkedinId?: string;
  accessToken?: string;
  refreshToken?: string;
  email?: string;
  fullName?: string;
  profileImage?: string;
  headline?: string;
  isConnected: boolean;
  createdAt: string;
}

// Profile related types
export interface ProfileData {
  score: number;
  activity: {
    profileViews: number;
    postImpressions: number;
    newConnections: number;
    engagementRate: number;
  };
  suggestions: ProfileSuggestion[];
  recentPosts: RecentPost[];
}

export interface ProfileSuggestion {
  id: number;
  type: string;
  title: string;
  impact: string;
  description: string;
}

export interface Profile {
  id: number;
  userId: number;
  profileData: ProfileData;
  profileScore: number;
  lastUpdated: string;
}

// Post related types
export interface RecentPost {
  id: number;
  preview: string;
  type: string;
  imageCount: number;
  date: string;
  impressions: number;
  impressionChange: number;
  engagement: number;
  engagementChange: number;
}

export interface Post {
  id: number;
  userId: number;
  content: string;
  postType: string;
  hashtags: string[];
  mediaUrls: string[];
  scheduledFor: string | null;
  publishedAt: string | null;
  status: 'draft' | 'scheduled' | 'published';
  engagementData: EngagementData | null;
  linkedinPostId: string | null;
  createdAt: string;
}

export interface EngagementData {
  impressions: number;
  engagementRate: number;
  likes?: number;
  comments?: number;
  shares?: number;
}

export interface CreatePostPayload {
  content: string;
  postType: string;
  hashtags?: string[];
  mediaUrls?: string[];
  scheduledFor?: string | null;
  status: 'draft' | 'scheduled' | 'published';
  publishedAt?: string | null;
}

// Goal related types
export interface Goal {
  id: number;
  userId: number;
  title: string;
  targetValue: number;
  currentValue: number;
  goalType: string;
  startDate: string;
  endDate: string | null;
  isCompleted: boolean;
  createdAt: string;
}

export interface CreateGoalPayload {
  title: string;
  targetValue: number;
  currentValue?: number;
  goalType: string;
  endDate?: string | null;
}

// Content Suggestion related types
export interface ContentSuggestion {
  id: number;
  userId: number;
  title: string;
  content: string;
  category: string;
  estimatedEngagement: string;
  isSaved: boolean;
  isUsed: boolean;
  createdAt: string;
}

// Analytics related types
export interface AnalyticsOverview {
  profileViews: number;
  postImpressions: number;
  newConnections: number;
  engagementRate: number;
}

export interface TimelineDataPoint {
  date: string;
  value: number;
}

export interface CategoryDataPoint {
  category: string;
  value: number;
}
