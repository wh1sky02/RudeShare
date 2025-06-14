import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { Post } from "@shared/schema";

interface PostCardProps {
  post: Post;
  onVote: (postId: number, voteType: 'up' | 'down') => void;
  onReaction: (postId: number, reactionType: string) => void;
  isVoting: boolean;
}

const REACTION_TYPES = [
  { type: 'savage', emoji: '🔥', label: 'Savage' },
  { type: 'brutal', emoji: '💀', label: 'Brutal' },
  { type: 'middle_finger', emoji: '🖕', label: 'F*ck Off' },
  { type: 'trash', emoji: '🗑️', label: 'Trash' },
  { type: 'boring', emoji: '😴', label: 'Boring' },
  { type: 'legendary', emoji: '👑', label: 'Legendary' },
];

export default function PostCard({ post, onVote, onReaction, isVoting }: PostCardProps) {
  const handleUpvote = () => onVote(post.id, 'up');
  const handleDownvote = () => onVote(post.id, 'down');
  const handleReaction = (reactionType: string) => onReaction(post.id, reactionType);

  const timeAgo = formatDistanceToNow(new Date(post.createdAt), { addSuffix: true });

  // Calculate brutality percentage
  const brutalityPercentage = post.brutalityPercentage || post.rudenessScore || 0;
  const getBrutalityColor = (percentage: number) => {
    if (percentage >= 80) return 'text-red-400 bg-red-500/20';
    if (percentage >= 60) return 'text-orange-400 bg-orange-500/20';
    if (percentage >= 40) return 'text-yellow-400 bg-yellow-500/20';
    return 'text-green-400 bg-green-500/20';
  };

  return (
    <Card className="glass p-3 sm:p-4 hover:shadow-lg transition-all duration-300 border-border/50">
      <div className="flex space-x-3">
        {/* Left Voting Column */}
        <div className="flex flex-col items-center space-y-1 pt-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleUpvote}
            disabled={isVoting}
            className="text-muted-foreground hover:text-emerald-400 p-1 h-6 w-6 rounded hover:bg-emerald-500/10 transition-all duration-200"
          >
            <i className="fas fa-chevron-up text-sm"></i>
          </Button>
          <span className="text-sm font-bold text-foreground bg-accent/30 px-2 py-0.5 rounded text-center min-w-[2rem]">
            {post.score}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDownvote}
            disabled={isVoting}
            className="text-muted-foreground hover:text-red-400 p-1 h-6 w-6 rounded hover:bg-red-500/10 transition-all duration-200"
          >
            <i className="fas fa-chevron-down text-sm"></i>
          </Button>
        </div>

        {/* Main Content */}
        <div className="flex-1 min-w-0 space-y-2">
          {/* Post Header */}
          <div className="flex items-center space-x-2 text-xs text-muted-foreground">
            <span className="font-mono bg-accent/50 px-1.5 py-0.5 rounded">{post.postId}</span>
            <span>•</span>
            <span>{timeAgo}</span>
            {brutalityPercentage > 0 && (
              <>
                <span>•</span>
                <span className={`font-bold px-1.5 py-0.5 rounded ${getBrutalityColor(brutalityPercentage)}`}>
                  {brutalityPercentage}% BRUTAL
                </span>
              </>
            )}
            {post.isBoosted && (
              <>
                <span>•</span>
                <span className="bg-red-500/30 px-1.5 py-0.5 rounded text-red-300 font-bold">
                  ⚡ BOOSTED
                </span>
              </>
            )}
          </div>

          {/* Post Content */}
          <div className="prose prose-slate max-w-none">
            {post.content && (
              <p className="text-foreground leading-relaxed whitespace-pre-wrap text-sm sm:text-base">
                {post.content}
              </p>
            )}
            
            {/* Media Content */}
            {post.mediaUrl && (
              <div className="mt-2">
                {post.mediaType === 'image' ? (
                  <img
                    src={post.mediaUrl}
                    alt="User uploaded content"
                    className="max-w-full h-auto rounded-lg border border-border/30 shadow-md cursor-pointer"
                    style={{ maxHeight: '300px' }}
                    onClick={() => window.open(post.mediaUrl!, '_blank')}
                  />
                ) : post.mediaType === 'video' ? (
                  <video
                    src={post.mediaUrl}
                    controls
                    className="max-w-full h-auto rounded-lg border border-border/30 shadow-md"
                    style={{ maxHeight: '300px' }}
                    playsInline
                  >
                    Your browser does not support the video tag.
                  </video>
                ) : null}
              </div>
            )}
          </div>

          {/* Reactions Bar */}
          <div className="flex flex-wrap gap-1">
            {REACTION_TYPES.map(({ type, emoji, label }) => {
              const count = post.reactions?.[type] || 0;
              return (
                <Button
                  key={type}
                  variant="ghost"
                  size="sm"
                  onClick={() => handleReaction(type)}
                  disabled={isVoting}
                  className={`text-xs px-2 py-1 h-6 rounded transition-all duration-200 ${
                    count > 0 
                      ? 'bg-accent/50 text-foreground border border-border/50' 
                      : 'hover:bg-accent/30 text-muted-foreground'
                  }`}
                >
                  <span className="mr-1">{emoji}</span>
                  <span className="hidden sm:inline text-xs">{label}</span>
                  {count > 0 && <span className="ml-1 font-bold">{count}</span>}
                </Button>
              );
            })}
          </div>
        </div>
      </div>
    </Card>
  );
}