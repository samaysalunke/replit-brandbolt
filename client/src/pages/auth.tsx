import { Box, Card, CardContent, Typography, Button, Container, Paper } from '@mui/material';
import { useAuth } from '@/hooks/useAuth';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import BoltIcon from '@mui/icons-material/Bolt';

export default function Auth() {
  const { login, isLoading } = useAuth();
  
  const handleLinkedInAuth = () => {
    // Redirect to the LinkedIn OAuth endpoint
    window.location.href = '/api/auth/linkedin';
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
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
            <BoltIcon sx={{ fontSize: 40, color: 'primary.main' }} />
            <Typography variant="h3" component="span" sx={{ fontWeight: 'bold', color: 'primary.main', ml: 1 }}>
              BrandBolt
            </Typography>
          </Box>
          <Typography variant="h5" sx={{ fontWeight: 'medium' }}>
            10x Your LinkedIn Growth
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
              p: 3, 
              bgcolor: 'primary.main',
              color: 'primary.contrastText',
              textAlign: 'center'
            }}
          >
            <Typography variant="h5" component="h2">
              Get Expert-Level LinkedIn Content
            </Typography>
          </Box>
          
          <CardContent sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="body1" sx={{ fontWeight: 'medium', mb: 3 }}>
              AI-powered content that gets 5x more engagement
            </Typography>
            
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
              Connect LinkedIn
            </Button>
            
            <Box sx={{ mt: 3, textAlign: 'center' }}>
              <Button 
                variant="text" 
                size="small"
                onClick={handleDemoLogin}
              >
                Try Demo
              </Button>
            </Box>
          </CardContent>
        </Paper>
      </Container>
    </Box>
  );
}
