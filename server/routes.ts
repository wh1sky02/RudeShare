import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertPostSchema, insertVoteSchema, insertReactionSchema, insertReportSchema, insertCommentSchema, insertCommentVoteSchema } from "@shared/schema";
import { z } from "zod";
import multer from "multer";
import path from "path";
import fs from "fs";
import express from "express";
import { moderateContent, generateRudeResponse } from "./politeness-detector";

// Configure multer for image uploads only
const upload = multer({
  dest: 'uploads/',
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit for images
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = file.mimetype.startsWith('image/');
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only images (jpeg, jpg, png, gif, webp) are allowed'));
    }
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Create uploads directory if it doesn't exist
  if (!fs.existsSync('uploads')) {
    fs.mkdirSync('uploads');
  }

  // Serve uploaded files
  app.use('/uploads', (req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    next();
  });
  app.use('/uploads', express.static('uploads'));

  // Get all posts with sorting
  app.get("/api/posts", async (req, res) => {
    try {
      const sortBy = req.query.sort as 'newest' | 'oldest' | 'popular' | 'controversial' || 'newest';
      const posts = await storage.getAllPosts(sortBy);
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

  // Upload file endpoint
  app.post("/api/upload", upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      // Check file size limits based on type
      const isImage = req.file.mimetype.startsWith('image/');
      const isVideo = req.file.mimetype.startsWith('video/');
      const maxImageSize = 10 * 1024 * 1024; // 10MB for images
      const maxVideoSize = 50 * 1024 * 1024; // 50MB for videos

      if (isImage && req.file.size > maxImageSize) {
        fs.unlinkSync(req.file.path); // Delete uploaded file
        return res.status(400).json({ message: "Image file too large (max 10MB)" });
      }

      if (isVideo && req.file.size > maxVideoSize) {
        fs.unlinkSync(req.file.path); // Delete uploaded file
        return res.status(400).json({ message: "Video file too large (max 50MB)" });
      }

      const fileUrl = `/uploads/${req.file.filename}`;
      const mediaType = isImage ? 'image' : 'video';
      
      res.json({
        url: fileUrl,
        type: mediaType,
        size: req.file.size,
        originalName: req.file.originalname
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to upload file" });
    }
  });

  // Create new post with politeness detection
  app.post("/api/posts", async (req, res) => {
    try {
      const validatedData = insertPostSchema.parse(req.body);
      
      // Basic content validation
      if (validatedData.content.trim().length === 0 && !validatedData.mediaUrl) {
        return res.status(400).json({ message: "Post must have content or media" });
      }
      
      if (validatedData.content.length > 2000) {
        return res.status(400).json({ message: "Post content too long (max 2000 characters)" });
      }
      
      // Moderate content for illegal and polite content
      const moderation = moderateContent(validatedData.content);
      
      if (moderation.severity === 'banned_illegal') {
        return res.status(403).json({ 
          message: "Content banned for legal reasons (death threats/harassment)",
          flaggedWords: moderation.flaggedWords
        });
      }
      
      if (moderation.severity === 'banned_polite') {
        return res.status(403).json({ 
          message: "Content banned for being too polite. This is RudeShare!",
          flaggedWords: moderation.flaggedWords,
          rudeResponse: generateRudeResponse(moderation.flaggedWords)
        });
      }
      
      const clientIP = req.ip || req.connection.remoteAddress || '127.0.0.1';
      const post = await storage.createPost(validatedData, clientIP, 0);
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

  // React to post (toggle reaction)
  app.post("/api/posts/:id/react", async (req, res) => {
    try {
      const postId = parseInt(req.params.id);
      const reactionData = { ...req.body, postId };
      const validatedData = insertReactionSchema.parse(reactionData);
      
      const clientIP = req.ip || req.connection.remoteAddress || '127.0.0.1';
      const existingReaction = await storage.getReaction(validatedData.postId, validatedData.reactionType, clientIP);
      
      if (existingReaction) {
        // If reaction exists, remove it
        await storage.removeReaction(existingReaction.id);
        res.status(200).json({ message: "Reaction removed", reactionType: validatedData.reactionType });
      } else {
        // If no reaction exists, add it
        const reaction = await storage.createReaction(validatedData, clientIP);
        res.status(201).json(reaction);
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid reaction data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to record reaction" });
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

  // Get comments for a post
  app.get("/api/posts/:id/comments", async (req, res) => {
    try {
      const postId = parseInt(req.params.id);
      const sortBy = req.query.sort as 'newest' | 'oldest' | 'popular' || 'newest';
      const comments = await storage.getCommentsByPostId(postId, sortBy);
      res.json(comments);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch comments" });
    }
  });

  // Create a new comment
  app.post("/api/posts/:id/comments", async (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    try {
      const postId = parseInt(req.params.id);
      const commentData = { ...req.body, postId };
      const validatedData = insertCommentSchema.parse(commentData);
      
      // Basic content validation
      if (validatedData.content.trim().length === 0) {
        return res.status(400).json({ message: "Comment must have content" });
      }
      
      if (validatedData.content.length > 1000) {
        return res.status(400).json({ message: "Comment content too long (max 1000 characters)" });
      }
      
      // Moderate content for illegal and polite content
      const moderation = moderateContent(validatedData.content);
      
      if (moderation.severity === 'banned_illegal') {
        return res.status(403).json({ 
          message: "Content banned for legal reasons (death threats/harassment)",
          flaggedWords: moderation.flaggedWords
        });
      }
      
      if (moderation.severity === 'banned_polite') {
        return res.status(403).json({ 
          message: "Comment banned for being too polite. This is RudeShare!",
          flaggedWords: moderation.flaggedWords,
          rudeResponse: generateRudeResponse(moderation.flaggedWords)
        });
      }
      
      const clientIP = req.ip || req.connection.remoteAddress || '127.0.0.1';
      const comment = await storage.createComment(validatedData, clientIP, 0);
      res.status(201).json(comment);
    } catch (error) {
      console.error("Error in comment creation:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid comment data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create comment", error: error instanceof Error ? error.message : String(error) });
    }
  });

  // Vote on a comment
  app.post("/api/comments/:id/vote", async (req, res) => {
    try {
      const commentId = parseInt(req.params.id);
      const voteData = { ...req.body, commentId };
      const validatedData = insertCommentVoteSchema.parse(voteData);
      
      const clientIP = req.ip || req.connection.remoteAddress || '127.0.0.1';
      const vote = await storage.createCommentVote(validatedData, clientIP);
      
      if (!vote) {
        return res.status(409).json({ message: "You have already voted on this comment" });
      }
      
      res.status(201).json(vote);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid vote data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to record vote" });
    }
  });

  // Get Hall of Shame (banned polite posts)
  app.get("/api/hall-of-shame", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
      const bannedPosts = await storage.getBannedPolitePosts(limit);
      res.json(bannedPosts);
    } catch (error) {
      res.status(500).json({ message: "Failed to get hall of shame" });
    }
  });

  // Get today's brutal challenge
  app.get("/api/daily-challenge", async (req, res) => {
    try {
      const challenge = await storage.getTodaysChallenge();
      res.json(challenge);
    } catch (error) {
      res.status(500).json({ message: "Failed to get daily challenge" });
    }
  });

  // Cleanup old posts (can be called manually or via cron)
  app.post("/api/cleanup", async (req, res) => {
    try {
      const deletedCount = await storage.cleanupOldPosts();
      res.json({ message: `Cleaned up ${deletedCount} old posts` });
    } catch (error) {
      res.status(500).json({ message: "Failed to cleanup posts" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
