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
import { useToast } from "@/hooks/use-toast";
import type { Post } from "@shared/schema";

export default function Home() {
  const [postModalOpen, setPostModalOpen] = useState(false);
  const [guidelinesModalOpen, setGuidelinesModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  // Fetch posts
  const { data: posts = [], isLoading: postsLoading } = useQuery<Post[]>({
    queryKey: ["/api/posts"],
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

  // Report mutation
  const reportMutation = useMutation({
    mutationFn: async ({ postId, reason }: { postId: number; reason?: string }) => {
      await apiRequest('POST', `/api/posts/${postId}/report`, { reason });
    },
    onSuccess: () => {
      toast({
        title: "Post reported",
        description: "Thank you for helping maintain community standards.",
      });
    },
    onError: () => {
      toast({
        title: "Report failed",
        description: "Failed to report post. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleVote = (postId: number, voteType: 'up' | 'down') => {
    voteMutation.mutate({ postId, voteType });
  };

  const handleReport = (postId: number, reason?: string) => {
    reportMutation.mutate({ postId, reason });
  };

  const displayPosts = searchQuery.length > 0 ? searchResults : posts;
  const isLoading = searchQuery.length > 0 ? searchLoading : postsLoading;

  return (
    <div className="min-h-screen bg-slate-50">
      <Header
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onNewPost={() => setPostModalOpen(true)}
        onShowGuidelines={() => setGuidelinesModalOpen(true)}
      />

      <main className="max-w-4xl mx-auto px-4 py-6">
        {/* Feed Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-slate-800">
              {searchQuery ? `Search Results for "${searchQuery}"` : "Recent Posts"}
            </h2>
            <div className="flex items-center space-x-2 text-sm text-slate-500">
              <i className="fas fa-clock"></i>
              <span>Updated 2 minutes ago</span>
            </div>
          </div>

          {/* Statistics */}
          {stats && !searchQuery && (
            <Card className="mb-6">
              <CardContent className="p-4">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-xl font-semibold text-slate-800">
                      {stats.totalPosts.toLocaleString()}
                    </div>
                    <div className="text-sm text-slate-500">Total Posts</div>
                  </div>
                  <div>
                    <div className="text-xl font-semibold text-slate-800">
                      {stats.postsToday.toLocaleString()}
                    </div>
                    <div className="text-sm text-slate-500">Posts Today</div>
                  </div>
                  <div>
                    <div className="text-xl font-semibold text-slate-800">
                      {stats.activeUsers.toLocaleString()}
                    </div>
                    <div className="text-sm text-slate-500">Active Now</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Posts Feed */}
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="p-4">
                <div className="animate-pulse">
                  <div className="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-slate-200 rounded w-1/2"></div>
                </div>
              </Card>
            ))}
          </div>
        ) : displayPosts.length === 0 ? (
          <Card className="p-8 text-center">
            <div className="text-slate-500">
              {searchQuery ? "No posts found matching your search." : "No posts yet. Be the first to share something!"}
            </div>
          </Card>
        ) : (
          <div className="space-y-4">
            {displayPosts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onVote={handleVote}
                onReport={handleReport}
                isVoting={voteMutation.isPending}
                isReporting={reportMutation.isPending}
              />
            ))}
          </div>
        )}

        {/* Load More Button */}
        {!searchQuery && displayPosts.length > 0 && (
          <div className="text-center mt-8">
            <Button variant="outline" className="px-6">
              Load More Posts
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
