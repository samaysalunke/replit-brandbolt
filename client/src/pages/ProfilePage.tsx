import { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  CardMedia,
  Button,
  Paper,
  Grid,
  Avatar,
  CircularProgress,
  Divider,
  IconButton,
  Alert,
} from '@mui/material';
import { LinkedIn, Logout, Refresh } from '@mui/icons-material';
import { useAuthContext } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';

const ProfilePage = () => {
  const { user, loading, error, logout, refreshProfile } = useAuthContext();
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshProfile();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <CircularProgress size={60} />
      </Container>
    );
  }

  if (!user) {
    return <Navigate to="/" />;
  }

  // Default image if none provided
  const profileImage = 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png';

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1">
          LinkedIn Profile
        </Typography>
        <Box>
          <IconButton 
            color="primary" 
            onClick={handleRefresh} 
            disabled={refreshing}
            title="Refresh profile data"
          >
            <Refresh />
          </IconButton>
          <Button 
            variant="outlined" 
            color="error" 
            startIcon={<Logout />}
            onClick={logout}
            sx={{ ml: 1 }}
          >
            Logout
          </Button>
        </Box>
      </Box>

      <Card sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' } }}>
          <CardMedia
            component="div"
            sx={{
              width: { xs: '100%', md: 200 },
              height: { xs: 200, md: '100%' },
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              bgcolor: '#f5f5f5',
            }}
          >
            <Avatar
              src={profileImage}
              alt={`${user.first_name} ${user.last_name}`}
              sx={{ width: 150, height: 150 }}
            />
          </CardMedia>
          <CardContent sx={{ flex: '1 1 auto' }}>
            <Typography variant="h5" component="h2" gutterBottom>
              {user.first_name} {user.last_name}
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              {user.email}
            </Typography>
            <Button
              variant="contained"
              size="small"
              startIcon={<LinkedIn />}
              href={`https://www.linkedin.com/in/${user.linkedin_id}`}
              target="_blank"
              sx={{
                backgroundColor: '#0072b1',
                '&:hover': {
                  backgroundColor: '#005483',
                },
              }}
            >
              View on LinkedIn
            </Button>
          </CardContent>
        </Box>
      </Card>

      <Typography variant="h5" component="h2" sx={{ mb: 2 }}>
        Profile Information
      </Typography>

      <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
          <Box sx={{ flex: '1 1 40%', minWidth: { xs: '100%', sm: '40%' } }}>
            <Typography variant="subtitle1" color="text.secondary">
              Full Name
            </Typography>
            <Typography variant="body1">
              {user.first_name} {user.last_name}
            </Typography>
          </Box>
          
          <Box sx={{ flex: '1 1 40%', minWidth: { xs: '100%', sm: '40%' } }}>
            <Typography variant="subtitle1" color="text.secondary">
              Email Address
            </Typography>
            <Typography variant="body1">{user.email}</Typography>
          </Box>
          
          <Box sx={{ width: '100%' }}>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle1" color="text.secondary">
              LinkedIn ID
            </Typography>
            <Typography variant="body1">{user.linkedin_id}</Typography>
          </Box>
          
          <Box sx={{ width: '100%' }}>
            <Typography variant="subtitle1" color="text.secondary">
              Account Created
            </Typography>
            <Typography variant="body1">
              {user.created_at ? new Date(user.created_at as string).toLocaleString() : 'Not available'}
            </Typography>
          </Box>
          
          <Box sx={{ width: '100%' }}>
            <Typography variant="subtitle1" color="text.secondary">
              Last Updated
            </Typography>
            <Typography variant="body1">
              {user.last_updated ? new Date(user.last_updated as string).toLocaleString() : 'Not available'}
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default ProfilePage;