import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import PostCard from "@/components/PostCard";
import NewPostModal from "@/components/NewPostModal";
import GuidelinesModal from "@/components/GuidelinesModal";
import Footer from "@/components/Footer";
import { Post } from "@shared/schema";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'popular' | 'controversial'>('newest');
  const [postModalOpen, setPostModalOpen] = useState(false);
  const [guidelinesModalOpen, setGuidelinesModalOpen] = useState(false);
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

  // Vote mutation
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

  const handleVote = (postId: number, voteType: 'up' | 'down') => {
    voteMutation.mutate({ postId, voteType });
  };

  const handleReaction = (postId: number, reactionType: string) => {
    reactionMutation.mutate({ postId, reactionType });
  };

  const displayPosts = searchQuery.length > 0 ? searchResults : posts;
  const isLoading = searchQuery.length > 0 ? searchLoading : postsLoading;

  return (
    <div className="min-h-screen bg-background">
      <Header
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onNewPost={() => setPostModalOpen(true)}
        onShowGuidelines={() => setGuidelinesModalOpen(true)}
      />

      <main className="max-w-4xl mx-auto px-4 py-4 sm:py-6">
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
                isVoting={voteMutation.isPending || reactionMutation.isPending}
              />
            ))}
          </div>
        )}

        {/* Load More Button */}
        {!searchQuery && displayPosts.length > 0 && (
          <div className="text-center mt-6 sm:mt-8">
            <Button 
              variant="outline" 
              className="px-6 py-2 border-border/50 hover:border-primary/50 hover:bg-accent/30 transition-all duration-200 touch-manipulation"
            >
              <i className="fas fa-chevron-down mr-2"></i>
              Load More
            </Button>
          </div>
        )}
      </main>

      <Footer onShowGuidelines={() => setGuidelinesModalOpen(true)} />

      <NewPostModal
        open={postModalOpen}
        onOpenChange={setPostModalOpen}
      />

      <GuidelinesModal
        open={guidelinesModalOpen}
        onOpenChange={setGuidelinesModalOpen}
      />
    </div>
  );
}