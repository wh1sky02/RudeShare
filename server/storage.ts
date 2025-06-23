import { posts, votes, reports, bannedPolitePosts, dailyChallenges, reactions, comments, commentVotes, type Post, type InsertPost, type Vote, type InsertVote, type Report, type InsertReport, type BannedPolitePost, type InsertBannedPolitePost, type DailyChallenge, type InsertDailyChallenge, type Reaction, type InsertReaction, type Comment, type InsertComment, type CommentVote, type InsertCommentVote } from "@shared/schema";
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
  
  // Reactions
  createReaction(reaction: InsertReaction, ipAddress: string): Promise<Reaction | null>;
  hasUserReacted(postId: number, reactionType: string, ipAddress: string): Promise<boolean>;
  getPostReactions(postId: number): Promise<{ [key: string]: number }>;
  
  // Reports
  createReport(report: InsertReport, ipAddress: string): Promise<Report>;
  
  // Banned Polite Posts (Hall of Shame)
  createBannedPolitePost(post: InsertBannedPolitePost, ipAddress: string): Promise<BannedPolitePost>;
  getBannedPolitePosts(limit?: number): Promise<BannedPolitePost[]>;
  
  // Daily Challenges
  getTodaysChallenge(): Promise<DailyChallenge | null>;
  createDailyChallenge(challenge: InsertDailyChallenge): Promise<DailyChallenge>;
  incrementChallengeResponses(challengeId: number): Promise<void>;
  
  // Comments
  getCommentsByPostId(postId: number, sortBy?: 'newest' | 'oldest' | 'popular'): Promise<Comment[]>;
  createComment(comment: InsertComment, ipAddress: string, rudenessScore: number): Promise<Comment>;
  
  // Comment Votes
  createCommentVote(vote: InsertCommentVote, ipAddress: string): Promise<CommentVote | null>;
  hasUserVotedOnComment(commentId: number, ipAddress: string): Promise<boolean>;
  
  // Statistics
  getStatistics(): Promise<{
    totalPosts: number;
    postsToday: number;
    activeUsers: number;
    avgRudenessScore: number;
    bannedPoliteCount: number;
    totalComments: number;
  }>;
}

export class MemStorage implements IStorage {
  private posts: Map<number, Post>;
  private votes: Map<number, Vote>;
  private reactions: Map<number, Reaction>;
  private reports: Map<number, Report>;
  private bannedPolitePosts: Map<number, BannedPolitePost>;
  private dailyChallenges: Map<number, DailyChallenge>;
  private comments: Map<number, Comment>;
  private commentVotes: Map<number, CommentVote>;
  private currentPostId: number;
  private currentVoteId: number;
  private currentReactionId: number;
  private currentReportId: number;
  private currentBannedPostId: number;
  private currentChallengeId: number;
  private currentCommentId: number;
  private currentCommentVoteId: number;

  constructor() {
    this.posts = new Map();
    this.votes = new Map();
    this.reactions = new Map();
    this.reports = new Map();
    this.bannedPolitePosts = new Map();
    this.dailyChallenges = new Map();
    this.comments = new Map();
    this.commentVotes = new Map();
    this.currentPostId = 1;
    this.currentVoteId = 1;
    this.currentReactionId = 1;
    this.currentReportId = 1;
    this.currentBannedPostId = 1;
    this.currentChallengeId = 1;
    this.currentCommentId = 1;
    this.currentCommentVoteId = 1;
    
    // Initialize today's challenge
    this.initializeTodaysChallenge();
  }

  private initializeTodaysChallenge() {
    const today = new Date().toISOString().split('T')[0];
    const existingChallenge = Array.from(this.dailyChallenges.values())
      .find(c => c.date === today);
    
    if (!existingChallenge) {
      const challenges = [
        "Roast your biggest failure this year",
        "What's the most overrated thing everyone loves?", 
        "Tear apart your worst habit",
        "Which popular opinion makes you want to scream?",
        "What trend needs to die immediately?"
      ];
      
      const randomPrompt = challenges[Math.floor(Math.random() * challenges.length)];
      const challenge: DailyChallenge = {
        id: this.currentChallengeId++,
        prompt: randomPrompt,
        date: today,
        isActive: true,
        responseCount: 0,
        createdAt: new Date(),
      };
      this.dailyChallenges.set(challenge.id, challenge);
    }
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

  private calculateBrutalityPercentage(post: Post): number {
    const reactions = Array.from(this.reactions.values()).filter(r => r.postId === post.id);
    const reactionCounts = reactions.reduce((acc, reaction) => {
      acc[reaction.reactionType] = (acc[reaction.reactionType] || 0) + 1;
      return acc;
    }, {} as { [key: string]: number });

    // Weight different reactions for brutality calculation
    const weights = {
      savage: 20,
      brutal: 18,
      middle_finger: 15,
      legendary: 12,
      trash: -5,
      boring: -10
    };

    let brutalityScore = post.rudenessScore || 0;
    
    Object.entries(reactionCounts).forEach(([type, count]) => {
      const weight = weights[type as keyof typeof weights] || 0;
      brutalityScore += weight * count;
    });

    return Math.min(Math.max(brutalityScore, 0), 100);
  }

  async getAllPosts(sortBy: 'newest' | 'oldest' | 'popular' | 'controversial' = 'newest'): Promise<Post[]> {
    const posts = Array.from(this.posts.values());
    
    // Add reactions, brutality percentage, and comment count to each post
    const postsWithReactions = await Promise.all(posts.map(async (post) => {
      const reactions = await this.getPostReactions(post.id);
      const brutalityPercentage = this.calculateBrutalityPercentage(post);
      const commentCount = Array.from(this.comments.values()).filter(comment => comment.postId === post.id).length;
      return {
        ...post,
        reactions,
        brutalityPercentage,
        commentCount
      };
    }));
    
    switch (sortBy) {
      case 'oldest':
        return postsWithReactions.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      case 'popular':
        return postsWithReactions.sort((a, b) => b.score - a.score);
      case 'controversial':
        // Sort by most reactions (engagement)
        return postsWithReactions.sort((a, b) => {
          const aTotal = Object.values(a.reactions || {}).reduce((sum, count) => sum + count, 0);
          const bTotal = Object.values(b.reactions || {}).reduce((sum, count) => sum + count, 0);
          return bTotal - aTotal;
        });
      case 'newest':
      default:
        return postsWithReactions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
  }

  async getPostById(id: number): Promise<Post | undefined> {
    const post = this.posts.get(id);
    if (!post) return undefined;
    
    const reactions = await this.getPostReactions(id);
    const brutalityPercentage = this.calculateBrutalityPercentage(post);
    const commentCount = Array.from(this.comments.values()).filter(comment => comment.postId === id).length;
    
    return {
      ...post,
      reactions,
      brutalityPercentage,
      commentCount
    };
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
    
    // Add reactions and brutality percentage
    const reactions = await this.getPostReactions(id);
    const brutalityPercentage = this.calculateBrutalityPercentage(post);
    
    return {
      ...post,
      reactions,
      brutalityPercentage
    };
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

  async hasUserReacted(postId: number, reactionType: string, ipAddress: string): Promise<boolean> {
    const ipHash = this.hashIP(ipAddress);
    return Array.from(this.reactions.values()).some(
      reaction => reaction.postId === postId && reaction.ipHash === ipHash
    );
  }

  async createReaction(insertReaction: InsertReaction, ipAddress: string): Promise<Reaction | null> {
    const ipHash = this.hashIP(ipAddress);
    
    // Check if user already reacted with this type on this post
    if (await this.hasUserReacted(insertReaction.postId, insertReaction.reactionType, ipAddress)) {
      return null;
    }

    const id = this.currentReactionId++;
    const reaction: Reaction = {
      ...insertReaction,
      id,
      ipHash,
      createdAt: new Date(),
    };
    
    this.reactions.set(id, reaction);
    return reaction;
  }

  async getPostReactions(postId: number): Promise<{ [key: string]: number }> {
    const postReactions = Array.from(this.reactions.values()).filter(r => r.postId === postId);
    const reactionCounts: { [key: string]: number } = {};
    
    postReactions.forEach(reaction => {
      reactionCounts[reaction.reactionType] = (reactionCounts[reaction.reactionType] || 0) + 1;
    });
    
    return reactionCounts;
  }

  async getReaction(postId: number, reactionType: string, ipAddress: string): Promise<Reaction | undefined> {
    const ipHash = this.hashIP(ipAddress);
    return Array.from(this.reactions.values()).find(
      reaction => reaction.postId === postId && reaction.reactionType === reactionType && reaction.ipHash === ipHash
    );
  }

  async removeReaction(reactionId: number): Promise<boolean> {
    return this.reactions.delete(reactionId);
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
        // Also remove associated votes, reactions, reports, and comments
        Array.from(this.votes.entries()).forEach(([voteId, vote]) => {
          if (vote.postId === id) {
            this.votes.delete(voteId);
          }
        });
        Array.from(this.reactions.entries()).forEach(([reactionId, reaction]) => {
          if (reaction.postId === id) {
            this.reactions.delete(reactionId);
          }
        });
        Array.from(this.reports.entries()).forEach(([reportId, report]) => {
          if (report.postId === id) {
            this.reports.delete(reportId);
          }
        });
        Array.from(this.comments.entries()).forEach(([commentId, comment]) => {
          if (comment.postId === id) {
            this.comments.delete(commentId);
            // Also remove associated comment votes
            Array.from(this.commentVotes.entries()).forEach(([voteId, vote]) => {
              if (vote.commentId === commentId) {
                this.commentVotes.delete(voteId);
              }
            });
          }
        });
        deletedCount++;
      }
    });
    
    return deletedCount;
  }

  // Banned Polite Posts (Hall of Shame)
  async createBannedPolitePost(insertPost: InsertBannedPolitePost, ipAddress: string): Promise<BannedPolitePost> {
    const id = this.currentBannedPostId++;
    const bannedPost: BannedPolitePost = {
      ...insertPost,
      id,
      ipHash: this.hashIP(ipAddress),
      createdAt: new Date(),
    };
    this.bannedPolitePosts.set(id, bannedPost);
    return bannedPost;
  }

  async getBannedPolitePosts(limit: number = 10): Promise<BannedPolitePost[]> {
    const posts = Array.from(this.bannedPolitePosts.values())
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
    return posts;
  }

  // Comments
  async getCommentsByPostId(postId: number, sortBy: 'newest' | 'oldest' | 'popular' = 'newest'): Promise<Comment[]> {
    const postComments = Array.from(this.comments.values()).filter(comment => comment.postId === postId);
    
    switch (sortBy) {
      case 'oldest':
        return postComments.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      case 'popular':
        return postComments.sort((a, b) => b.score - a.score);
      case 'newest':
      default:
        return postComments.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
  }

  async createComment(insertComment: InsertComment, ipAddress: string, rudenessScore: number): Promise<Comment> {
    const id = this.currentCommentId++;
    const comment: Comment = {
      ...insertComment,
      id,
      score: 0,
      commentId: this.generateCommentId(),
      rudenessScore,
      createdAt: new Date(),
    };
    this.comments.set(id, comment);
    return comment;
  }

  private generateCommentId(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `#C${result}`;
  }

  // Comment Votes
  async hasUserVotedOnComment(commentId: number, ipAddress: string): Promise<boolean> {
    const ipHash = this.hashIP(ipAddress);
    return Array.from(this.commentVotes.values()).some(
      vote => vote.commentId === commentId && vote.ipHash === ipHash
    );
  }

  async createCommentVote(insertVote: InsertCommentVote, ipAddress: string): Promise<CommentVote | null> {
    const ipHash = this.hashIP(ipAddress);
    
    // Check if user already voted on this comment
    if (await this.hasUserVotedOnComment(insertVote.commentId, ipAddress)) {
      return null;
    }

    const id = this.currentCommentVoteId++;
    const vote: CommentVote = {
      ...insertVote,
      id,
      ipHash,
      createdAt: new Date(),
    };
    
    this.commentVotes.set(id, vote);
    
    // Update comment score
    const comment = this.comments.get(insertVote.commentId);
    if (comment) {
      const scoreChange = insertVote.voteType === 'up' ? 1 : -1;
      comment.score += scoreChange;
      this.comments.set(comment.id, comment);
    }
    
    return vote;
  }


  // Daily Challenges
  async getTodaysChallenge(): Promise<DailyChallenge | null> {
    const today = new Date().toISOString().split('T')[0];
    const challenge = Array.from(this.dailyChallenges.values())
      .find(c => c.date === today && c.isActive);
    return challenge || null;
  }

  async createDailyChallenge(insertChallenge: InsertDailyChallenge): Promise<DailyChallenge> {
    const id = this.currentChallengeId++;
    const challenge: DailyChallenge = {
      ...insertChallenge,
      id,
      isActive: true,
      responseCount: 0,
      createdAt: new Date(),
    };
    this.dailyChallenges.set(id, challenge);
    return challenge;
  }

  async incrementChallengeResponses(challengeId: number): Promise<void> {
    const challenge = this.dailyChallenges.get(challengeId);
    if (challenge) {
      challenge.responseCount++;
      this.dailyChallenges.set(challengeId, challenge);
    }
  }

  async getStatistics(): Promise<{
    totalPosts: number;
    postsToday: number;
    activeUsers: number;
    avgRudenessScore: number;
    bannedPoliteCount: number;
    totalComments: number;
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
    const recentReactions = Array.from(this.reactions.values()).filter(
      reaction => new Date(reaction.createdAt) >= oneHourAgo
    );
    const recentCommentVotes = Array.from(this.commentVotes.values()).filter(
      vote => new Date(vote.createdAt) >= oneHourAgo
    );
    const uniqueIPs = new Set([
      ...recentVotes.map(vote => vote.ipHash),
      ...recentReactions.map(reaction => reaction.ipHash),
      ...recentCommentVotes.map(vote => vote.ipHash)
    ]);
    const activeUsers = uniqueIPs.size;

    // Calculate average rudeness score
    const posts = Array.from(this.posts.values());
    const avgRudenessScore = posts.length > 0 
      ? Math.round(posts.reduce((sum, post) => sum + post.rudenessScore, 0) / posts.length)
      : 0;

    const bannedPoliteCount = this.bannedPolitePosts.size;
    const totalComments = this.comments.size;
    
    return {
      totalPosts,
      postsToday,
      activeUsers,
      avgRudenessScore,
      bannedPoliteCount,
      totalComments,
    };
  }
}

export const storage = new MemStorage();
