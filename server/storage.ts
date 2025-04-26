import { 
  User, InsertUser, 
  Profile, InsertProfile,
  Post, InsertPost,
  Goal, InsertGoal,
  ContentSuggestion, InsertContentSuggestion,
  users, profiles, posts, goals, contentSuggestions
} from "@shared/schema";
import { db } from './db';
import { eq, and, gt } from 'drizzle-orm';
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from './db';

export interface IStorage {
  // Session store for authentication
  sessionStore: session.SessionStore;
  
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByLinkedInId(linkedinId: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, data: Partial<User>): Promise<User | undefined>;
  
  // Profile methods
  getProfile(userId: number): Promise<Profile | undefined>;
  createProfile(profile: InsertProfile): Promise<Profile>;
  updateProfile(userId: number, data: Partial<Profile>): Promise<Profile | undefined>;
  
  // Posts methods
  getPosts(userId: number): Promise<Post[]>;
  getPost(id: number): Promise<Post | undefined>;
  createPost(post: InsertPost): Promise<Post>;
  updatePost(id: number, data: Partial<Post>): Promise<Post | undefined>;
  deletePost(id: number): Promise<boolean>;
  getScheduledPosts(userId: number): Promise<Post[]>;
  
  // Goals methods
  getGoals(userId: number): Promise<Goal[]>;
  getGoal(id: number): Promise<Goal | undefined>;
  createGoal(goal: InsertGoal): Promise<Goal>;
  updateGoal(id: number, data: Partial<Goal>): Promise<Goal | undefined>;
  deleteGoal(id: number): Promise<boolean>;
  
  // Content Suggestions methods
  getContentSuggestions(userId: number): Promise<ContentSuggestion[]>;
  getContentSuggestion(id: number): Promise<ContentSuggestion | undefined>;
  createContentSuggestion(suggestion: InsertContentSuggestion): Promise<ContentSuggestion>;
  updateContentSuggestion(id: number, data: Partial<ContentSuggestion>): Promise<ContentSuggestion | undefined>;
  deleteContentSuggestion(id: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private profiles: Map<number, Profile>;
  private posts: Map<number, Post>;
  private goals: Map<number, Goal>;
  private contentSuggestions: Map<number, ContentSuggestion>;
  
  private currentUserId: number;
  private currentProfileId: number;
  private currentPostId: number;
  private currentGoalId: number;
  private currentSuggestionId: number;

  constructor() {
    this.users = new Map();
    this.profiles = new Map();
    this.posts = new Map();
    this.goals = new Map();
    this.contentSuggestions = new Map();
    
    this.currentUserId = 1;
    this.currentProfileId = 1;
    this.currentPostId = 1;
    this.currentGoalId = 1;
    this.currentSuggestionId = 1;
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }
  
  async getUserByLinkedInId(linkedinId: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.linkedinId === linkedinId,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const now = new Date();
    const user: User = { ...insertUser, id, createdAt: now };
    this.users.set(id, user);
    return user;
  }
  
  async updateUser(id: number, data: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...data };
    this.users.set(id, updatedUser);
    return updatedUser;
  }
  
  // Profile methods
  async getProfile(userId: number): Promise<Profile | undefined> {
    return Array.from(this.profiles.values()).find(
      (profile) => profile.userId === userId,
    );
  }
  
  async createProfile(insertProfile: InsertProfile): Promise<Profile> {
    const id = this.currentProfileId++;
    const now = new Date();
    const profile: Profile = { ...insertProfile, id, lastUpdated: now };
    this.profiles.set(id, profile);
    return profile;
  }
  
  async updateProfile(userId: number, data: Partial<Profile>): Promise<Profile | undefined> {
    const profile = Array.from(this.profiles.values()).find(
      (profile) => profile.userId === userId,
    );
    
    if (!profile) return undefined;
    
    const now = new Date();
    const updatedProfile = { ...profile, ...data, lastUpdated: now };
    this.profiles.set(profile.id, updatedProfile);
    return updatedProfile;
  }
  
  // Posts methods
  async getPosts(userId: number): Promise<Post[]> {
    return Array.from(this.posts.values()).filter(
      (post) => post.userId === userId,
    );
  }
  
  async getPost(id: number): Promise<Post | undefined> {
    return this.posts.get(id);
  }
  
  async createPost(insertPost: InsertPost): Promise<Post> {
    const id = this.currentPostId++;
    const now = new Date();
    const post: Post = { ...insertPost, id, createdAt: now };
    this.posts.set(id, post);
    return post;
  }
  
  async updatePost(id: number, data: Partial<Post>): Promise<Post | undefined> {
    const post = this.posts.get(id);
    if (!post) return undefined;
    
    const updatedPost = { ...post, ...data };
    this.posts.set(id, updatedPost);
    return updatedPost;
  }
  
  async deletePost(id: number): Promise<boolean> {
    return this.posts.delete(id);
  }
  
  async getScheduledPosts(userId: number): Promise<Post[]> {
    return Array.from(this.posts.values()).filter(
      (post) => post.userId === userId && post.status === 'scheduled',
    );
  }
  
  // Goals methods
  async getGoals(userId: number): Promise<Goal[]> {
    return Array.from(this.goals.values()).filter(
      (goal) => goal.userId === userId,
    );
  }
  
  async getGoal(id: number): Promise<Goal | undefined> {
    return this.goals.get(id);
  }
  
  async createGoal(insertGoal: InsertGoal): Promise<Goal> {
    const id = this.currentGoalId++;
    const now = new Date();
    const goal: Goal = { 
      ...insertGoal, 
      id, 
      createdAt: now,
      isCompleted: false
    };
    this.goals.set(id, goal);
    return goal;
  }
  
  async updateGoal(id: number, data: Partial<Goal>): Promise<Goal | undefined> {
    const goal = this.goals.get(id);
    if (!goal) return undefined;
    
    const updatedGoal = { ...goal, ...data };
    this.goals.set(id, updatedGoal);
    return updatedGoal;
  }
  
  async deleteGoal(id: number): Promise<boolean> {
    return this.goals.delete(id);
  }
  
  // Content Suggestions methods
  async getContentSuggestions(userId: number): Promise<ContentSuggestion[]> {
    return Array.from(this.contentSuggestions.values()).filter(
      (suggestion) => suggestion.userId === userId,
    );
  }
  
  async getContentSuggestion(id: number): Promise<ContentSuggestion | undefined> {
    return this.contentSuggestions.get(id);
  }
  
  async createContentSuggestion(insertSuggestion: InsertContentSuggestion): Promise<ContentSuggestion> {
    const id = this.currentSuggestionId++;
    const now = new Date();
    const suggestion: ContentSuggestion = { 
      ...insertSuggestion, 
      id, 
      createdAt: now,
      isSaved: false,
      isUsed: false
    };
    this.contentSuggestions.set(id, suggestion);
    return suggestion;
  }
  
  async updateContentSuggestion(id: number, data: Partial<ContentSuggestion>): Promise<ContentSuggestion | undefined> {
    const suggestion = this.contentSuggestions.get(id);
    if (!suggestion) return undefined;
    
    const updatedSuggestion = { ...suggestion, ...data };
    this.contentSuggestions.set(id, updatedSuggestion);
    return updatedSuggestion;
  }
  
  async deleteContentSuggestion(id: number): Promise<boolean> {
    return this.contentSuggestions.delete(id);
  }
}

export const storage = new MemStorage();
