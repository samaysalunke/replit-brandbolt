import passport from 'passport';
import { Strategy as LinkedInStrategy } from 'passport-linkedin-oauth2';
import { storage } from './storage';
import axios from 'axios';
import { Request, Response, NextFunction } from 'express';
import { InsertUser, InsertProfile } from '@shared/schema';

/**
 * Simplified LinkedIn Authentication Module
 * Following a clean and simple approach to LinkedIn authentication
 */

// Set up the callback URL - this must match exactly what's in your LinkedIn Developer Console
const CALLBACK_URL = 'https://linkedin-growth-coach.replit.app/api/auth/linkedin/callback';

// Log configuration info to make debugging easier
console.log('LinkedIn OAuth Callback URL:', CALLBACK_URL);
console.log('LinkedIn Client ID:', process.env.LINKEDIN_CLIENT_ID?.substring(0, 6) + '...');
console.log('LinkedIn Client Secret available:', !!process.env.LINKEDIN_CLIENT_SECRET);

// Configure LinkedIn OAuth Strategy
passport.use(new LinkedInStrategy({
  clientID: process.env.LINKEDIN_CLIENT_ID as string,
  clientSecret: process.env.LINKEDIN_CLIENT_SECRET as string,
  callbackURL: CALLBACK_URL,
  scope: ['openid', 'profile', 'email', 'w_member_social'], // Approved LinkedIn scopes
  state: true
}, async (accessToken, refreshToken, profile, done) => {
  try {
    console.log('LinkedIn auth successful, processing user data');
    
    // Get LinkedIn user ID - handle both OpenID Connect and standard OAuth formats
    const linkedinId = profile.sub || profile.id;
    
    // Check if user already exists in our database
    let user = await storage.getUserByLinkedInId(linkedinId);
    
    // Extract basic profile info
    const email = profile.email || (profile.emails?.[0]?.value || '');
    const fullName = profile.name || profile.displayName || 
                    `${profile.name?.givenName || ''} ${profile.name?.familyName || ''}`.trim();
    const profileImage = profile.picture || (profile.photos?.[0]?.value || '');
    const headline = profile.headline || profile._json?.headline || '';
    
    if (!user) {
      // Create new user record if this is first login
      console.log(`Creating new user from LinkedIn: ${fullName}`);
      
      const userData: InsertUser = {
        username: linkedinId,
        password: '', // OAuth users don't need passwords 
        email,
        fullName,
        linkedinId,
        accessToken,
        refreshToken: refreshToken || '',
        isConnected: true,
        profileImage,
        headline
      };
      
      // Create the user in our database
      user = await storage.createUser(userData);
      
      // Create initial profile data
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
      console.log(`Updating existing user: ${user.fullName}`);
      
      await storage.updateUser(user.id, {
        accessToken,
        refreshToken: refreshToken || '',
        isConnected: true,
        // Update profile image and headline in case they've changed
        profileImage,
        headline
      });
    }
    
    // Complete authentication and proceed
    return done(null, user);
  } catch (error) {
    console.error('LinkedIn authentication error:', error);
    return done(error as Error);
  }
}));

/**
 * Fetch extended user profile data from LinkedIn API
 * Uses the userinfo endpoint available with OpenID Connect scopes
 */
export async function fetchLinkedInProfileData(accessToken: string) {
  try {
    // Call LinkedIn's OpenID Connect userinfo endpoint
    const response = await axios.get('https://api.linkedin.com/v2/userinfo', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'cache-control': 'no-cache'
      }
    });
    
    const userData = response.data;
    
    // Format the profile data consistently
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
    
    return {
      id: userData.sub,
      firstName,
      lastName,
      email: userData.email || null,
      profilePicture: userData.picture || null,
      headline: userData.headline || null,
    };
  } catch (error) {
    console.error('Error fetching LinkedIn profile data:', error);
    throw error;
  }
}

// Set up session serialization for authentication
passport.serializeUser((user: Express.User, done) => {
  done(null, (user as any).id);
});

passport.deserializeUser(async (id: number, done) => {
  try {
    const user = await storage.getUser(id);
    done(null, user);
  } catch (error) {
    done(error);
  }
});

// Authentication middleware for protected routes
export function isAuthenticated(req: Request, res: Response, next: NextFunction) {
  if (req.isAuthenticated()) {
    return next();
  }
  
  res.status(401).json({ message: 'Not authenticated' });
}