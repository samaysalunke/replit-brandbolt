import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { CloudLightning, LinkedinIcon } from 'lucide-react';

export default function Auth() {
  const [activeTab, setActiveTab] = useState<string>('login');
  const [loginFormData, setLoginFormData] = useState({ username: '', password: '' });
  const [registerFormData, setRegisterFormData] = useState({ 
    username: '', 
    password: '', 
    confirmPassword: '',
    email: '',
    fullName: ''
  });
  const { login, register, isLoading } = useAuth();
  
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login(loginFormData);
  };
  
  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (registerFormData.password !== registerFormData.confirmPassword) {
      return; // Show error (handled in the form validation)
    }
    
    register({
      username: registerFormData.username,
      password: registerFormData.password,
      email: registerFormData.email,
      fullName: registerFormData.fullName
    });
  };
  
  const handleLinkedInAuth = () => {
    // This would trigger the OAuth flow in a real implementation
    // For demo purposes, we'll just log in as the demo user
    login({ username: 'demo', password: 'password' });
  };
  
  // For development testing, we can use the demo login
  const handleDemoLogin = () => {
    login({ username: 'demo', password: 'password' });
  };
  
  return (
    <div className="flex min-h-screen bg-background items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-2">
            <CloudLightning className="h-10 w-10 text-primary" />
            <span className="text-3xl font-bold text-primary ml-2">BrandBolt</span>
          </div>
          <h1 className="text-xl font-semibold">LinkedIn Branding Coach</h1>
          <p className="text-muted-foreground mt-1">Optimize your LinkedIn presence and grow your personal brand</p>
        </div>
        
        <Card className="w-full">
          <CardHeader className="space-y-1">
            <Tabs defaultValue="login" onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="register">Register</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login" className="pt-4">
                <CardTitle>Welcome back</CardTitle>
                <CardDescription>Enter your credentials to access your account</CardDescription>
              </TabsContent>
              
              <TabsContent value="register" className="pt-4">
                <CardTitle>Create an account</CardTitle>
                <CardDescription>Enter your information to get started</CardDescription>
              </TabsContent>
            </Tabs>
          </CardHeader>
          
          <CardContent>
            {activeTab === 'login' ? (
              <form onSubmit={handleLoginSubmit}>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input 
                      id="username" 
                      type="text" 
                      placeholder="Your username" 
                      value={loginFormData.username}
                      onChange={(e) => setLoginFormData({...loginFormData, username: e.target.value})}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password">Password</Label>
                      <Button variant="link" size="sm" className="px-0 h-auto">Forgot Password?</Button>
                    </div>
                    <Input 
                      id="password" 
                      type="password" 
                      placeholder="Your password" 
                      value={loginFormData.password}
                      onChange={(e) => setLoginFormData({...loginFormData, password: e.target.value})}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Logging in..." : "Login"}
                  </Button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleRegisterSubmit}>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input 
                      id="fullName" 
                      type="text" 
                      placeholder="John Doe" 
                      value={registerFormData.fullName}
                      onChange={(e) => setRegisterFormData({...registerFormData, fullName: e.target.value})}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      placeholder="your.email@example.com" 
                      value={registerFormData.email}
                      onChange={(e) => setRegisterFormData({...registerFormData, email: e.target.value})}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reg-username">Username</Label>
                    <Input 
                      id="reg-username" 
                      type="text" 
                      placeholder="Choose a username" 
                      value={registerFormData.username}
                      onChange={(e) => setRegisterFormData({...registerFormData, username: e.target.value})}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reg-password">Password</Label>
                    <Input 
                      id="reg-password" 
                      type="password" 
                      placeholder="Create a password" 
                      value={registerFormData.password}
                      onChange={(e) => setRegisterFormData({...registerFormData, password: e.target.value})}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <Input 
                      id="confirmPassword" 
                      type="password" 
                      placeholder="Confirm your password" 
                      value={registerFormData.confirmPassword}
                      onChange={(e) => setRegisterFormData({...registerFormData, confirmPassword: e.target.value})}
                      required
                      className={registerFormData.password !== registerFormData.confirmPassword && registerFormData.confirmPassword ? "border-destructive" : ""}
                    />
                    {registerFormData.password !== registerFormData.confirmPassword && registerFormData.confirmPassword && (
                      <p className="text-xs text-destructive">Passwords do not match</p>
                    )}
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={isLoading || registerFormData.password !== registerFormData.confirmPassword}
                  >
                    {isLoading ? "Creating account..." : "Create Account"}
                  </Button>
                </div>
              </form>
            )}
            
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t"></span>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
              </div>
            </div>
            
            <Button 
              variant="outline" 
              className="w-full flex items-center gap-2" 
              onClick={handleLinkedInAuth}
            >
              <LinkedinIcon className="h-4 w-4" /> Sign in with LinkedIn
            </Button>
            
            <div className="mt-4">
              <Button 
                variant="secondary" 
                className="w-full" 
                onClick={handleDemoLogin}
              >
                Demo Access
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
