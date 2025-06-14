import { posts, votes, reports, bannedPolitePosts, dailyChallenges, type Post, type InsertPost, type Vote, type InsertVote, type Report, type InsertReport, type BannedPolitePost, type InsertBannedPolitePost, type DailyChallenge, type InsertDailyChallenge } from "@shared/schema";
import crypto from "crypto";

export interface IStorage {
  // Posts
  getAllPosts(sortBy?: 'newest' | 'oldest' | 'popular' | 'controversial'): Promise<Post[]>;
  getPostById(id: number): Promise<Post | undefined>;
  createPost(post: InsertPost, ipAddress: string, rudenessScore: number): Promise<Post>;
  searchPosts(query: string): Promise<Post[]>;
  cleanupOldPosts(): Promise<number>; // Returns number of deleted posts
  
  // Votes
  createVote(vote: InsertVote, ipAddress: string): Promise<Vote | null>;
  hasUserVoted(postId: number, ipAddress: string): Promise<boolean>;
  
  // Reports
  createReport(report: InsertReport, ipAddress: string): Promise<Report>;
  
  // Banned Polite Posts (Hall of Shame)
  createBannedPolitePost(post: InsertBannedPolitePost, ipAddress: string): Promise<BannedPolitePost>;
  getBannedPolitePosts(limit?: number): Promise<BannedPolitePost[]>;
  
  // Daily Challenges
  getTodaysChallenge(): Promise<DailyChallenge | null>;
  createDailyChallenge(challenge: InsertDailyChallenge): Promise<DailyChallenge>;
  incrementChallengeResponses(challengeId: number): Promise<void>;
  
  // Statistics
  getStatistics(): Promise<{
    totalPosts: number;
    postsToday: number;
    activeUsers: number;
    avgRudenessScore: number;
    bannedPoliteCount: number;
  }>;
}

export class MemStorage implements IStorage {
  private posts: Map<number, Post>;
  private votes: Map<number, Vote>;
  private reports: Map<number, Report>;
  private bannedPolitePosts: Map<number, BannedPolitePost>;
  private dailyChallenges: Map<number, DailyChallenge>;
  private currentPostId: number;
  private currentVoteId: number;
  private currentReportId: number;
  private currentBannedPostId: number;
  private currentChallengeId: number;

  constructor() {
    this.posts = new Map();
    this.votes = new Map();
    this.reports = new Map();
    this.bannedPolitePosts = new Map();
    this.dailyChallenges = new Map();
    this.currentPostId = 1;
    this.currentVoteId = 1;
    this.currentReportId = 1;
    this.currentBannedPostId = 1;
    this.currentChallengeId = 1;
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

  async getAllPosts(sortBy: 'newest' | 'oldest' | 'popular' | 'controversial' = 'newest'): Promise<Post[]> {
    const posts = Array.from(this.posts.values());
    
    switch (sortBy) {
      case 'oldest':
        return posts.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      case 'popular':
        return posts.sort((a, b) => b.score - a.score);
      case 'controversial':
        // Sort by most votes (regardless of positive/negative)
        const postVoteCounts = new Map<number, number>();
        Array.from(this.votes.values()).forEach(vote => {
          postVoteCounts.set(vote.postId, (postVoteCounts.get(vote.postId) || 0) + 1);
        });
        return posts.sort((a, b) => (postVoteCounts.get(b.id) || 0) - (postVoteCounts.get(a.id) || 0));
      case 'newest':
      default:
        return posts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
  }

  async getPostById(id: number): Promise<Post | undefined> {
    return this.posts.get(id);
  }

  async createPost(insertPost: InsertPost, ipAddress: string, rudenessScore: number): Promise<Post> {
    const id = this.currentPostId++;
    const post: Post = {
      ...insertPost,
      id,
      score: 0,
      reportCount: 0,
      postId: this.generatePostId(),
      mediaUrl: insertPost.mediaUrl || null,
      mediaType: insertPost.mediaType || null,
      rudenessScore,
      isBoosted: rudenessScore >= 80,
      challengeResponse: insertPost.challengeResponse || false,
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
      reason: insertReport.reason || null,
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

  async cleanupOldPosts(): Promise<number> {
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
    let deletedCount = 0;
    
    Array.from(this.posts.entries()).forEach(([id, post]) => {
      // Delete posts older than 3 days with no votes
      if (new Date(post.createdAt) < threeDaysAgo && post.score === 0) {
        this.posts.delete(id);
        // Also remove associated votes and reports
        Array.from(this.votes.entries()).forEach(([voteId, vote]) => {
          if (vote.postId === id) {
            this.votes.delete(voteId);
          }
        });
        Array.from(this.reports.entries()).forEach(([reportId, report]) => {
          if (report.postId === id) {
            this.reports.delete(reportId);
          }
        });
        deletedCount++;
      }
    });
    
    return deletedCount;
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
