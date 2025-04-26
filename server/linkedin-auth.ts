import passport from 'passport';
import { Strategy as LinkedInStrategy } from 'passport-linkedin-oauth2';
import { storage } from './storage';
import axios from 'axios';
import { Request, Response, NextFunction } from 'express';
import { InsertUser, InsertProfile } from '@shared/schema';

// We need to ensure our callback URL matches exactly what's registered in LinkedIn Developer Portal
const getCallbackUrl = () => {
  // The callback URL *MUST* match exactly what's registered in LinkedIn developer console
  // Otherwise, we'll get the "redirect_uri does not match the registered value" error

  // For Replit deployment, the Replit platform is handling the URL routing in a special way.
  // We need to use the exact URL registered in LinkedIn developer console.
  
  // The exact registered URL in LinkedIn Developer Console is:
  const FIXED_CALLBACK_URL = 'https://linkedin-growth-coach.replit.app/api/auth/linkedin/callback';
  
  console.log(`Using exact registered callback URL: ${FIXED_CALLBACK_URL}`);
  return FIXED_CALLBACK_URL;
};

// Get and log the callback URL
const CALLBACK_URL = getCallbackUrl();

// Log the callback URL being used
console.log('LinkedIn OAuth Callback URL:', CALLBACK_URL);
console.log('LinkedIn Client ID:', process.env.LINKEDIN_CLIENT_ID?.substring(0, 6) + '...');
console.log('LinkedIn Client Secret Length:', process.env.LINKEDIN_CLIENT_SECRET?.length);

// Configure LinkedIn strategy
passport.use(new LinkedInStrategy({
  clientID: process.env.LINKEDIN_CLIENT_ID as string,
  clientSecret: process.env.LINKEDIN_CLIENT_SECRET as string,
  callbackURL: CALLBACK_URL,
  // Using OAuth2 scopes approved in your LinkedIn developer portal
  scope: ['openid', 'profile', 'email', 'w_member_social'],
  state: true
}, async function(accessToken: string, refreshToken: string, profile: any, done: any) {
  console.log('=== LINKEDIN OAUTH STRATEGY CALLBACK ===');
  console.log('Profile data received from LinkedIn:');
  console.log(JSON.stringify(profile, null, 2));
  console.log('Access token received (first 10 chars):', accessToken.substring(0, 10) + '...');
  console.log('Refresh token present:', !!refreshToken);
  
  try {
    // With OpenID Connect, the user ID is in the 'sub' field
    const linkedinId = profile.sub || profile.id;
    
    // Check if user exists by LinkedIn ID
    let user = await storage.getUserByLinkedInId(linkedinId);
    
    if (!user) {
      // If user doesn't exist, create a new user
      
      // Check if email is directly available in the OIDC profile
      let email = '';
      if (profile.email) {
        // OpenID Connect format
        email = profile.email;
      } else if (profile.emails && profile.emails.length > 0) {
        // Traditional format
        email = profile.emails[0].value;
      }
      
      // Get the full name from the profile
      let fullName = '';
      if (profile.name) {
        // OpenID Connect format
        fullName = profile.name;
      } else {
        // Traditional format
        fullName = profile.displayName || `${profile.name?.givenName || ''} ${profile.name?.familyName || ''}`.trim();
      }
      
      // Get the profile picture
      let profileImage = '';
      if (profile.picture) {
        // OpenID Connect format
        profileImage = profile.picture;
      } else if (profile.photos && profile.photos.length > 0) {
        // Traditional format
        profileImage = profile.photos[0].value;
      }
      
      console.log(`Creating new user from LinkedIn profile: ID=${linkedinId}, Name=${fullName}, Email=${email ? 'Available' : 'Not provided'}`);
      
      // Create user data object compliant with our schema
      const userData: InsertUser = {
        username: linkedinId, // Use LinkedIn ID as username
        password: '', // No password needed for OAuth users
        email: email,
        fullName: fullName,
        linkedinId,
        accessToken,
        refreshToken: refreshToken || '',
        isConnected: true,
        profileImage,
        headline: profile.headline || profile._json?.headline || ''
      };
      
      user = await storage.createUser(userData);

      // Create default profile for the user
      const profileData: InsertProfile = {
        userId: user.id,
        profileData: {
          score: 0,
          activity: {
            profileViews: 0,
            postImpressions: 0,
            newConnections: 0,
            engagementRate: 0
          },
          suggestions: [],
          recentPosts: []
        },
        profileScore: 0
      };
      
      await storage.createProfile(profileData);
    } else {
      // Update existing user with new tokens
      await storage.updateUser(user.id, {
        accessToken,
        refreshToken: refreshToken || '',
        isConnected: true
      });
    }
    
    return done(null, user);
  } catch (error) {
    console.error('LinkedIn auth error:', error);
    return done(error as Error);
  }
}));

// Helper function to fetch more profile data using LinkedIn's API
export async function fetchLinkedInProfileData(accessToken: string) {
  try {
    console.log('Fetching LinkedIn profile data with token');
    
    // Fetch OpenID Connect user info (works with the 'openid' and 'profile' scopes)
    const userInfoResponse = await axios.get('https://api.linkedin.com/v2/userinfo', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'cache-control': 'no-cache'
      }
    });
    
    console.log('Received response from LinkedIn userinfo endpoint');
    
    // With the openid and profile scopes, we should have access to basic profile info
    const userData = userInfoResponse.data;
    
    // The email should be available directly from the userinfo endpoint if 'email' scope is granted
    const email = userData.email || null;
    
    // The picture should also be available from the userinfo endpoint
    const profilePicture = userData.picture || null;
    
    // Extract user name from the token response
    let firstName = '';
    let lastName = '';
    
    if (userData.name) {
      const nameParts = userData.name.split(' ');
      if (nameParts.length >= 2) {
        firstName = nameParts[0];
        lastName = nameParts.slice(1).join(' ');
      } else {
        firstName = userData.name;
      }
    }
    
    // Enhanced logging for debugging
    console.log(`LinkedIn profile data fetched: ID=${userData.sub}, Name=${userData.name}`);
    
    return {
      id: userData.sub,
      firstName,
      lastName,
      email,
      profilePicture,
      headline: userData.headline || null,
    };
  } catch (error) {
    console.error('Error fetching LinkedIn profile data:', error);
    throw error;
  }
}

// Serialize user to session
passport.serializeUser((user: Express.User, done) => {
  done(null, (user as any).id);
});

// Deserialize user from session
passport.deserializeUser(async (id: number, done) => {
  try {
    const user = await storage.getUser(id);
    done(null, user);
  } catch (error) {
    done(error);
  }
});

// Middleware to check if user is authenticated
export function isAuthenticated(req: Request, res: Response, next: NextFunction) {
  if (req.isAuthenticated()) {
    return next();
  }
  
  res.status(401).json({ message: 'Not authenticated' });
}