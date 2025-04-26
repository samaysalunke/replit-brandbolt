import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
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

// Create MUI theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#0077B5', // LinkedIn blue
      light: '#0396D6',
      dark: '#00568A',
      contrastText: '#fff',
    },
    secondary: {
      main: '#5E35B1', // Purple
      light: '#7E57C2',
      dark: '#4527A0',
      contrastText: '#fff',
    },
    background: {
      default: '#F5F7FA',
      paper: '#fff',
    },
  },
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Switch>
        <Route path="/auth" component={Auth} />
        <Route path="/">
          <AuthRoute component={() => (
            <MainLayout>
              <Dashboard />
            </MainLayout>
          )} />
        </Route>
        <Route path="/dashboard">
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
      <Toaster />
    </ThemeProvider>
  );
}

export default App;
