import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertPostSchema, insertVoteSchema, insertReportSchema } from "@shared/schema";
import { z } from "zod";
import multer from "multer";
import path from "path";
import fs from "fs";
import express from "express";

// Configure multer for file uploads
const upload = multer({
  dest: 'uploads/',
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|mp4|webm|mov/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only images (jpeg, jpg, png, gif) and videos (mp4, webm, mov) are allowed'));
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

  // Create new post
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
