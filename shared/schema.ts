import { pgTable, text, serial, integer, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const posts = pgTable("posts", {
  id: serial("id").primaryKey(),
  content: text("content").notNull(),
  score: integer("score").notNull().default(0),
  reportCount: integer("report_count").notNull().default(0),
  postId: text("post_id").notNull().unique(), // Anonymous ID like #A7B9C2
  mediaUrl: text("media_url"), // URL for uploaded images/videos
  mediaType: text("media_type"), // 'image' or 'video'
  rudenessScore: integer("rudeness_score").notNull().default(0), // 0-100 scale
  isBoosted: boolean("is_boosted").notNull().default(false), // Extra visibility for rude posts
  challengeResponse: boolean("challenge_response").notNull().default(false), // Post responding to daily challenge
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const votes = pgTable("votes", {
  id: serial("id").primaryKey(),
  postId: integer("post_id").notNull(),
  voteType: text("vote_type").notNull(), // 'up' or 'down'
  ipHash: text("ip_hash").notNull(), // Hashed IP to prevent duplicate votes
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const reactions = pgTable("reactions", {
  id: serial("id").primaryKey(),
  postId: integer("post_id").notNull(),
  reactionType: text("reaction_type").notNull(), // 'savage', 'brutal', 'trash', 'boring', 'legendary', 'middle_finger'
  ipHash: text("ip_hash").notNull(), // Hashed IP to prevent duplicate reactions
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const reports = pgTable("reports", {
  id: serial("id").primaryKey(),
  postId: integer("post_id").notNull(),
  reason: text("reason"),
  ipHash: text("ip_hash").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const bannedPolitePosts = pgTable("banned_polite_posts", {
  id: serial("id").primaryKey(),
  content: text("content").notNull(),
  flaggedWords: text("flagged_words").array().notNull(),
  rudeResponse: text("rude_response").notNull(),
  ipHash: text("ip_hash").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const dailyChallenges = pgTable("daily_challenges", {
  id: serial("id").primaryKey(),
  prompt: text("prompt").notNull(),
  date: text("date").notNull(), // YYYY-MM-DD format
  isActive: boolean("is_active").notNull().default(true),
  responseCount: integer("response_count").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertPostSchema = createInsertSchema(posts).pick({
  content: true,
  mediaUrl: true,
  mediaType: true,
  challengeResponse: true,
});

export const insertVoteSchema = createInsertSchema(votes).pick({
  postId: true,
  voteType: true,
});

export const insertReactionSchema = createInsertSchema(reactions).pick({
  postId: true,
  reactionType: true,
});

export const insertReportSchema = createInsertSchema(reports).pick({
  postId: true,
  reason: true,
});

export const insertBannedPolitePostSchema = createInsertSchema(bannedPolitePosts).pick({
  content: true,
  flaggedWords: true,
  rudeResponse: true,
});

export const insertDailyChallengeSchema = createInsertSchema(dailyChallenges).pick({
  prompt: true,
  date: true,
});

export type InsertPost = z.infer<typeof insertPostSchema>;
export type Post = typeof posts.$inferSelect & {
  reactions?: { [key: string]: number };
  brutalityPercentage?: number;
};
export type InsertVote = z.infer<typeof insertVoteSchema>;
export type Vote = typeof votes.$inferSelect;
export type InsertReaction = z.infer<typeof insertReactionSchema>;
export type Reaction = typeof reactions.$inferSelect;
export type InsertReport = z.infer<typeof insertReportSchema>;
export type Report = typeof reports.$inferSelect;
export type InsertBannedPolitePost = z.infer<typeof insertBannedPolitePostSchema>;
export type BannedPolitePost = typeof bannedPolitePosts.$inferSelect;
export type InsertDailyChallenge = z.infer<typeof insertDailyChallengeSchema>;
export type DailyChallenge = typeof dailyChallenges.$inferSelect;