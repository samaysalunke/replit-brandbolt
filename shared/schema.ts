import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User Model
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  linkedinId: text("linkedin_id").unique(),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  email: text("email"),
  fullName: text("full_name"),
  profileImage: text("profile_image"),
  headline: text("headline"),
  isConnected: boolean("is_connected").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

// Profile Data Model
export const profiles = pgTable("profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  profileData: jsonb("profile_data"),
  profileScore: integer("profile_score"),
  lastUpdated: timestamp("last_updated").defaultNow(),
});

export const insertProfileSchema = createInsertSchema(profiles).omit({
  id: true,
  lastUpdated: true,
});

// Posts Model
export const posts = pgTable("posts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  content: text("content").notNull(),
  postType: text("post_type").default("text"),
  hashtags: text("hashtags").array(),
  mediaUrls: text("media_urls").array(),
  scheduledFor: timestamp("scheduled_for"),
  publishedAt: timestamp("published_at"),
  status: text("status").default("draft"), // draft, scheduled, published
  engagementData: jsonb("engagement_data"),
  linkedinPostId: text("linkedin_post_id"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertPostSchema = createInsertSchema(posts).omit({
  id: true,
  createdAt: true,
});

// Goals Model
export const goals = pgTable("goals", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  title: text("title").notNull(),
  targetValue: integer("target_value").notNull(),
  currentValue: integer("current_value").default(0),
  goalType: text("goal_type").notNull(), // connections, posts, engagement, etc.
  startDate: timestamp("start_date").defaultNow(),
  endDate: timestamp("end_date"),
  isCompleted: boolean("is_completed").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertGoalSchema = createInsertSchema(goals).omit({
  id: true,
  createdAt: true,
  isCompleted: true,
});

// Content Suggestions Model
export const contentSuggestions = pgTable("content_suggestions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  category: text("category").notNull(),
  estimatedEngagement: text("estimated_engagement").default("medium"),
  isSaved: boolean("is_saved").default(false),
  isUsed: boolean("is_used").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertContentSuggestionSchema = createInsertSchema(contentSuggestions).omit({
  id: true,
  createdAt: true,
});

// Type Definitions
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertProfile = z.infer<typeof insertProfileSchema>;
export type Profile = typeof profiles.$inferSelect;

export type InsertPost = z.infer<typeof insertPostSchema>;
export type Post = typeof posts.$inferSelect;

export type InsertGoal = z.infer<typeof insertGoalSchema>;
export type Goal = typeof goals.$inferSelect;

export type InsertContentSuggestion = z.infer<typeof insertContentSuggestionSchema>;
export type ContentSuggestion = typeof contentSuggestions.$inferSelect;
