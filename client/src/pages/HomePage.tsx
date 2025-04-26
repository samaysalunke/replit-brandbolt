import { Button, Container, Typography, Box, Paper } from '@mui/material';
import { LinkedIn } from '@mui/icons-material';
import { useAuthContext } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';

const HomePage = () => {
  const { user, loading, login } = useAuthContext();

  if (loading) {
    return (
      <Container maxWidth="sm" sx={{ mt: 8, textAlign: 'center' }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Loading...
        </Typography>
      </Container>
    );
  }

  if (user) {
    return <Navigate to="/profile" />;
  }

  return (
    <Container maxWidth="md">
      <Box
        sx={{
          mt: 8,
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          gap: 4,
          alignItems: 'center',
        }}
      >
        <Box sx={{ flex: 1 }}>
          <Typography variant="h3" component="h1" gutterBottom>
            LinkedIn Profile Viewer
          </Typography>
          <Typography variant="h5" color="text.secondary" paragraph>
            Connect with LinkedIn to view and manage your professional profile data
          </Typography>
          <Button
            variant="contained"
            size="large"
            startIcon={<LinkedIn />}
            onClick={login}
            sx={{
              mt: 2,
              backgroundColor: '#0072b1',
              '&:hover': {
                backgroundColor: '#005483',
              },
            }}
          >
            Connect with LinkedIn
          </Button>
        </Box>
        <Paper 
          elevation={3} 
          sx={{ 
            flex: 1, 
            p: 4, 
            backgroundColor: '#f5f5f5',
            borderRadius: 2
          }}
        >
          <Typography variant="h5" component="h2" gutterBottom>
            Why Connect?
          </Typography>
          <Typography paragraph>
            By connecting your LinkedIn account, you can:
          </Typography>
          <Box component="ul" sx={{ pl: 2 }}>
            <Typography component="li" paragraph>
              View your professional profile information
            </Typography>
            <Typography component="li" paragraph>
              Securely access your LinkedIn data
            </Typography>
            <Typography component="li" paragraph>
              Manage your professional presence
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary">
            Your data is secure and only used within this application.
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
};

export default HomePage;