import { pgTable, text, serial, integer, boolean, timestamp, jsonb, index, pgEnum, foreignKey, unique } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

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
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  profileData: jsonb("profile_data"),
  profileScore: integer("profile_score"),
  lastUpdated: timestamp("last_updated").defaultNow(),
}, (table) => {
  return {
    userIdIdx: index("profile_user_id_idx").on(table.userId),
    uniqueUserProfile: unique("unique_user_profile").on(table.userId)
  };
});

export const insertProfileSchema = createInsertSchema(profiles).omit({
  id: true,
  lastUpdated: true,
});

// Post status enum
export const postStatusEnum = pgEnum('post_status', ['draft', 'scheduled', 'published']);

// Posts Model
export const posts = pgTable("posts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  postType: text("post_type").default("text"),
  hashtags: text("hashtags").array(),
  mediaUrls: text("media_urls").array(),
  scheduledFor: timestamp("scheduled_for"),
  publishedAt: timestamp("published_at"),
  status: text("status").default("draft"), // Using text for compatibility, but we're defining an enum too
  engagementData: jsonb("engagement_data"),
  linkedinPostId: text("linkedin_post_id"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => {
  return {
    userIdIdx: index("post_user_id_idx").on(table.userId),
    statusIdx: index("post_status_idx").on(table.status),
    scheduledForIdx: index("post_scheduled_for_idx").on(table.scheduledFor)
  };
});

export const insertPostSchema = createInsertSchema(posts).omit({
  id: true,
  createdAt: true,
});

// Goals Model
export const goals = pgTable("goals", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  targetValue: integer("target_value").notNull(),
  currentValue: integer("current_value").default(0),
  goalType: text("goal_type").notNull(), // connections, posts, engagement, etc.
  startDate: timestamp("start_date").defaultNow(),
  endDate: timestamp("end_date"),
  isCompleted: boolean("is_completed").default(false),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => {
  return {
    userIdIdx: index("goal_user_id_idx").on(table.userId),
    goalTypeIdx: index("goal_type_idx").on(table.goalType),
    isCompletedIdx: index("goal_is_completed_idx").on(table.isCompleted)
  };
});

export const insertGoalSchema = createInsertSchema(goals).omit({
  id: true,
  createdAt: true,
  isCompleted: true,
});

// Content Suggestions Model
export const contentSuggestions = pgTable("content_suggestions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  content: text("content").notNull(),
  category: text("category").notNull(),
  estimatedEngagement: text("estimated_engagement").default("medium"),
  isSaved: boolean("is_saved").default(false),
  isUsed: boolean("is_used").default(false),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => {
  return {
    userIdIdx: index("suggestion_user_id_idx").on(table.userId),
    categoryIdx: index("suggestion_category_idx").on(table.category),
    isSavedIdx: index("suggestion_is_saved_idx").on(table.isSaved),
    isUsedIdx: index("suggestion_is_used_idx").on(table.isUsed)
  };
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

// Set up relations between tables
export const usersRelations = relations(users, ({ one, many }) => ({
  profile: one(profiles, {
    fields: [users.id],
    references: [profiles.userId],
  }),
  posts: many(posts),
  goals: many(goals),
  contentSuggestions: many(contentSuggestions),
}));

export const profilesRelations = relations(profiles, ({ one }) => ({
  user: one(users, {
    fields: [profiles.userId],
    references: [users.id],
  }),
}));

export const postsRelations = relations(posts, ({ one }) => ({
  user: one(users, {
    fields: [posts.userId],
    references: [users.id],
  }),
}));

export const goalsRelations = relations(goals, ({ one }) => ({
  user: one(users, {
    fields: [goals.userId],
    references: [users.id],
  }),
}));

export const contentSuggestionsRelations = relations(contentSuggestions, ({ one }) => ({
  user: one(users, {
    fields: [contentSuggestions.userId],
    references: [users.id],
  }),
}));
