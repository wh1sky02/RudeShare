import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
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
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const votes = pgTable("votes", {
  id: serial("id").primaryKey(),
  postId: integer("post_id").notNull(),
  voteType: text("vote_type").notNull(), // 'up' or 'down'
  ipHash: text("ip_hash").notNull(), // Hashed IP to prevent duplicate votes
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const reports = pgTable("reports", {
  id: serial("id").primaryKey(),
  postId: integer("post_id").notNull(),
  reason: text("reason"),
  ipHash: text("ip_hash").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertPostSchema = createInsertSchema(posts).pick({
  content: true,
  mediaUrl: true,
  mediaType: true,
});

export const insertVoteSchema = createInsertSchema(votes).pick({
  postId: true,
  voteType: true,
});

export const insertReportSchema = createInsertSchema(reports).pick({
  postId: true,
  reason: true,
});

export type InsertPost = z.infer<typeof insertPostSchema>;
export type Post = typeof posts.$inferSelect;
export type InsertVote = z.infer<typeof insertVoteSchema>;
export type Vote = typeof votes.$inferSelect;
export type InsertReport = z.infer<typeof insertReportSchema>;
export type Report = typeof reports.$inferSelect;
