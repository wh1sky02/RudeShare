import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertPostSchema, insertVoteSchema, insertReportSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Get all posts
  app.get("/api/posts", async (req, res) => {
    try {
      const posts = await storage.getAllPosts();
      res.json(posts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch posts" });
    }
  });

  // Search posts
  app.get("/api/posts/search", async (req, res) => {
    try {
      const query = req.query.q as string;
      if (!query) {
        return res.status(400).json({ message: "Search query is required" });
      }
      const posts = await storage.searchPosts(query);
      res.json(posts);
    } catch (error) {
      res.status(500).json({ message: "Failed to search posts" });
    }
  });

  // Create new post
  app.post("/api/posts", async (req, res) => {
    try {
      const validatedData = insertPostSchema.parse(req.body);
      
      // Basic content validation
      if (validatedData.content.trim().length === 0) {
        return res.status(400).json({ message: "Post content cannot be empty" });
      }
      
      if (validatedData.content.length > 2000) {
        return res.status(400).json({ message: "Post content too long (max 2000 characters)" });
      }
      
      const clientIP = req.ip || req.connection.remoteAddress || '127.0.0.1';
      const post = await storage.createPost(validatedData, clientIP);
      res.status(201).json(post);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid post data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create post" });
    }
  });

  // Vote on post
  app.post("/api/posts/:id/vote", async (req, res) => {
    try {
      const postId = parseInt(req.params.id);
      const voteData = { ...req.body, postId };
      const validatedData = insertVoteSchema.parse(voteData);
      
      const clientIP = req.ip || req.connection.remoteAddress || '127.0.0.1';
      const vote = await storage.createVote(validatedData, clientIP);
      
      if (!vote) {
        return res.status(409).json({ message: "You have already voted on this post" });
      }
      
      res.status(201).json(vote);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid vote data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to record vote" });
    }
  });

  // Report post
  app.post("/api/posts/:id/report", async (req, res) => {
    try {
      const postId = parseInt(req.params.id);
      const reportData = { ...req.body, postId };
      const validatedData = insertReportSchema.parse(reportData);
      
      const clientIP = req.ip || req.connection.remoteAddress || '127.0.0.1';
      const report = await storage.createReport(validatedData, clientIP);
      
      res.status(201).json({ message: "Post reported successfully" });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid report data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to report post" });
    }
  });

  // Get statistics
  app.get("/api/statistics", async (req, res) => {
    try {
      const stats = await storage.getStatistics();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch statistics" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
