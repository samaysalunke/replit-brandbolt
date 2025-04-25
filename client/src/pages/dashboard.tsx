import { useEffect } from 'react';
import { useProfile } from '@/hooks/useProfile';
import ProfileSummary from '@/components/dashboard/ProfileSummary';
import ImprovementSuggestions from '@/components/dashboard/ImprovementSuggestions';
import RecentPosts from '@/components/dashboard/RecentPosts';
import ContentIdeas from '@/components/dashboard/ContentIdeas';

export default function Dashboard() {
  const { data: profile, isLoading, refreshProfile } = useProfile();

  // Load profile data if not already loaded
  useEffect(() => {
    if (!profile && !isLoading) {
      refreshProfile();
    }
  }, [profile, isLoading, refreshProfile]);

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      <header className="mb-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Track and optimize your LinkedIn presence</p>
      </header>
      
      {/* Profile Summary Section */}
      <section className="mb-8">
        <ProfileSummary />
      </section>
      
      {/* Improvement Suggestions */}
      <section className="mb-8">
        <ImprovementSuggestions />
      </section>
      
      {/* Recent Posts Performance */}
      <section className="mb-8">
        <RecentPosts />
      </section>
      
      {/* Content Ideas */}
      <section className="mb-8">
        <ContentIdeas />
      </section>
    </div>
  );
}
