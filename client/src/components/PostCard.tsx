import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { Post } from "@shared/schema";

interface PostCardProps {
  post: Post;
  onVote: (postId: number, voteType: 'up' | 'down') => void;
  onReaction: (postId: number, reactionType: string) => void;
  onDiscuss: (postId: number) => void;
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

export default function PostCard({ post, onVote, onReaction, onDiscuss, isVoting }: PostCardProps) {
  const handleUpvote = () => onVote(post.id, 'up');
  const handleDownvote = () => onVote(post.id, 'down');
  const handleReaction = (reactionType: string) => onReaction(post.id, reactionType);
  const handleDiscuss = () => onDiscuss(post.id);

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
    <Card className="glass p-2 sm:p-3 hover:shadow-md transition-all duration-300 border-border/50">
      <div className="flex flex-col space-y-2">
        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="prose prose-slate max-w-none">
            {post.content && (
              <p className="text-foreground leading-relaxed whitespace-pre-wrap text-sm sm:text-base font-medium">
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
                    className="max-w-full h-auto rounded-xl border border-border/30 shadow-md cursor-pointer"
                    style={{ maxHeight: '300px' }}
                    onClick={() => window.open(post.mediaUrl!, '_blank')}
                  />
                ) : post.mediaType === 'video' ? (
                  <video
                    src={post.mediaUrl}
                    controls
                    className="max-w-full h-auto rounded-xl border border-border/30 shadow-md"
                    style={{ maxHeight: '300px' }}
                    playsInline
                  >
                    Your browser does not support the video tag.
                  </video>
                ) : null}
              </div>
            )}
          </div>
        </div>

        {/* Brutality Meter */}
        <div className="flex items-center space-x-3">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-medium text-muted-foreground">Brutality Level</span>
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${getBrutalityColor(brutalityPercentage)}`}>
                {brutalityPercentage}%
              </span>
            </div>
            <div className="w-full bg-accent/30 rounded-full h-1.5">
              <div 
                className={`h-1.5 rounded-full transition-all duration-500 ${
                  brutalityPercentage >= 80 ? 'bg-red-500' :
                  brutalityPercentage >= 60 ? 'bg-orange-500' :
                  brutalityPercentage >= 40 ? 'bg-yellow-500' :
                  'bg-green-500'
                }`}
                style={{ width: `${Math.min(brutalityPercentage, 100)}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Reactions */}
        <div className="flex flex-wrap gap-2">
          {REACTION_TYPES.map(({ type, emoji, label }) => {
            const count = post.reactions?.[type] || 0;
            return (
              <Button
                key={type}
                variant="ghost"
                size="sm"
                onClick={() => handleReaction(type)}
                disabled={isVoting}
                className={`text-[10px] px-1.5 py-0.5 h-auto rounded-full transition-all duration-200 touch-manipulation ${
                  count > 0 
                    ? 'bg-accent/50 text-foreground border border-border/50' 
                    : 'hover:bg-accent/30 text-muted-foreground'
                }`}
              >
                <span className="mr-1">{emoji}</span>
                <span className="hidden sm:inline mr-1">{label}</span>
                {count > 0 && <span className="font-bold">{count}</span>}
              </Button>
            );
          })}
        </div>

        {/* Voting and Meta */}
        <div className="flex items-center justify-between pt-2 border-t border-border/30">
          {/* Traditional Voting */}
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleUpvote}
              disabled={isVoting}
              className="text-muted-foreground hover:text-emerald-400 p-2 h-auto rounded-full hover:bg-emerald-500/10 transition-all duration-200 touch-manipulation"
            >
              <i className="fas fa-chevron-up text-lg"></i>
            </Button>
            <span className="text-base font-bold text-foreground bg-accent/30 px-2 py-0.5 rounded-full min-w-[2.5rem] text-center">
              {post.score}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDownvote}
              disabled={isVoting}
              className="text-muted-foreground hover:text-red-400 p-2 h-auto rounded-full hover:bg-red-500/10 transition-all duration-200 touch-manipulation"
            >
              <i className="fas fa-chevron-down text-lg"></i>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDiscuss}
              disabled={isVoting}
              className="text-muted-foreground hover:text-blue-400 p-2 h-auto rounded-full hover:bg-blue-500/10 transition-all duration-200 touch-manipulation"
            >
              <i className="fas fa-comment text-lg"></i>
              {post.commentCount && post.commentCount > 0 && <span className="ml-1 text-xs font-bold">{post.commentCount}</span>}
            </Button>
          </div>

          {/* Post Meta */}
          <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <span className="font-medium text-xs">{timeAgo}</span>
            <span className="font-mono text-[10px] bg-accent/50 px-1.5 py-0.5 rounded-full">{post.postId}</span>
            
            {/* Boosted Badge */}
            {post.isBoosted && (
              <div className="bg-red-500/30 px-1.5 py-0.5 rounded-full text-[10px] font-bold text-red-300 glow-red">
                ⚡ BOOSTED
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
