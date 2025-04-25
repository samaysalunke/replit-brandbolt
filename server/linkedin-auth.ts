import passport from 'passport';
import { Strategy as LinkedInStrategy } from 'passport-linkedin-oauth2';
import { storage } from './storage';
import axios from 'axios';
import { Request, Response, NextFunction } from 'express';
import { InsertUser, InsertProfile } from '@shared/schema';

// We need to ensure our callback URL matches exactly what's registered in LinkedIn Developer Portal
const getCallbackUrl = () => {
  // Important: The callback URL must match what's registered in LinkedIn developer console
  // If we're getting "redirect_uri doesn't match registered value" errors,
  // it means this URL doesn't match what's in the LinkedIn developer settings
  
  // Since we're getting redirect_uri mismatch errors, we'll try a simpler approach with
  // a fixed callback that should match what's registered in LinkedIn
  
  // This approach requires registering this exact URL in LinkedIn Developer Portal:
  // https://linkedin-growth-coach.replit.app/api/auth/linkedin/callback
  
  // Note: If you're still getting redirect_uri errors, you'll need to update the
  // registered callback URL in the LinkedIn Developer Portal to match this URL:
  const FIXED_CALLBACK_URL = 'https://linkedin-growth-coach.replit.app/api/auth/linkedin/callback';
  
  console.log(`Using fixed callback URL: ${FIXED_CALLBACK_URL}`);
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
  scope: ['r_emailaddress', 'r_liteprofile'],
  state: true
}, async function(accessToken: string, refreshToken: string, profile: any, done: any) {
  console.log('LinkedIn OAuth callback received. Profile ID:', profile?.id);
  try {
    // Check if user exists by LinkedIn ID
    let user = await storage.getUserByLinkedInId(profile.id);
    
    if (!user) {
      // If user doesn't exist, create a new user
      const email = profile.emails && profile.emails.length > 0 
        ? profile.emails[0].value 
        : '';
      const fullName = profile.displayName || `${profile.name?.givenName || ''} ${profile.name?.familyName || ''}`.trim();
      
      // Create user data object compliant with our schema
      const userData: InsertUser = {
        username: profile.id, // Use LinkedIn ID as username
        password: '', // No password needed for OAuth users
        email: email,
        fullName: fullName,
        linkedinId: profile.id,
        accessToken,
        refreshToken: refreshToken || '',
        isConnected: true,
        profileImage: profile.photos && profile.photos.length > 0 ? profile.photos[0].value : '',
        headline: profile._json?.headline || ''
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
    // Fetch basic profile data
    const profileResponse = await axios.get('https://api.linkedin.com/v2/me', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'cache-control': 'no-cache',
        'X-Restli-Protocol-Version': '2.0.0'
      }
    });

    // Fetch email address
    const emailResponse = await axios.get('https://api.linkedin.com/v2/emailAddress?q=members&projection=(elements*(handle~))', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'cache-control': 'no-cache',
        'X-Restli-Protocol-Version': '2.0.0'
      }
    });

    // Fetch profile picture
    const pictureResponse = await axios.get('https://api.linkedin.com/v2/me?projection=(id,profilePicture(displayImage~:playableStreams))', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'cache-control': 'no-cache',
        'X-Restli-Protocol-Version': '2.0.0'
      }
    });

    // Process and return combined data
    const profileData = profileResponse.data;
    const email = emailResponse.data.elements?.[0]?.['handle~']?.emailAddress || null;
    
    let profilePicture = null;
    if (pictureResponse.data.profilePicture && 
        pictureResponse.data.profilePicture['displayImage~'] && 
        pictureResponse.data.profilePicture['displayImage~'].elements) {
      // Get the highest resolution image
      const elements = pictureResponse.data.profilePicture['displayImage~'].elements;
      if (elements.length > 0) {
        // Sort by width (descending) and get the first one
        const sorted = [...elements].sort((a, b) => b.data['com.linkedin.digitalmedia.mediaartifact.StillImage'].storageSize.width - 
                                                    a.data['com.linkedin.digitalmedia.mediaartifact.StillImage'].storageSize.width);
        profilePicture = sorted[0]?.identifiers?.[0]?.identifier;
      }
    }

    return {
      id: profileData.id,
      firstName: profileData.localizedFirstName,
      lastName: profileData.localizedLastName,
      email,
      profilePicture,
      headline: profileData.headline || null,
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