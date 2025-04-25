import { useState, useEffect } from 'react';
import Sidebar from './Sidebar';

interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  
  // Handle resize to show/hide sidebar appropriately
  useEffect(() => {
    function handleResize() {
      if (window.innerWidth >= 768) {
        setMobileOpen(false);
      }
    }
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  const toggleMobileSidebar = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar mobileOpen={mobileOpen} onCloseMobile={toggleMobileSidebar} />
      
      <main className="flex-1 overflow-y-auto pb-10 md:ml-64">
        {children}
      </main>
    </div>
  );
}
