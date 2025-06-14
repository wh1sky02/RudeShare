import { posts, votes, reports, type Post, type InsertPost, type Vote, type InsertVote, type Report, type InsertReport } from "@shared/schema";
import crypto from "crypto";

export interface IStorage {
  // Posts
  getAllPosts(): Promise<Post[]>;
  getPostById(id: number): Promise<Post | undefined>;
  createPost(post: InsertPost, ipAddress: string): Promise<Post>;
  searchPosts(query: string): Promise<Post[]>;
  
  // Votes
  createVote(vote: InsertVote, ipAddress: string): Promise<Vote | null>;
  hasUserVoted(postId: number, ipAddress: string): Promise<boolean>;
  
  // Reports
  createReport(report: InsertReport, ipAddress: string): Promise<Report>;
  
  // Statistics
  getStatistics(): Promise<{
    totalPosts: number;
    postsToday: number;
    activeUsers: number;
  }>;
}

export class MemStorage implements IStorage {
  private posts: Map<number, Post>;
  private votes: Map<number, Vote>;
  private reports: Map<number, Report>;
  private currentPostId: number;
  private currentVoteId: number;
  private currentReportId: number;

  constructor() {
    this.posts = new Map();
    this.votes = new Map();
    this.reports = new Map();
    this.currentPostId = 1;
    this.currentVoteId = 1;
    this.currentReportId = 1;
  }

  private hashIP(ipAddress: string): string {
    return crypto.createHash('sha256').update(ipAddress).digest('hex');
  }

  private generatePostId(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `#${result}`;
  }

  async getAllPosts(): Promise<Post[]> {
    return Array.from(this.posts.values())
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getPostById(id: number): Promise<Post | undefined> {
    return this.posts.get(id);
  }

  async createPost(insertPost: InsertPost, ipAddress: string): Promise<Post> {
    const id = this.currentPostId++;
    const post: Post = {
      ...insertPost,
      id,
      score: 0,
      reportCount: 0,
      postId: this.generatePostId(),
      createdAt: new Date(),
    };
    this.posts.set(id, post);
    return post;
  }

  async searchPosts(query: string): Promise<Post[]> {
    const allPosts = await this.getAllPosts();
    const lowercaseQuery = query.toLowerCase();
    return allPosts.filter(post => 
      post.content.toLowerCase().includes(lowercaseQuery) ||
      post.postId.toLowerCase().includes(lowercaseQuery)
    );
  }

  async hasUserVoted(postId: number, ipAddress: string): Promise<boolean> {
    const ipHash = this.hashIP(ipAddress);
    return Array.from(this.votes.values()).some(
      vote => vote.postId === postId && vote.ipHash === ipHash
    );
  }

  async createVote(insertVote: InsertVote, ipAddress: string): Promise<Vote | null> {
    const ipHash = this.hashIP(ipAddress);
    
    // Check if user already voted on this post
    if (await this.hasUserVoted(insertVote.postId, ipAddress)) {
      return null;
    }

    const id = this.currentVoteId++;
    const vote: Vote = {
      ...insertVote,
      id,
      ipHash,
      createdAt: new Date(),
    };
    
    this.votes.set(id, vote);
    
    // Update post score
    const post = this.posts.get(insertVote.postId);
    if (post) {
      const scoreChange = insertVote.voteType === 'up' ? 1 : -1;
      post.score += scoreChange;
      this.posts.set(post.id, post);
    }
    
    return vote;
  }

  async createReport(insertReport: InsertReport, ipAddress: string): Promise<Report> {
    const ipHash = this.hashIP(ipAddress);
    const id = this.currentReportId++;
    const report: Report = {
      ...insertReport,
      id,
      ipHash,
      createdAt: new Date(),
    };
    
    this.reports.set(id, report);
    
    // Update post report count
    const post = this.posts.get(insertReport.postId);
    if (post) {
      post.reportCount += 1;
      this.posts.set(post.id, post);
    }
    
    return report;
  }

  async getStatistics(): Promise<{
    totalPosts: number;
    postsToday: number;
    activeUsers: number;
  }> {
    const totalPosts = this.posts.size;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const postsToday = Array.from(this.posts.values()).filter(
      post => new Date(post.createdAt) >= today
    ).length;
    
    // Approximate active users based on unique IP hashes from last hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentVotes = Array.from(this.votes.values()).filter(
      vote => new Date(vote.createdAt) >= oneHourAgo
    );
    const uniqueIPs = new Set(recentVotes.map(vote => vote.ipHash));
    const activeUsers = uniqueIPs.size;
    
    return {
      totalPosts,
      postsToday,
      activeUsers,
    };
  }
}

export const storage = new MemStorage();
