import express from 'express';
import { createClient } from '@supabase/supabase-js';
import axios from 'axios';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// CORS setup
app.use(cors({
  origin: true,
  credentials: true,
}));

app.use(express.json());
app.use(cookieParser());

// Supabase setup
const supabaseUrl = process.env.SUPABASE_URL as string;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string;

// We'll log a warning but continue execution in development mode
if (!supabaseUrl || !supabaseServiceKey) {
  console.warn('Warning: Missing Supabase environment variables');
  console.warn('The application will continue but Supabase functionality will be limited.');
}

const supabase = createClient(
  supabaseUrl || 'https://example.supabase.co', 
  supabaseServiceKey || 'fallback-key-for-dev-only'
);

// LinkedIn OAuth configuration
const LINKEDIN_CLIENT_ID = process.env.LINKEDIN_CLIENT_ID;
const LINKEDIN_CLIENT_SECRET = process.env.LINKEDIN_CLIENT_SECRET;
const LINKEDIN_REDIRECT_URI = 'https://linkedin-growth-coach.replit.app/api/auth/linkedin/callback';

if (!LINKEDIN_CLIENT_ID || !LINKEDIN_CLIENT_SECRET) {
  console.error('Missing LinkedIn API credentials');
  console.log('LinkedIn Client ID:', LINKEDIN_CLIENT_ID ? 'Present' : 'Missing');
  console.log('LinkedIn Client Secret:', LINKEDIN_CLIENT_SECRET ? 'Present' : 'Missing');
}

// LinkedIn OAuth callback route
app.get('/api/auth/linkedin/callback', async (req, res) => {
  try {
    const { code } = req.query;
    console.log('Received authorization code:', code);

    if (!code) {
      console.error('No authorization code received');
      return res.status(400).json({ error: 'Missing authorization code' });
    }

    // Exchange authorization code for access token
    console.log('Exchanging code for access token...');
    const tokenResponse = await axios.post(
      'https://www.linkedin.com/oauth/v2/accessToken',
      null,
      {
        params: {
          grant_type: 'authorization_code',
          code,
          client_id: LINKEDIN_CLIENT_ID,
          client_secret: LINKEDIN_CLIENT_SECRET,
          redirect_uri: LINKEDIN_REDIRECT_URI,
        },
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    const { access_token, expires_in } = tokenResponse.data;
    console.log('Access token obtained');

    // Fetch user profile data from LinkedIn
    console.log('Fetching user profile data...');
    const profileResponse = await axios.get('https://api.linkedin.com/v2/me', {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });

    // Fetch user email
    console.log('Fetching user email...');
    const emailResponse = await axios.get(
      'https://api.linkedin.com/v2/emailAddress?q=members&projection=(elements*(handle~))',
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      }
    );

    const profileData = profileResponse.data;
    const email = emailResponse.data.elements[0]['handle~'].emailAddress;

    console.log('LinkedIn profile data retrieved');

    // Create or update user in Supabase
    console.log('Creating/updating user in Supabase...');
    
    // First, check if user exists by LinkedIn ID
    const { data: existingUsers, error: queryError } = await supabase
      .from('profiles')
      .select('*')
      .eq('linkedin_id', profileData.id)
      .limit(1);

    if (queryError) {
      console.error('Error querying user:', queryError);
      return res.status(500).json({ error: 'Database query error' });
    }

    let userId;

    if (existingUsers && existingUsers.length > 0) {
      // Update existing user
      const existingUser = existingUsers[0];
      userId = existingUser.id;

      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          first_name: profileData.localizedFirstName,
          last_name: profileData.localizedLastName,
          email: email,
          access_token: access_token,
          profile_data: profileData,
          last_updated: new Date(),
        })
        .eq('id', userId);

      if (updateError) {
        console.error('Error updating user:', updateError);
        return res.status(500).json({ error: 'User update error' });
      }
      
      console.log('User updated successfully');
    } else {
      // Create new user
      const { data: newUser, error: insertError } = await supabase
        .from('profiles')
        .insert([
          {
            linkedin_id: profileData.id,
            first_name: profileData.localizedFirstName,
            last_name: profileData.localizedLastName,
            email: email,
            access_token: access_token,
            profile_data: profileData,
          },
        ])
        .select();

      if (insertError) {
        console.error('Error creating user:', insertError);
        return res.status(500).json({ error: 'User creation error' });
      }

      userId = newUser[0].id;
      console.log('User created successfully');
    }

    // Create a JWT token for the user
    console.log('Creating session token...');
    const tokenExpiry = new Date();
    tokenExpiry.setSeconds(tokenExpiry.getSeconds() + expires_in);
    
    // Create a simple token with the user ID and expiration
    const token = Buffer.from(JSON.stringify({
      userId: userId.toString(),
      exp: Math.floor(tokenExpiry.getTime() / 1000)
    })).toString('base64');

    // Set the token in a cookie
    res.cookie('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: expires_in * 1000,
      path: '/',
    });

    console.log('Authentication successful, redirecting to profile page');
    
    // Redirect to the frontend profile page
    return res.redirect('/profile');
  } catch (error: any) {
    console.error('LinkedIn callback error:', error);
    return res.status(500).json({ 
      error: 'Authentication failed',
      details: error.response?.data || error.message
    });
  }
});

// Route to initiate LinkedIn OAuth
app.get('/api/auth/linkedin', (req, res) => {
  const scope = 'openid profile email w_member_social';
  const authUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${LINKEDIN_CLIENT_ID}&redirect_uri=${encodeURIComponent(LINKEDIN_REDIRECT_URI)}&scope=${encodeURIComponent(scope)}&state=random_state_value`;
  
  console.log('Redirecting to LinkedIn authorization:', authUrl);
  res.redirect(authUrl);
});

// Endpoint to get current user profile
app.get('/api/profile', async (req, res) => {
  try {
    // Check for auth token in cookie
    const authToken = req.cookies['auth-token'];
    
    if (!authToken) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    // Decode and validate the token
    try {
      const decodedToken = JSON.parse(Buffer.from(authToken, 'base64').toString());
      
      // Check if token is expired
      const currentTime = Math.floor(Date.now() / 1000);
      if (decodedToken.exp < currentTime) {
        return res.status(401).json({ error: 'Token expired' });
      }
      
      // Get the userId from the token
      const userId = decodedToken.userId;
      
      // Get user profile from the database
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
        return res.status(500).json({ error: 'Error fetching profile' });
      }

      if (!profile) {
        return res.status(404).json({ error: 'Profile not found' });
      }

      return res.json({ profile });
    } catch (err) {
      console.error('Error decoding token:', err);
      return res.status(401).json({ error: 'Invalid token' });
    }
  } catch (error: any) {
    console.error('Error getting profile:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Logout endpoint
app.post('/api/auth/logout', async (req, res) => {
  try {
    // Simply clear the auth cookie
    res.clearCookie('auth-token');
    res.json({ message: 'Logged out successfully' });
  } catch (error: any) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Logout failed' });
  }
});

// Get directory name of current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// In production, serve the built client assets
if (process.env.NODE_ENV === 'production') {
  // Set static folder
  app.use(express.static(path.resolve(__dirname, '../dist/public')));
}

// In development, just serve static files directly 
if (process.env.NODE_ENV === 'development') {
  // Use express.static to serve the client files
  console.log('Serving from client directory using Express static middleware');
  
  // Serve the static client files
  app.use(express.static(path.resolve(__dirname, '../client'), {
    setHeaders: (res, filePath) => {
      if (filePath.endsWith('.js')) {
        res.setHeader('Content-Type', 'application/javascript');
      } else if (filePath.endsWith('.mjs')) {
        res.setHeader('Content-Type', 'application/javascript');
      } else if (filePath.endsWith('.ts') || filePath.endsWith('.tsx')) {
        res.setHeader('Content-Type', 'application/javascript');
      } else if (filePath.endsWith('.css')) {
        res.setHeader('Content-Type', 'text/css');
      }
    }
  }));
}

// Add a specific handler for the root route
app.get('/', (req, res) => {
  // Serve our static HTML file
  res.sendFile(path.resolve(__dirname, '../static', 'index.html'));
});

// For any other routes not handled before, in both dev and prod
// serve the client app - React Router will handle the routing
app.get('*', (req, res) => {
  if (req.path.startsWith('/api')) {
    // If it's an API route that wasn't handled, return 404
    return res.status(404).json({ error: 'API endpoint not found' });
  }
  
  // Otherwise serve the client app
  if (process.env.NODE_ENV === 'production') {
    res.sendFile(path.resolve(__dirname, '../dist/public', 'index.html'));
  } else {
    // In development, use our static HTML file until the React app is working
    res.sendFile(path.resolve(__dirname, '../client', 'static-index.html'));
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`LinkedIn OAuth Callback URL: ${LINKEDIN_REDIRECT_URI}`);
  console.log(`LinkedIn Client ID: ${LINKEDIN_CLIENT_ID?.substring(0, 8)}...`);
  console.log(`LinkedIn Client Secret available: ${LINKEDIN_CLIENT_SECRET ? 'true' : 'false'}`);
});