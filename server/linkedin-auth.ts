import passport from 'passport';
import { Strategy as LinkedInStrategy } from 'passport-linkedin-oauth2';
import { storage } from './storage';
import axios from 'axios';
import { Request, Response, NextFunction } from 'express';
import { InsertUser, InsertProfile } from '@shared/schema';

const CALLBACK_URL = process.env.NODE_ENV === 'production' 
  ? 'https://your-app-url.com/api/auth/linkedin/callback' 
  : 'http://localhost:5000/api/auth/linkedin/callback';

// Configure LinkedIn strategy
passport.use(new LinkedInStrategy({
  clientID: process.env.LINKEDIN_CLIENT_ID as string,
  clientSecret: process.env.LINKEDIN_CLIENT_SECRET as string,
  callbackURL: CALLBACK_URL,
  scope: ['r_emailaddress', 'r_liteprofile'],
  state: true
}, async function(accessToken: string, refreshToken: string, profile: any, done: any) {
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