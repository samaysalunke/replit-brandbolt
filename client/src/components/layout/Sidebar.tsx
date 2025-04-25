import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { 
  CloudLightning, 
  HomeIcon, 
  PenIcon, 
  CalendarIcon, 
  BarChartIcon, 
  SettingsIcon, 
  LogOutIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  MenuIcon
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useGoals } from '@/hooks/useGoals';
import { apiRequest } from '@/lib/queryClient';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';

interface SidebarProps {
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export default function Sidebar({ mobileOpen, onCloseMobile }: SidebarProps) {
  const [location] = useLocation();
  const { toast } = useToast();
  const { data: goals = [] } = useGoals();
  const { data: user } = useQuery({ queryKey: ['/api/auth/user'] });
  
  const handleLogout = async () => {
    try {
      await apiRequest('POST', '/api/auth/logout', {});
      toast({
        title: "Logged out successfully",
        description: "You have been logged out of BrandBolt",
      });
      window.location.href = '/auth';
    } catch (error) {
      toast({
        title: "Logout failed",
        description: "There was an error logging out. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  const isActive = (path: string) => {
    if (path === '/' && location === '/') return true;
    if (path !== '/' && location.startsWith(path)) return true;
    return false;
  };

  const sidebarClass = `
    fixed inset-y-0 left-0 z-40 w-64 bg-sidebar flex flex-col
    shadow-md transform transition-transform duration-300 ease-in-out
    md:relative md:translate-x-0
    ${mobileOpen ? 'translate-x-0 sidebar-active' : '-translate-x-full'}
  `;

  const navLinks = [
    { path: '/', label: 'Dashboard', icon: <HomeIcon className="w-5 h-5" /> },
    { path: '/content-creator', label: 'Content Creator', icon: <PenIcon className="w-5 h-5" /> },
    { path: '/calendar', label: 'Calendar', icon: <CalendarIcon className="w-5 h-5" /> },
    { path: '/analytics', label: 'Analytics', icon: <BarChartIcon className="w-5 h-5" /> },
    { path: '/settings', label: 'Settings', icon: <SettingsIcon className="w-5 h-5" /> },
  ];

  return (
    <>
      {/* Mobile Menu Button */}
      <button 
        className="fixed top-4 left-4 z-50 md:hidden bg-primary p-2 rounded-md shadow-md text-white"
        onClick={() => onCloseMobile()}
      >
        <MenuIcon className="w-5 h-5" />
      </button>
      
      <aside className={sidebarClass}>
        <div className="flex items-center justify-center h-16 px-4 border-b border-sidebar-border">
          <div className="flex items-center space-x-2">
            <CloudLightning className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold text-primary">BrandBolt</span>
          </div>
        </div>
        
        {/* User profile summary */}
        <div className="flex items-center px-4 py-3 border-b border-sidebar-border">
          <div className="w-10 h-10 rounded-full bg-primary-light/20 flex items-center justify-center overflow-hidden">
            {user?.user?.profileImage ? (
              <img 
                src={user.user.profileImage} 
                alt={user.user.fullName || user.user.username} 
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-primary font-semibold">
                {user?.user?.fullName ? user.user.fullName[0] : user?.user?.username?.[0] || 'U'}
              </span>
            )}
          </div>
          <div className="ml-3">
            <p className="font-medium text-sm">{user?.user?.fullName || user?.user?.username}</p>
            <p className="text-xs text-sidebar-foreground/60">{user?.user?.headline || 'LinkedIn Member'}</p>
          </div>
        </div>
        
        {/* Navigation Menu */}
        <nav className="flex-1 px-2 py-4 overflow-y-auto">
          <ul className="space-y-1">
            {navLinks.map((link) => (
              <li key={link.path}>
                <Link href={link.path}>
                  <a 
                    className={`flex items-center px-4 py-2 text-sm font-medium rounded-md 
                      ${isActive(link.path) 
                        ? 'bg-primary text-white' 
                        : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-primary'}`}
                    onClick={() => {
                      if (window.innerWidth < 768) {
                        onCloseMobile();
                      }
                    }}
                  >
                    {link.icon}
                    <span className="ml-3">{link.label}</span>
                  </a>
                </Link>
              </li>
            ))}
          </ul>
          
          {goals.length > 0 && (
            <div className="pt-8">
              <h3 className="px-4 text-xs font-semibold text-sidebar-foreground/60 uppercase tracking-wider">
                My Goals
              </h3>
              <div className="mt-2 space-y-2">
                {goals.map((goal) => {
                  const progress = Math.min(100, Math.round((goal.currentValue / goal.targetValue) * 100));
                  return (
                    <div key={goal.id} className="px-4 py-2 bg-sidebar-accent/50 rounded-md">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">{goal.title}</span>
                        <span className="text-xs text-primary font-medium">{progress}%</span>
                      </div>
                      <Progress value={progress} className="h-1.5 mt-1" />
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </nav>
        
        {/* Sidebar footer */}
        <div className="border-t border-sidebar-border px-4 py-3">
          <button 
            className="flex items-center text-sm text-sidebar-foreground/70 hover:text-primary"
            onClick={handleLogout}
          >
            <LogOutIcon className="w-4 h-4 mr-2" />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}
