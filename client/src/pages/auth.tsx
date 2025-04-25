import { Box, Card, CardContent, Typography, Button, Container, Paper } from '@mui/material';
import { useAuth } from '@/hooks/useAuth';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import BoltIcon from '@mui/icons-material/Bolt';

export default function Auth() {
  const { login, isLoading } = useAuth();
  
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
    <Box 
      sx={{ 
        display: 'flex',
        minHeight: '100vh',
        bgcolor: 'background.default',
        alignItems: 'center',
        justifyContent: 'center',
        p: 4
      }}
    >
      <Container maxWidth="sm">
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
            <BoltIcon sx={{ fontSize: 40, color: 'primary.main' }} />
            <Typography variant="h3" component="span" sx={{ fontWeight: 'bold', color: 'primary.main', ml: 1 }}>
              BrandBolt
            </Typography>
          </Box>
          <Typography variant="h5" sx={{ fontWeight: 'medium' }}>
            LinkedIn Branding Coach
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
            Optimize your LinkedIn presence and grow your personal brand
          </Typography>
        </Box>
        
        <Paper 
          elevation={3} 
          sx={{ 
            borderRadius: 2,
            overflow: 'hidden'
          }}
        >
          <Box 
            sx={{ 
              p: 4, 
              bgcolor: 'primary.main',
              color: 'primary.contrastText',
              textAlign: 'center'
            }}
          >
            <Typography variant="h5" component="h2" gutterBottom>
              Connect with LinkedIn
            </Typography>
            <Typography variant="body1">
              Sign in with your LinkedIn account to get started with BrandBolt
            </Typography>
          </Box>
          
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ mb: 3 }}>
              <Typography variant="body1" sx={{ mb: 2, textAlign: 'center' }}>
                Link your LinkedIn profile to unlock powerful branding tools, content creation, and analytics.
              </Typography>
            </Box>
            
            <Button 
              variant="contained" 
              size="large"
              fullWidth
              startIcon={<LinkedInIcon />}
              onClick={handleLinkedInAuth}
              sx={{ 
                py: 1.5,
                bgcolor: '#0077B5', 
                '&:hover': { 
                  bgcolor: '#005885' 
                }
              }}
            >
              Sign in with LinkedIn
            </Button>
            
            <Box sx={{ mt: 4, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                For demonstration purposes only
              </Typography>
              <Button 
                variant="outlined" 
                onClick={handleDemoLogin}
                sx={{ mt: 1 }}
              >
                Demo Access
              </Button>
            </Box>
          </CardContent>
        </Paper>
      </Container>
    </Box>
  );
}
