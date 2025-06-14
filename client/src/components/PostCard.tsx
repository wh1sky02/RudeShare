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
    <Card className="glass p-6 hover:shadow-xl transition-all duration-300 border-border/50 float-animation">
      <div className="flex space-x-4">
        {/* Voting Column */}
        <div className="flex flex-col items-center space-y-2 py-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleUpvote}
            disabled={isVoting}
            className="text-muted-foreground hover:text-emerald-400 p-2 h-auto rounded-full hover:bg-emerald-500/10 transition-all duration-200"
          >
            <i className="fas fa-chevron-up text-lg"></i>
          </Button>
          <span className="text-lg font-bold text-foreground bg-accent/30 px-3 py-1 rounded-full">
            {post.score}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDownvote}
            disabled={isVoting}
            className="text-muted-foreground hover:text-red-400 p-2 h-auto rounded-full hover:bg-red-500/10 transition-all duration-200"
          >
            <i className="fas fa-chevron-down text-lg"></i>
          </Button>
        </div>

        {/* Content Column */}
        <div className="flex-1 min-w-0">
          <div className="prose prose-slate max-w-none">
            {post.content && (
              <p className="text-foreground leading-relaxed whitespace-pre-wrap text-lg font-medium">
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
                    className="max-w-full h-auto rounded-xl border border-border/30 shadow-lg"
                    style={{ maxHeight: '500px' }}
                  />
                ) : post.mediaType === 'video' ? (
                  <video
                    src={post.mediaUrl}
                    controls
                    className="max-w-full h-auto rounded-xl border border-border/30 shadow-lg"
                    style={{ maxHeight: '500px' }}
                  >
                    Your browser does not support the video tag.
                  </video>
                ) : null}
              </div>
            )}
          </div>

          {/* Post Meta */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/30">
            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <span className="font-medium">{timeAgo}</span>
              <span className="font-mono text-xs bg-accent/50 px-2 py-1 rounded-full">{post.postId}</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
