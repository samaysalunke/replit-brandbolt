import { pgTable, serial, text, timestamp, json } from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';

// Define the profiles table
export const profiles = pgTable('profiles', {
  id: serial('id').primaryKey(),
  linkedin_id: text('linkedin_id').notNull().unique(),
  first_name: text('first_name').notNull(),
  last_name: text('last_name').notNull(),
  email: text('email').notNull(),
  access_token: text('access_token').notNull(),
  profile_data: json('profile_data').$type<any>(),
  created_at: timestamp('created_at').defaultNow(),
  last_updated: timestamp('last_updated').defaultNow(),
});

// Define types
export type Profile = typeof profiles.$inferSelect;
export type InsertProfile = typeof profiles.$inferInsert;

// Define Zod schemas for validation
export const insertProfileSchema = createInsertSchema(profiles);

// Create a version with custom validation
export const validatedProfileSchema = insertProfileSchema.extend({
  email: z.string().email(),
}).omit({ id: true, created_at: true });

export type User = Profile;
export type InsertUser = InsertProfile;