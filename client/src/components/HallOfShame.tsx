import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";
import type { BannedPolitePost } from "@shared/schema";

export default function HallOfShame() {
  const { data: bannedPosts = [], isLoading } = useQuery<BannedPolitePost[]>({
    queryKey: ["/api/hall-of-shame"],
    queryFn: async () => {
      const response = await fetch("/api/hall-of-shame?limit=10");
      if (!response.ok) throw new Error('Failed to fetch hall of shame');
      return response.json();
    },
  });

  if (isLoading) {
    return (
      <Card className="glass border-border/50">
        <CardHeader>
          <CardTitle className="gradient-text">
            <i className="fas fa-skull mr-3"></i>
            Hall of Shame
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-accent/30 rounded-lg"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (bannedPosts.length === 0) {
    return (
      <Card className="glass border-border/50">
        <CardHeader>
          <CardTitle className="gradient-text">
            <i className="fas fa-skull mr-3"></i>
            Hall of Shame
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-8">
            <i className="fas fa-ghost text-4xl mb-4 text-primary"></i>
            <p>No polite violations yet.</p>
            <p className="text-sm">Keep being brutal!</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass border-border/50">
      <CardHeader>
        <CardTitle className="gradient-text flex items-center justify-between">
          <span>
            <i className="fas fa-skull mr-3"></i>
            Hall of Shame
          </span>
          <span className="text-sm font-normal text-muted-foreground">
            Polite posts that got banned
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {bannedPosts.map((bannedPost) => (
          <div 
            key={bannedPost.id} 
            className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 hover:bg-red-500/15 transition-colors"
          >
            <div className="space-y-2">
              <div className="text-sm text-red-300 font-medium">
                BANNED: "{bannedPost.content}"
              </div>
              <div className="text-xs text-muted-foreground">
                Flagged words: {bannedPost.flaggedWords.join(", ")}
              </div>
              <div className="text-sm text-orange-300 font-bold border-t border-red-500/20 pt-2">
                Savage Response: "{bannedPost.rudeResponse}"
              </div>
              <div className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(bannedPost.createdAt), { addSuffix: true })}
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}