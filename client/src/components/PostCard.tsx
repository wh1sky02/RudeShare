import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { Post } from "@shared/schema";

interface PostCardProps {
  post: Post;
  onVote: (postId: number, voteType: 'up' | 'down') => void;
  onReport: (postId: number, reason?: string) => void;
  isVoting: boolean;
  isReporting: boolean;
}

export default function PostCard({ post, onVote, onReport, isVoting, isReporting }: PostCardProps) {
  const handleUpvote = () => onVote(post.id, 'up');
  const handleDownvote = () => onVote(post.id, 'down');
  const handleReport = () => onReport(post.id);

  const timeAgo = formatDistanceToNow(new Date(post.createdAt), { addSuffix: true });

  return (
    <Card className="p-4 hover:shadow-sm transition-shadow">
      <div className="flex space-x-3">
        {/* Voting Column */}
        <div className="flex flex-col items-center space-y-1 py-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleUpvote}
            disabled={isVoting}
            className="text-slate-400 hover:text-emerald-600 p-1 h-auto"
          >
            <i className="fas fa-chevron-up text-sm"></i>
          </Button>
          <span className="text-sm font-medium text-slate-600">
            {post.score}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDownvote}
            disabled={isVoting}
            className="text-slate-400 hover:text-red-600 p-1 h-auto"
          >
            <i className="fas fa-chevron-down text-sm"></i>
          </Button>
        </div>

        {/* Content Column */}
        <div className="flex-1 min-w-0">
          <div className="prose prose-slate max-w-none">
            {post.content && (
              <p className="text-slate-800 leading-relaxed whitespace-pre-wrap">
                {post.content}
              </p>
            )}
            
            {/* Media Content */}
            {post.mediaUrl && (
              <div className="mt-3">
                {post.mediaType === 'image' ? (
                  <img
                    src={post.mediaUrl}
                    alt="User uploaded content"
                    className="max-w-full h-auto rounded-lg border border-slate-200"
                    style={{ maxHeight: '400px' }}
                  />
                ) : post.mediaType === 'video' ? (
                  <video
                    src={post.mediaUrl}
                    controls
                    className="max-w-full h-auto rounded-lg border border-slate-200"
                    style={{ maxHeight: '400px' }}
                  >
                    Your browser does not support the video tag.
                  </video>
                ) : null}
              </div>
            )}
          </div>

          {/* Post Meta */}
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
            <div className="flex items-center space-x-4 text-sm text-slate-500">
              <span>{timeAgo}</span>
              <span>{post.postId}</span>
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleReport}
                disabled={isReporting}
                className="text-slate-400 hover:text-red-600 px-2 py-1 h-auto text-sm"
              >
                <i className="fas fa-flag mr-1"></i>
                Report
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
