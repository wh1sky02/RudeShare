import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PostCard from "@/components/PostCard";
import NewPostModal from "@/components/NewPostModal";
import GuidelinesModal from "@/components/GuidelinesModal";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import type { Post } from "@shared/schema";

export default function Home() {
  const [postModalOpen, setPostModalOpen] = useState(false);
  const [guidelinesModalOpen, setGuidelinesModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'popular' | 'controversial'>('newest');
  const { toast } = useToast();

  // Fetch posts
  const { data: posts = [], isLoading: postsLoading } = useQuery<Post[]>({
    queryKey: ["/api/posts", sortBy],
    queryFn: async () => {
      const response = await fetch(`/api/posts?sort=${sortBy}`);
      if (!response.ok) throw new Error('Failed to fetch posts');
      return response.json();
    },
  });

  // Fetch search results
  const { data: searchResults = [], isLoading: searchLoading } = useQuery<Post[]>({
    queryKey: ["/api/posts/search", searchQuery],
    enabled: searchQuery.length > 0,
  });

  // Fetch statistics
  const { data: stats } = useQuery<{
    totalPosts: number;
    postsToday: number;
    activeUsers: number;
  }>({
    queryKey: ["/api/statistics"],
  });

  // Vote mutation
  const voteMutation = useMutation({
    mutationFn: async ({ postId, voteType }: { postId: number; voteType: 'up' | 'down' }) => {
      await apiRequest('POST', `/api/posts/${postId}/vote`, { voteType });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/posts", sortBy] });
    },
    onError: (error: any) => {
      if (error.message.includes('409')) {
        toast({
          title: "Already voted",
          description: "You have already voted on this post.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Vote failed",
          description: "Failed to record your vote. Please try again.",
          variant: "destructive",
        });
      }
    },
  });



  const handleVote = (postId: number, voteType: 'up' | 'down') => {
    voteMutation.mutate({ postId, voteType });
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

      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Feed Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold gradient-text">
              {searchQuery ? `Search Results for "${searchQuery}"` : "Latest Brutal Takes"}
            </h2>
            <div className="flex items-center space-x-4">
              {!searchQuery && (
                <Select value={sortBy} onValueChange={(value: 'newest' | 'oldest' | 'popular' | 'controversial') => setSortBy(value)}>
                  <SelectTrigger className="w-48 bg-card border-border/50 hover:border-primary/50 transition-colors">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border/50">
                    <SelectItem value="newest">
                      <i className="fas fa-clock mr-2 text-primary"></i>
                      Newest
                    </SelectItem>
                    <SelectItem value="oldest">
                      <i className="fas fa-history mr-2 text-primary"></i>
                      Oldest
                    </SelectItem>
                    <SelectItem value="popular">
                      <i className="fas fa-fire mr-2 text-primary"></i>
                      Popular
                    </SelectItem>
                    <SelectItem value="controversial">
                      <i className="fas fa-comments mr-2 text-primary"></i>
                      Most Discussed
                    </SelectItem>
                  </SelectContent>
                </Select>
              )}
              <div className="flex items-center space-x-2 text-sm text-muted-foreground bg-accent/30 px-3 py-2 rounded-full">
                <i className="fas fa-sync-alt text-green-400"></i>
                <span className="font-medium">Live</span>
              </div>
            </div>
          </div>

          {/* Statistics */}
          {stats && !searchQuery && (
            <Card className="glass mb-8 border-border/50 glow-red">
              <CardContent className="p-6">
                <div className="grid grid-cols-3 gap-6 text-center">
                  <div className="group">
                    <div className="text-3xl font-bold gradient-text mb-2">
                      {stats.totalPosts.toLocaleString()}
                    </div>
                    <div className="text-sm text-muted-foreground font-medium tracking-wide">Brutal Posts</div>
                  </div>
                  <div className="group border-x border-border/30">
                    <div className="text-3xl font-bold gradient-text mb-2">
                      {stats.postsToday.toLocaleString()}
                    </div>
                    <div className="text-sm text-muted-foreground font-medium tracking-wide">Today's Rants</div>
                  </div>
                  <div className="group">
                    <div className="text-3xl font-bold gradient-text mb-2">
                      {stats.activeUsers.toLocaleString()}
                    </div>
                    <div className="text-sm text-muted-foreground font-medium tracking-wide">Savage Users</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Posts Feed */}
        {isLoading ? (
          <div className="space-y-6">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="glass p-6 border-border/50">
                <div className="animate-pulse">
                  <div className="h-6 bg-accent/50 rounded-lg w-3/4 mb-4"></div>
                  <div className="h-4 bg-accent/30 rounded w-1/2 mb-2"></div>
                  <div className="h-4 bg-accent/30 rounded w-2/3"></div>
                </div>
              </Card>
            ))}
          </div>
        ) : displayPosts.length === 0 ? (
          <Card className="glass p-12 text-center border-border/50">
            <div className="text-muted-foreground text-lg">
              {searchQuery ? (
                <div className="space-y-2">
                  <i className="fas fa-search text-3xl mb-4 text-primary"></i>
                  <div>No brutal posts found matching your search.</div>
                  <div className="text-sm">Try different keywords or check your spelling.</div>
                </div>
              ) : (
                <div className="space-y-4">
                  <i className="fas fa-fire text-4xl mb-4 text-primary"></i>
                  <div className="text-xl font-semibold">No posts yet!</div>
                  <div>Be the first to drop some brutal honesty.</div>
                  <Button 
                    onClick={() => setPostModalOpen(true)}
                    className="mt-4 bg-primary hover:bg-primary/90 glow-red-hover"
                  >
                    Start the Chaos
                  </Button>
                </div>
              )}
            </div>
          </Card>
        ) : (
          <div className="space-y-6">
            {displayPosts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onVote={handleVote}
                isVoting={voteMutation.isPending}
              />
            ))}
          </div>
        )}

        {/* Load More Button */}
        {!searchQuery && displayPosts.length > 0 && (
          <div className="text-center mt-12">
            <Button 
              variant="outline" 
              className="px-8 py-3 border-border/50 hover:border-primary/50 hover:bg-accent/30 transition-all duration-200 font-medium"
            >
              <i className="fas fa-chevron-down mr-2"></i>
              Load More Savage Takes
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
