import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import PostCard from "@/components/PostCard";
import DailyChallenge from "@/components/DailyChallenge";
import NewPostModal from "@/components/NewPostModal";
import GuidelinesModal from "@/components/GuidelinesModal";
import Footer from "@/components/Footer";
import { Post, Comment } from "@shared/schema";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { formatDistanceToNow } from "date-fns";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'popular' | 'controversial'>('newest');
  const [postModalOpen, setPostModalOpen] = useState(false);
  const [guidelinesModalOpen, setGuidelinesModalOpen] = useState(false);
  const [commentsModalOpen, setCommentsModalOpen] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState<number | null>(null);
  const [newComment, setNewComment] = useState("");
  const [commentSortBy, setCommentSortBy] = useState<'newest' | 'oldest' | 'popular'>('newest');
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch posts
  const { data: posts = [], isLoading: postsLoading } = useQuery({
    queryKey: ['/api/posts', sortBy],
    queryFn: async () => {
      const response = await fetch(`/api/posts?sort=${sortBy}`);
      if (!response.ok) throw new Error('Failed to fetch posts');
      return response.json() as Promise<Post[]>;
    }
  });

  // Fetch comments for the selected post
  const { data: postComments = [], isLoading: commentsLoading } = useQuery({
    queryKey: ['/api/posts', selectedPostId, 'comments', commentSortBy],
    queryFn: async () => {
      if (selectedPostId === null) return [];
      const response = await fetch(`/api/posts/${selectedPostId}/comments?sort=${commentSortBy}`);
      if (!response.ok) throw new Error('Failed to fetch comments');
      return response.json() as Promise<Comment[]>;
    },
    enabled: selectedPostId !== null
  });

  // Search posts
  const { data: searchResults = [], isLoading: searchLoading } = useQuery({
    queryKey: ['/api/posts/search', searchQuery],
    queryFn: async () => {
      if (!searchQuery.trim()) return [];
      const response = await fetch(`/api/posts/search?q=${encodeURIComponent(searchQuery)}`);
      if (!response.ok) throw new Error('Failed to search posts');
      return response.json() as Promise<Post[]>;
    },
    enabled: searchQuery.length > 0
  });

  // Fetch statistics
  const { data: stats } = useQuery({
    queryKey: ['/api/statistics'],
    queryFn: async () => {
      const response = await fetch('/api/statistics');
      if (!response.ok) throw new Error('Failed to fetch statistics');
      return response.json();
    }
  });

  // Vote mutation for posts
  const voteMutation = useMutation({
    mutationFn: async ({ postId, voteType }: { postId: number; voteType: 'up' | 'down' }) => {
      const response = await fetch(`/api/posts/${postId}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ voteType }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to vote');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/posts'] });
      queryClient.invalidateQueries({ queryKey: ['/api/statistics'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Vote failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Vote mutation for comments
  const commentVoteMutation = useMutation({
    mutationFn: async ({ commentId, voteType }: { commentId: number; voteType: 'up' | 'down' }) => {
      const response = await fetch(`/api/comments/${commentId}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ voteType }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to vote on comment');
      }
      
      return response.json();
    },
    onSuccess: () => {
      if (selectedPostId !== null) {
        queryClient.invalidateQueries({ queryKey: ['/api/posts', selectedPostId, 'comments'] });
        queryClient.invalidateQueries({ queryKey: ['/api/statistics'] });
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Comment vote failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Reaction mutation
  const reactionMutation = useMutation({
    mutationFn: async ({ postId, reactionType }: { postId: number; reactionType: string }) => {
      const response = await fetch(`/api/posts/${postId}/react`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reactionType }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to react');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/posts'] });
      queryClient.invalidateQueries({ queryKey: ['/api/statistics'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Reaction failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Comment creation mutation
  const commentMutation = useMutation({
    mutationFn: async ({ postId, content }: { postId: number; content: string }) => {
      const response = await fetch(`/api/posts/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to post comment');
      }
      
      return response.json();
    },
    onSuccess: () => {
      if (selectedPostId !== null) {
        queryClient.invalidateQueries({ queryKey: ['/api/posts', selectedPostId, 'comments'] });
        queryClient.invalidateQueries({ queryKey: ['/api/statistics'] });
      }
      setNewComment("");
    },
    onError: (error: Error) => {
      console.error("Comment posting error:", error);
      toast({
        title: "Comment failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleVote = (postId: number, voteType: 'up' | 'down') => {
    voteMutation.mutate({ postId, voteType });
  };

  const handleCommentVote = (commentId: number, voteType: 'up' | 'down') => {
    commentVoteMutation.mutate({ commentId, voteType });
  };

  const handleReaction = (postId: number, reactionType: string) => {
    reactionMutation.mutate({ postId, reactionType });
  };

  const handleDiscuss = (postId: number) => {
    setSelectedPostId(postId);
    setCommentsModalOpen(true);
  };

  const handleAddComment = () => {
    if (selectedPostId !== null && newComment.trim()) {
      commentMutation.mutate({ postId: selectedPostId, content: newComment });
    }
  };

  const handleRespondToChallenge = (prompt: string) => {
    toast({
      title: "Challenge Response",
      description: `Responding to challenge "${prompt}" is coming soon!`,
    });
  };

  const displayPosts = searchQuery.length > 0 ? searchResults : posts;
  const isLoading = searchQuery.length > 0 ? searchLoading : postsLoading;

  return (
    <div className="flex flex-col h-screen bg-background">
      <div className="fixed top-0 left-0 right-0 z-50 bg-background">
        <Header
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onNewPost={() => setPostModalOpen(true)}
          onShowGuidelines={() => setGuidelinesModalOpen(true)}
        />
      </div>

      <main className="flex-1 px-4 py-4 sm:py-6 mt-16 bg-background">
        <div className="flex max-w-7xl mx-auto h-full">
          {/* Left Sidebar */}
          <aside className="hidden lg:block w-64 mr-6">
            <div className="glass border border-border/50 rounded-2xl p-4 sticky top-6">
              <h3 className="text-lg font-bold mb-3 gradient-text">Trending Savagery</h3>
              <div className="space-y-3">
                <div className="text-sm text-muted-foreground">#BrutalHonesty</div>
                <div className="text-sm text-muted-foreground">#SavageTakes</div>
                <div className="text-sm text-muted-foreground">#NoFilter</div>
              </div>
            </div>
          </aside>
          
          {/* Main Content */}
          <div className="flex-1 max-w-4xl h-full">
        {/* Quick Action Bar */}
        {!searchQuery && (
          <div className="glass border border-border/50 rounded-2xl p-3 sm:p-4 mb-4 sm:mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
              <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
                <Button 
                  onClick={() => setPostModalOpen(true)}
                  className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white px-4 sm:px-6 py-2 touch-manipulation"
                >
                  <i className="fas fa-plus mr-2"></i>
                  <span className="hidden sm:inline">Post Something Brutal</span>
                  <span className="sm:hidden">Post Brutal Take</span>
                </Button>
                <div className="hidden sm:block h-8 border-l border-border/50"></div>
                <Select value={sortBy} onValueChange={(value: 'newest' | 'oldest' | 'popular' | 'controversial') => setSortBy(value)}>
                  <SelectTrigger className="w-full sm:w-36 bg-transparent border-none hover:bg-accent/30">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">🕐 Newest</SelectItem>
                    <SelectItem value="popular">🔥 Hot</SelectItem>
                    <SelectItem value="controversial">💀 Savage</SelectItem>
                    <SelectItem value="oldest">📜 Old</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="text-sm text-muted-foreground flex items-center justify-center sm:justify-start space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span>Live Feed</span>
              </div>
            </div>
          </div>
        )}

            {/* Search Results Header */}
            {searchQuery && (
              <div className="mb-4 sm:mb-6">
                <h2 className="text-lg sm:text-xl font-bold gradient-text flex items-center">
                  <i className="fas fa-search mr-2"></i>
                  Results for "{searchQuery}"
                </h2>
              </div>
            )}

            {/* Compact Stats */}
            {stats && !searchQuery && (
              <div className="glass border border-border/50 rounded-xl p-3 sm:p-4 mb-4 sm:mb-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0 text-sm">
                  <div className="grid grid-cols-3 sm:flex sm:items-center gap-4 sm:gap-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2 text-center sm:text-left">
                      <span className="text-xl sm:text-2xl font-bold gradient-text">{stats.totalPosts}</span>
                      <span className="text-muted-foreground text-xs sm:text-sm">posts</span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2 text-center sm:text-left">
                      <span className="text-xl sm:text-2xl font-bold gradient-text">{stats.postsToday}</span>
                      <span className="text-muted-foreground text-xs sm:text-sm">today</span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2 text-center sm:text-left">
                      <span className="text-xl sm:text-2xl font-bold gradient-text">{stats.activeUsers}</span>
                      <span className="text-muted-foreground text-xs sm:text-sm">users</span>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground bg-accent/30 px-3 py-1 rounded-full text-center sm:text-left">
                    Platform Stats
                  </div>
                </div>
              </div>
            )}

            {/* Posts Feed */}
            {isLoading ? (
              <div className="space-y-4 sm:space-y-6">
                {[...Array(3)].map((_, i) => (
                  <Card key={i} className="glass p-4 sm:p-6 border-border/50">
                    <div className="animate-pulse">
                      <div className="h-6 bg-accent/50 rounded-lg w-3/4 mb-4"></div>
                      <div className="h-4 bg-accent/30 rounded w-1/2 mb-2"></div>
                      <div className="h-4 bg-accent/30 rounded w-2/3"></div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : displayPosts.length === 0 ? (
              <Card className="glass p-8 sm:p-12 text-center border-border/50">
                <div className="text-muted-foreground text-base sm:text-lg">
                  {searchQuery ? (
                    <div className="space-y-2">
                      <i className="fas fa-search text-3xl sm:text-4xl text-primary/50 mb-4"></i>
                      <div>No results found for "{searchQuery}"</div>
                      <div className="text-sm">Try different keywords or check your spelling</div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <i className="fas fa-comments text-4xl sm:text-6xl text-primary/30 mb-4"></i>
                      <div className="text-xl sm:text-2xl font-bold gradient-text">Ready for Some Brutal Honesty?</div>
                      <div className="text-sm sm:text-base">Be the first to share your savage take</div>
                      <Button 
                        onClick={() => setPostModalOpen(true)}
                        className="mt-6 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white touch-manipulation"
                      >
                        <i className="fas fa-fire mr-2"></i>
                        Start the Chaos
                      </Button>
                    </div>
                  )}
                </div>
              </Card>
            ) : (
              <div className="space-y-3 sm:space-y-4">
                {displayPosts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    onVote={handleVote}
                    onReaction={handleReaction}
                    onDiscuss={handleDiscuss}
                    isVoting={voteMutation.isPending || reactionMutation.isPending}
                  />
                ))}
              </div>
            )}

            {/* End of Content Message */}
            {!searchQuery && displayPosts.length > 0 && (
              <div className="text-center mt-6 sm:mt-8 text-muted-foreground">
                <i className="fas fa-flag-checkered mr-2"></i>
                You've reached the end of the feed
              </div>
            )}
          </div>
          
          {/* Right Sidebar */}
          <aside className="hidden lg:block w-64 ml-6">
            <div className="space-y-6 sticky top-6">
              <div>
                <DailyChallenge onRespondToChallenge={handleRespondToChallenge} />
              </div>
              <div className="glass border border-border/50 rounded-2xl p-4">
                <h3 className="text-lg font-bold mb-3 gradient-text">Top Roasters</h3>
                <div className="space-y-3 p-3 bg-accent/10 rounded-lg border border-border/30">
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 bg-red-500 rounded-full"></div>
                    <span className="text-sm text-muted-foreground">SavageKing</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 bg-orange-500 rounded-full"></div>
                    <span className="text-sm text-muted-foreground">BrutalQueen</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 bg-yellow-500 rounded-full"></div>
                    <span className="text-sm text-muted-foreground">RoastMaster</span>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>

      {/* Footer removed as per request */}

      <NewPostModal
        open={postModalOpen}
        onOpenChange={setPostModalOpen}
      />

      <GuidelinesModal
        open={guidelinesModalOpen}
        onOpenChange={setGuidelinesModalOpen}
      />

      <Dialog open={commentsModalOpen} onOpenChange={setCommentsModalOpen}>
        <DialogContent className="glass border border-border/50 rounded-2xl max-w-2xl">
          <DialogHeader>
            <DialogTitle className="gradient-text">Savage Replies for Post {selectedPostId}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 max-h-[60vh] overflow-y-auto px-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Sort by:</span>
              <Select value={commentSortBy} onValueChange={(value: 'newest' | 'oldest' | 'popular') => setCommentSortBy(value)}>
                <SelectTrigger className="w-36 bg-transparent border-none hover:bg-accent/30">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">🕐 Newest</SelectItem>
                  <SelectItem value="popular">🔥 Popular</SelectItem>
                  <SelectItem value="oldest">📜 Oldest</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {commentsLoading ? (
              <div className="text-center py-6 text-muted-foreground">
                <i className="fas fa-spinner text-3xl text-primary/30 mb-2 animate-spin"></i>
                <p>Loading comments...</p>
              </div>
            ) : postComments.length > 0 ? (
              postComments.map(comment => (
                <div key={comment.id} className="p-3 bg-accent/30 rounded-xl border border-border/30 flex flex-col space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 bg-red-500 rounded-full"></div>
                      <span className="text-sm font-medium text-muted-foreground">Anonymous Roaster</span>
                    </div>
                    <span className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}</span>
                  </div>
                  <div className="text-foreground text-sm">{comment.content}</div>
                  <div className="flex items-center space-x-2 pt-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCommentVote(comment.id, 'up')}
                      disabled={commentVoteMutation.isPending}
                      className="text-muted-foreground hover:text-emerald-400 p-1 h-auto rounded-full hover:bg-emerald-500/10 transition-all duration-200 touch-manipulation"
                    >
                      <i className="fas fa-chevron-up text-xs"></i>
                    </Button>
                    <span className="text-xs font-bold text-foreground">{comment.score}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCommentVote(comment.id, 'down')}
                      disabled={commentVoteMutation.isPending}
                      className="text-muted-foreground hover:text-red-400 p-1 h-auto rounded-full hover:bg-red-500/10 transition-all duration-200 touch-manipulation"
                    >
                      <i className="fas fa-chevron-down text-xs"></i>
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                <i className="fas fa-comment-slash text-3xl text-primary/30 mb-2"></i>
                <p>No savage replies yet. Be the first to roast!</p>
              </div>
            )}
            <div className="flex gap-2 sticky bottom-0 bg-background/80 p-2">
              <Input
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Drop your brutal reply..."
                className="bg-accent/50 border-border/30 text-black"
              />
              <Button 
                onClick={handleAddComment} 
                disabled={!newComment.trim() || commentMutation.isPending}
                className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white touch-manipulation"
              >
                <i className="fas fa-fire mr-1"></i>
                Roast
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
