import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import MainLayout from "@/components/layout/MainLayout";
import Dashboard from "@/pages/dashboard";
import ContentCreator from "@/pages/content-creator";
import Calendar from "@/pages/calendar";
import Analytics from "@/pages/analytics";
import Settings from "@/pages/settings";
import Auth from "@/pages/auth";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";

function AuthRoute({ component: Component, ...rest }: { component: React.ComponentType<any>; [key: string]: any }) {
  const { data: user, isLoading, isError } = useQuery({ 
    queryKey: ['/api/auth/user'],
    retry: false,
    refetchOnMount: true,
    refetchOnWindowFocus: false
  });
  
  const [location, setLocation] = useLocation();
  
  useEffect(() => {
    if (!isLoading && isError && location !== '/auth') {
      setLocation('/auth');
    }
  }, [isLoading, isError, location, setLocation]);
  
  if (isLoading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }
  
  if (isError) {
    return null; // Will redirect to /auth
  }
  
  return <Component {...rest} user={user} />;
}

function App() {
  return (
    <Switch>
      <Route path="/auth" component={Auth} />
      <Route path="/">
        <AuthRoute component={() => (
          <MainLayout>
            <Dashboard />
          </MainLayout>
        )} />
      </Route>
      <Route path="/content-creator">
        <AuthRoute component={() => (
          <MainLayout>
            <ContentCreator />
          </MainLayout>
        )} />
      </Route>
      <Route path="/calendar">
        <AuthRoute component={() => (
          <MainLayout>
            <Calendar />
          </MainLayout>
        )} />
      </Route>
      <Route path="/analytics">
        <AuthRoute component={() => (
          <MainLayout>
            <Analytics />
          </MainLayout>
        )} />
      </Route>
      <Route path="/settings">
        <AuthRoute component={() => (
          <MainLayout>
            <Settings />
          </MainLayout>
        )} />
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

export default App;
