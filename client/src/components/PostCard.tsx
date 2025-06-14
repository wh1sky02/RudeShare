import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { Post } from "@shared/schema";

interface PostCardProps {
  post: Post;
  onVote: (postId: number, voteType: 'up' | 'down') => void;
  isVoting: boolean;
}

export default function PostCard({ post, onVote, isVoting }: PostCardProps) {
  const handleUpvote = () => onVote(post.id, 'up');
  const handleDownvote = () => onVote(post.id, 'down');

  const timeAgo = formatDistanceToNow(new Date(post.createdAt), { addSuffix: true });

  return (
    <Card className="glass p-4 sm:p-6 hover:shadow-xl transition-all duration-300 border-border/50 float-animation">
      <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
        {/* Content Column - Full width on mobile */}
        <div className="flex-1 min-w-0 order-2 sm:order-1">
          <div className="prose prose-slate max-w-none">
            {post.content && (
              <p className="text-foreground leading-relaxed whitespace-pre-wrap text-base sm:text-lg font-medium">
                {post.content}
              </p>
            )}
            
            {/* Media Content */}
            {post.mediaUrl && (
              <div className="mt-4">
                {post.mediaType === 'image' ? (
                  <img
                    src={post.mediaUrl}
                    alt="User uploaded content"
                    className="max-w-full h-auto rounded-xl border border-border/30 shadow-lg cursor-pointer"
                    style={{ maxHeight: '400px' }}
                    onClick={() => window.open(post.mediaUrl!, '_blank')}
                  />
                ) : post.mediaType === 'video' ? (
                  <video
                    src={post.mediaUrl}
                    controls
                    className="max-w-full h-auto rounded-xl border border-border/30 shadow-lg"
                    style={{ maxHeight: '400px' }}
                    playsInline
                  >
                    Your browser does not support the video tag.
                  </video>
                ) : null}
              </div>
            )}
          </div>

          {/* Post Meta */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-4 pt-4 border-t border-border/30 space-y-2 sm:space-y-0">
            <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-sm text-muted-foreground">
              <span className="font-medium">{timeAgo}</span>
              <span className="font-mono text-xs bg-accent/50 px-2 py-1 rounded-full">{post.postId}</span>
              
              {/* Escalating Rudeness Meter */}
              {post.rudenessScore > 0 && (
                <div className="flex items-center space-x-2">
                  <div className={`px-2 py-1 rounded-full text-xs font-bold ${
                    post.rudenessScore >= 80 ? 'bg-red-500/20 text-red-400' :
                    post.rudenessScore >= 60 ? 'bg-orange-500/20 text-orange-400' :
                    post.rudenessScore >= 40 ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-green-500/20 text-green-400'
                  }`}>
                    🔥 {post.rudenessScore}% SAVAGE
                  </div>
                  {post.isBoosted && (
                    <div className="bg-red-500/30 px-2 py-1 rounded-full text-xs font-bold text-red-300 glow-red">
                      ⚡ BOOSTED
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Voting Column - Horizontal on mobile, vertical on desktop */}
        <div className="flex sm:flex-col items-center justify-center space-x-4 sm:space-x-0 sm:space-y-2 py-2 order-1 sm:order-2 border-b sm:border-b-0 border-border/30 pb-4 sm:pb-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleUpvote}
            disabled={isVoting}
            className="text-muted-foreground hover:text-emerald-400 p-2 h-auto rounded-full hover:bg-emerald-500/10 transition-all duration-200 touch-manipulation"
          >
            <i className="fas fa-chevron-up text-lg sm:text-xl"></i>
          </Button>
          <span className="text-lg sm:text-xl font-bold text-foreground bg-accent/30 px-3 py-1 rounded-full min-w-[3rem] text-center">
            {post.score}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDownvote}
            disabled={isVoting}
            className="text-muted-foreground hover:text-red-400 p-2 h-auto rounded-full hover:bg-red-500/10 transition-all duration-200 touch-manipulation"
          >
            <i className="fas fa-chevron-down text-lg sm:text-xl"></i>
          </Button>
        </div>
      </div>
    </Card>
  );
}