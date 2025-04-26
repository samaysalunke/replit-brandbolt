import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import session from "express-session";
import MemoryStore from "memorystore";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { storage } from "./storage";
import * as crypto from 'crypto';
import { 
  insertUserSchema, 
  insertProfileSchema, 
  insertPostSchema, 
  insertGoalSchema, 
  insertContentSuggestionSchema 
} from "@shared/schema";
import { z } from "zod";
import { fromZodError } from "zod-validation-error";
import { isAuthenticated, fetchLinkedInProfileData } from './linkedin-auth';
import './session-types';

// Fix for TypeScript not recognizing express-session properly
const expressSession = session as any;

function generateMockProfileData(userId: number) {
  // This data would come from LinkedIn API in a real implementation
  return {
    score: 76,
    activity: {
      profileViews: 127,
      postImpressions: 4300,
      newConnections: 28,
      engagementRate: 3.7
    },
    suggestions: [
      {
        id: 1,
        type: "headline",
        title: "Enhance Your Headline",
        impact: "High impact, low effort",
        description: "Your headline is missing keywords that recruiters search for. Add 2-3 industry-specific terms."
      },
      {
        id: 2,
        type: "projects",
        title: "Add Featured Projects",
        impact: "Medium impact, medium effort",
        description: "Showcase your work by adding 2-3 featured projects with visual content to increase profile visits."
      },
      {
        id: 3,
        type: "engagement",
        title: "Engage with Industry Posts",
        impact: "Medium impact, low effort",
        description: "Your comment engagement is lower than average. Comment on 3-5 trending posts in your industry this week."
      }
    ],
    recentPosts: [
      {
        id: 1,
        preview: "5 Key Marketing Trends for Q3 2023 - What Every CMO Needs...",
        type: "Text post",
        imageCount: 1,
        date: "2023-06-24",
        impressions: 2452,
        impressionChange: 18,
        engagement: 4.2,
        engagementChange: 0.8
      },
      {
        id: 2,
        preview: "Excited to announce my latest project with @TechInnovators...",
        type: "Text post",
        imageCount: 0,
        date: "2023-06-18",
        impressions: 1821,
        impressionChange: -5,
        engagement: 3.1,
        engagementChange: -0.4
      },
      {
        id: 3,
        preview: "Professional development tip: The one networking mistake...",
        type: "Text post",
        imageCount: 1,
        date: "2023-06-12",
        impressions: 3677,
        impressionChange: 42,
        engagement: 5.8,
        engagementChange: 2.1
      }
    ]
  };
}

import { 
  generateLinkedInContentIdeas, 
  optimizeLinkedInPost, 
  analyzeLinkedInProfile 
} from './openai';

async function generateContentIdeas(userId: number) {
  try {
    // Get user profile data to personalize content ideas
    const profile = await storage.getProfile(userId);
    if (!profile) {
      throw new Error("Profile not found");
    }

    // Generate content ideas using OpenAI
    const contentIdeas = await generateLinkedInContentIdeas(
      userId, 
      profile.profileData,
      {
        contentTypes: ["insight", "how-to", "story", "opinion"],
        industryFocus: "technology", // This could be customized based on user profile
        tonePreference: "professional"
      }
    );

    return contentIdeas;
  } catch (error) {
    console.error("Error generating content ideas:", error);
    // Fallback to static content ideas if OpenAI fails
    return [
      {
        title: "Industry Insights",
        content: "5 Ways AI is Transforming Marketing Strategy in 2023 - My Experience Implementing These Changes",
        category: "insight",
        estimatedEngagement: "high"
      },
      {
        title: "Personal Story",
        content: "The Career Pivot That Changed Everything: How I Went From [Previous Role] to [Current Role] in 12 Months",
        category: "story",
        estimatedEngagement: "medium"
      },
      {
        title: "How-To Guide",
        content: "LinkedIn Engagement Hack: How I Increased My Post Visibility by 300% Using This Simple 3-Step Process",
        category: "how-to",
        estimatedEngagement: "very-high"
      },
      {
        title: "Opinion Piece",
        content: "Why I Believe [Industry Trend] Is Overrated - And What We Should Focus On Instead",
        category: "opinion",
        estimatedEngagement: "high"
      }
    ];
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Use MemoryStore with the correct type cast for compatibility
  const MemStoreFactory = MemoryStore as any;
  const SessionStore = MemStoreFactory(session);

  // Generate a random session secret if one is not provided
  const sessionSecret = process.env.SESSION_SECRET || 
    crypto.randomBytes(32).toString('hex');
  
  // Log session configuration (without exposing the actual secret)
  console.log(`Session configuration: Using ${process.env.SESSION_SECRET ? 'provided' : 'generated'} secret`);
  console.log(`Session cookie secure: ${process.env.NODE_ENV === "production"}`);
  
  // Setup session middleware with proper type casting
  const sessionConfig = {
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: { 
      secure: process.env.NODE_ENV === "production", 
      maxAge: 86400000, // 1 day
      sameSite: 'lax' as 'lax' // Helps with CSRF protection
    },
    store: new SessionStore({
      checkPeriod: 86400000, // 24 hours
    })
  };
  
  app.use(expressSession(sessionConfig));

  // Setup passport
  app.use(passport.initialize());
  app.use(passport.session());

  // Remove the duplicate serialization code since it's already defined in linkedin-auth.ts
  // This was causing conflicts in the session handling

  // Local Auth Strategy for development (would be LinkedIn OAuth in production)
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user) {
          return done(null, false, { message: "Incorrect username" });
        }

        if (user.password !== password) {
          return done(null, false, { message: "Incorrect password" });
        }

        return done(null, user);
      } catch (err) {
        return done(err);
      }
    })
  );

  // Auth middleware is imported from linkedin-auth.ts
  // Using the imported version to ensure consistency

  // === AUTH ROUTES ===
  
  // Register
  app.post("/api/auth/register", async (req, res) => {
    try {
      const data = insertUserSchema.parse(req.body);
      
      const existingUser = await storage.getUserByUsername(data.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }

      const user = await storage.createUser(data);
      res.status(201).json({ message: "User created successfully" });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input data", errors: fromZodError(err).message });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // LinkedIn OAuth Routes
  
  // Start LinkedIn OAuth flow
  app.get('/api/auth/linkedin', (req, res, next) => {
    // Store the return URL in the session if it's provided
    if (req.query.returnTo) {
      // Use type assertion to handle session property access
      (req.session as any).returnTo = req.query.returnTo as string;
    }
    
    // Log the OAuth flow start
    console.log('Starting LinkedIn OAuth flow', 
      req.query.returnTo ? `with returnTo: ${req.query.returnTo}` : 'without returnTo');
    
    passport.authenticate('linkedin')(req, res, next);
  });
  
  // LinkedIn OAuth callback - register both callback URLs to handle both local and deployed environments
  const callbackHandler = (req: Request, res: Response) => {
    // Detailed logging of the callback request
    console.log('=== LINKEDIN CALLBACK RECEIVED ===');
    console.log(`Callback URL: ${req.originalUrl}`);
    console.log(`Authenticated: ${req.isAuthenticated()}`);
    console.log(`User ID: ${(req.user as any)?.id}`);
    console.log(`User object:`, JSON.stringify(req.user, null, 2));
    console.log(`Session ID: ${req.sessionID}`);
    console.log(`Session data:`, req.session);
    
    // Determine where to redirect after successful login
    let returnTo = '/dashboard'; // Default redirect location
    
    // Check for returnTo in session
    if (req.session && (req.session as any).returnTo) {
      returnTo = (req.session as any).returnTo;
      delete (req.session as any).returnTo;
    }
    
    console.log(`Redirecting to: ${returnTo}`);
    
    // Successful authentication, redirect to the specified page
    res.redirect(returnTo);
  };
  
  // Create a custom callback for better error handling
  const linkedInAuthMiddleware = (req: Request, res: Response, next: NextFunction) => {
    console.log('=== PROCESSING LINKEDIN CALLBACK REQUEST ===');
    console.log(`Request URL: ${req.originalUrl}`);
    console.log(`Request query params:`, req.query);
    
    passport.authenticate('linkedin', { session: true }, (err: any, user: any, info: any) => {
      console.log('LinkedIn passport.authenticate callback executing');
      
      if (err) {
        console.error('LinkedIn authentication ERROR:', err);
        return res.redirect('/auth?error=' + encodeURIComponent('Authentication failed'));
      }
      
      if (!user) {
        console.error('LinkedIn authentication failed - No user:', info);
        return res.redirect('/auth?error=' + encodeURIComponent('Authentication failed'));
      }
      
      // Log in the user manually
      req.logIn(user, (err) => {
        if (err) {
          console.error('Error during req.logIn:', err);
          return next(err);
        }
        
        console.log('User successfully logged in via LinkedIn:', user.id);
        return callbackHandler(req, res);
      });
    })(req, res, next);
  };
  
  // Register the callback URL for the LinkedIn OAuth flow - with detailed error handling
  app.get('/api/auth/linkedin/callback', linkedInAuthMiddleware);
  
  // Also register at the root level (needed for some environments)
  app.get('/auth/linkedin/callback', linkedInAuthMiddleware);
  
  // Special handler for the exact URL registered in LinkedIn developer console
  app.get('/', (req, res, next) => {
    console.log('=== ROOT PATH REQUEST WITH QUERY PARAMS ===');
    console.log(`Request URL: ${req.originalUrl}`);
    console.log('Query params:', req.query);
    
    // Check if this is a LinkedIn callback redirected to the root
    if (req.query.code && req.query.state && req.originalUrl.includes('code=')) {
      console.log('Detected LinkedIn OAuth callback params on root URL - handling with auth middleware');
      return linkedInAuthMiddleware(req, res, next);
    }
    
    next();
  });
  
  // Create a catch-all handler for LinkedIn callback to capture any callback format
  // This must be registered AFTER the more specific routes
  app.use((req, res, next) => {
    if (req.path.includes('linkedin/callback') || 
        (req.query.code && req.query.state && typeof req.query.code === 'string' && req.query.code.startsWith('AQ'))) {
      console.log('=== CATCH-ALL LINKEDIN CALLBACK RECEIVED ===');
      console.log(`Request URL: ${req.originalUrl}`);
      console.log(`Request path: ${req.path}`);
      console.log('Query params:', req.query);
      
      // Handle this as a LinkedIn callback
      return linkedInAuthMiddleware(req, res, next);
    }
    
    next();
  });
  
  // Get profile data from LinkedIn
  app.get('/api/auth/linkedin/profile', isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      if (!user.accessToken) {
        return res.status(400).json({ message: "No LinkedIn access token found" });
      }
      
      const profileData = await fetchLinkedInProfileData(user.accessToken);
      res.json(profileData);
    } catch (error) {
      console.error('Error fetching LinkedIn profile:', error);
      res.status(500).json({ message: "Failed to fetch LinkedIn profile" });
    }
  });

  // Login
  app.post("/api/auth/login", (req, res, next) => {
    passport.authenticate("local", (err: Error, user: Express.User, info: { message: string }) => {
      if (err) {
        return next(err);
      }
      if (!user) {
        return res.status(401).json({ message: info.message });
      }
      req.logIn(user, (err) => {
        if (err) {
          return next(err);
        }
        return res.json({ message: "Logged in successfully", user });
      });
    })(req, res, next);
  });

  // Logout
  app.post("/api/auth/logout", (req, res) => {
    req.logout(() => {
      res.json({ message: "Logged out successfully" });
    });
  });

  // Get current user
  app.get("/api/auth/user", (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    res.json({ user: req.user });
  });

  // === PROFILE ROUTES ===

  // Get profile data
  app.get("/api/profile", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      let profile = await storage.getProfile(userId);

      if (!profile) {
        // Create new profile with mock data for demo
        const mockProfileData = generateMockProfileData(userId);
        const newProfile = await storage.createProfile({
          userId,
          profileData: mockProfileData,
          profileScore: mockProfileData.score
        });
        profile = newProfile;
      }

      res.json(profile);
    } catch (err) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Update profile
  app.put("/api/profile", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const data = insertProfileSchema.partial().parse(req.body);
      
      let profile = await storage.getProfile(userId);
      
      if (!profile) {
        profile = await storage.createProfile({
          userId,
          ...data
        });
        return res.json(profile);
      }
      
      const updatedProfile = await storage.updateProfile(userId, data);
      res.json(updatedProfile);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input data", errors: fromZodError(err).message });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // === POSTS ROUTES ===

  // Get posts
  app.get("/api/posts", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const posts = await storage.getPosts(userId);
      res.json(posts);
    } catch (err) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Create post
  app.post("/api/posts", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const data = insertPostSchema.parse({
        ...req.body,
        userId
      });
      
      const post = await storage.createPost(data);
      res.status(201).json(post);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input data", errors: fromZodError(err).message });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get post by id
  app.get("/api/posts/:id", isAuthenticated, async (req, res) => {
    try {
      const postId = parseInt(req.params.id);
      if (isNaN(postId)) {
        return res.status(400).json({ message: "Invalid post ID" });
      }
      
      const post = await storage.getPost(postId);
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }
      
      if (post.userId !== (req.user as any).id) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      res.json(post);
    } catch (err) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Update post
  app.put("/api/posts/:id", isAuthenticated, async (req, res) => {
    try {
      const postId = parseInt(req.params.id);
      if (isNaN(postId)) {
        return res.status(400).json({ message: "Invalid post ID" });
      }
      
      const post = await storage.getPost(postId);
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }
      
      if (post.userId !== (req.user as any).id) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      const data = insertPostSchema.partial().parse(req.body);
      const updatedPost = await storage.updatePost(postId, data);
      
      res.json(updatedPost);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input data", errors: fromZodError(err).message });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Delete post
  app.delete("/api/posts/:id", isAuthenticated, async (req, res) => {
    try {
      const postId = parseInt(req.params.id);
      if (isNaN(postId)) {
        return res.status(400).json({ message: "Invalid post ID" });
      }
      
      const post = await storage.getPost(postId);
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }
      
      if (post.userId !== (req.user as any).id) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      await storage.deletePost(postId);
      res.json({ message: "Post deleted successfully" });
    } catch (err) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // === GOALS ROUTES ===

  // Get goals
  app.get("/api/goals", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const goals = await storage.getGoals(userId);
      res.json(goals);
    } catch (err) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Create goal
  app.post("/api/goals", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const data = insertGoalSchema.parse({
        ...req.body,
        userId
      });
      
      const goal = await storage.createGoal(data);
      res.status(201).json(goal);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input data", errors: fromZodError(err).message });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Update goal
  app.put("/api/goals/:id", isAuthenticated, async (req, res) => {
    try {
      const goalId = parseInt(req.params.id);
      if (isNaN(goalId)) {
        return res.status(400).json({ message: "Invalid goal ID" });
      }
      
      const goal = await storage.getGoal(goalId);
      if (!goal) {
        return res.status(404).json({ message: "Goal not found" });
      }
      
      if (goal.userId !== (req.user as any).id) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      const data = insertGoalSchema.partial().parse(req.body);
      const updatedGoal = await storage.updateGoal(goalId, data);
      
      res.json(updatedGoal);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input data", errors: fromZodError(err).message });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Delete goal
  app.delete("/api/goals/:id", isAuthenticated, async (req, res) => {
    try {
      const goalId = parseInt(req.params.id);
      if (isNaN(goalId)) {
        return res.status(400).json({ message: "Invalid goal ID" });
      }
      
      const goal = await storage.getGoal(goalId);
      if (!goal) {
        return res.status(404).json({ message: "Goal not found" });
      }
      
      if (goal.userId !== (req.user as any).id) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      await storage.deleteGoal(goalId);
      res.json({ message: "Goal deleted successfully" });
    } catch (err) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // === CONTENT SUGGESTIONS ROUTES ===

  // Get content suggestions
  app.get("/api/content-suggestions", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      let suggestions = await storage.getContentSuggestions(userId);
      
      // If no suggestions exist, generate some
      if (suggestions.length === 0) {
        const ideas = await generateContentIdeas(userId);
        for (const idea of ideas) {
          await storage.createContentSuggestion({
            userId,
            title: idea.title,
            content: idea.content,
            category: idea.category,
            estimatedEngagement: idea.estimatedEngagement
          });
        }
        
        suggestions = await storage.getContentSuggestions(userId);
      }
      
      res.json(suggestions);
    } catch (err) {
      console.error("Error getting content suggestions:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Generate new content suggestions
  app.post("/api/content-suggestions/generate", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const ideas = await generateContentIdeas(userId);
      
      const newSuggestions = [];
      for (const idea of ideas) {
        const suggestion = await storage.createContentSuggestion({
          userId,
          title: idea.title,
          content: idea.content,
          category: idea.category,
          estimatedEngagement: idea.estimatedEngagement
        });
        newSuggestions.push(suggestion);
      }
      
      res.status(201).json(newSuggestions);
    } catch (err) {
      console.error("Error generating content suggestions:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Mark content suggestion as used/saved
  app.put("/api/content-suggestions/:id", isAuthenticated, async (req, res) => {
    try {
      const suggestionId = parseInt(req.params.id);
      if (isNaN(suggestionId)) {
        return res.status(400).json({ message: "Invalid suggestion ID" });
      }
      
      const suggestion = await storage.getContentSuggestion(suggestionId);
      if (!suggestion) {
        return res.status(404).json({ message: "Suggestion not found" });
      }
      
      if (suggestion.userId !== (req.user as any).id) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      const data = insertContentSuggestionSchema.partial().parse(req.body);
      const updatedSuggestion = await storage.updateContentSuggestion(suggestionId, data);
      
      res.json(updatedSuggestion);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input data", errors: fromZodError(err).message });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Optimize a post using AI
  app.post("/api/posts/optimize", isAuthenticated, async (req, res) => {
    try {
      const { content, goal } = req.body;
      
      if (!content) {
        return res.status(400).json({ message: "Content is required" });
      }
      
      const optimizationGoal = goal || "engagement";
      const optimizedPost = await optimizeLinkedInPost(content, optimizationGoal);
      
      res.json(optimizedPost);
    } catch (err) {
      console.error("Error optimizing post:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // === ANALYTICS ENDPOINTS ===
  
  app.get("/api/analytics/overview", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const profile = await storage.getProfile(userId);
      
      if (!profile || !profile.profileData) {
        return res.status(404).json({ message: "Profile data not found" });
      }
      
      // Get data from profile for analytics overview
      res.json({
        profileViews: (profile.profileData as any).activity.profileViews,
        postImpressions: (profile.profileData as any).activity.postImpressions,
        newConnections: (profile.profileData as any).activity.newConnections,
        engagementRate: (profile.profileData as any).activity.engagementRate,
        // More analytics would be calculated here in a real implementation
      });
    } catch (err) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Initialize a demo user with sample content if no users exist
  app.get("/api/init-demo", async (req, res) => {
    try {
      const allUsers = Array.from((storage as any).users.values());
      
      if (allUsers.length === 0) {
        // Create demo user
        const user = await storage.createUser({
          username: "demo",
          password: "password",
          linkedinId: "demo123",
          email: "demo@example.com",
          fullName: "Sarah Johnson",
          headline: "Marketing Director | Brand Strategist",
          profileImage: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&q=80",
          isConnected: true,
          accessToken: "demo-token",
          refreshToken: "demo-refresh"
        });
        
        // Create profile
        const profileData = generateMockProfileData(user.id);
        await storage.createProfile({
          userId: user.id,
          profileData,
          profileScore: profileData.score
        });
        
        // Create goals
        await storage.createGoal({
          userId: user.id,
          title: "Grow network by 200",
          targetValue: 200,
          currentValue: 130,
          goalType: "connections",
          endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000) // 60 days from now
        });
        
        await storage.createGoal({
          userId: user.id,
          title: "Post 4x weekly",
          targetValue: 16,
          currentValue: 6,
          goalType: "posts",
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
        });
        
        // Create predefined content suggestions
        const staticIdeas = [
          {
            title: "Industry Insights",
            content: "5 Ways AI is Transforming Marketing Strategy in 2023 - My Experience Implementing These Changes",
            category: "insight",
            estimatedEngagement: "high"
          },
          {
            title: "Personal Story",
            content: "The Career Pivot That Changed Everything: How I Went From [Previous Role] to [Current Role] in 12 Months",
            category: "story",
            estimatedEngagement: "medium"
          },
          {
            title: "How-To Guide",
            content: "LinkedIn Engagement Hack: How I Increased My Post Visibility by 300% Using This Simple 3-Step Process",
            category: "how-to",
            estimatedEngagement: "very-high"
          },
          {
            title: "Opinion Piece",
            content: "Why I Believe [Industry Trend] Is Overrated - And What We Should Focus On Instead",
            category: "opinion",
            estimatedEngagement: "high"
          }
        ];
        
        for (const idea of staticIdeas) {
          await storage.createContentSuggestion({
            userId: user.id,
            title: idea.title,
            content: idea.content,
            category: idea.category,
            estimatedEngagement: idea.estimatedEngagement
          });
        }
        
        // Create sample posts
        for (const post of profileData.recentPosts) {
          await storage.createPost({
            userId: user.id,
            content: post.preview,
            postType: "text",
            hashtags: ["marketing", "leadership", "branding"],
            mediaUrls: post.imageCount > 0 ? ["https://example.com/placeholder.jpg"] : [],
            publishedAt: new Date(post.date),
            status: "published",
            linkedinPostId: `post-${post.id}`,
            engagementData: {
              impressions: post.impressions,
              engagementRate: post.engagement
            }
          });
        }
        
        res.json({ message: "Demo data initialized", login: { username: "demo", password: "password" } });
      } else {
        res.json({ message: "Users already exist, skipping demo initialization" });
      }
    } catch (err) {
      console.error("Error initializing demo:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  const httpServer = createServer(app);
  
  return httpServer;
}
