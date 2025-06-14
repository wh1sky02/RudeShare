import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useState } from "react";
import type { Post } from "@shared/schema";

interface PostCardProps {
  post: Post;
  onVote: (postId: number, voteType: 'up' | 'down') => void;
  onReaction: (postId: number, reactionType: string) => void;
  onDiscussion: (postId: number) => void;
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

export default function PostCard({ post, onVote, onReaction, onDiscussion, isVoting }: PostCardProps) {
  const [showReactions, setShowReactions] = useState(false);
  const [reactionTimeout, setReactionTimeout] = useState<NodeJS.Timeout | null>(null);

  const handleUpvote = () => onVote(post.id, 'up');
  const handleDownvote = () => onVote(post.id, 'down');
  const handleReaction = (reactionType: string) => {
    onReaction(post.id, reactionType);
    setShowReactions(false);
  };
  const handleDiscussion = () => onDiscussion(post.id);

  const timeAgo = formatDistanceToNow(new Date(post.createdAt), { addSuffix: true });

  // Calculate brutality percentage
  const brutalityPercentage = post.brutalityPercentage || post.rudenessScore || 0;
  const getBrutalityColor = (percentage: number) => {
    if (percentage >= 80) return 'text-red-400 bg-red-500/20';
    if (percentage >= 60) return 'text-orange-400 bg-orange-500/20';
    if (percentage >= 40) return 'text-yellow-400 bg-yellow-500/20';
    return 'text-green-400 bg-green-500/20';
  };

  // Get most popular reaction
  const reactions = post.reactions || {};
  const totalReactions = Object.values(reactions).reduce((sum, count) => sum + count, 0);
  const topReaction = Object.entries(reactions).reduce((top, [type, count]) => 
    count > (top.count || 0) ? { type, count } : top, { type: '', count: 0 }
  );
  const topReactionEmoji = REACTION_TYPES.find(r => r.type === topReaction.type)?.emoji || '🔥';

  const handleReactionHover = (show: boolean) => {
    if (reactionTimeout) {
      clearTimeout(reactionTimeout);
      setReactionTimeout(null);
    }

    if (show) {
      setShowReactions(true);
    } else {
      const timeout = setTimeout(() => setShowReactions(false), 300);
      setReactionTimeout(timeout);
    }
  };

  return (
    <Card className="glass p-3 hover:shadow-lg transition-all duration-200 border-border/50">
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
              <p className="text-foreground leading-relaxed whitespace-pre-wrap text-sm">
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
                    style={{ maxHeight: '200px' }}
                    onClick={() => window.open(post.mediaUrl!, '_blank')}
                  />
                ) : post.mediaType === 'video' ? (
                  <video
                    src={post.mediaUrl}
                    controls
                    className="max-w-full h-auto rounded-lg border border-border/30 shadow-md"
                    style={{ maxHeight: '200px' }}
                    playsInline
                  >
                    Your browser does not support the video tag.
                  </video>
                ) : null}
              </div>
            )}
          </div>

          {/* Action Bar */}
          <div className="flex items-center space-x-4 pt-1">
            {/* Reaction Button with Hover */}
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                onMouseEnter={() => handleReactionHover(true)}
                onMouseLeave={() => handleReactionHover(false)}
                onClick={() => setShowReactions(!showReactions)}
                className="text-muted-foreground hover:text-orange-400 px-2 py-1 h-7 rounded transition-all duration-200 hover:bg-orange-500/10"
              >
                <span className="mr-1.5">{totalReactions > 0 ? topReactionEmoji : '🔥'}</span>
                <span className="text-xs">
                  {totalReactions > 0 ? totalReactions : 'React'}
                </span>
              </Button>

              {/* Reaction Popup */}
              {showReactions && (
                <div 
                  className="absolute bottom-full left-0 mb-2 bg-card border border-border/50 rounded-lg shadow-xl p-2 flex space-x-1 z-50 animate-in fade-in-0 zoom-in-95 duration-200"
                  onMouseEnter={() => handleReactionHover(true)}
                  onMouseLeave={() => handleReactionHover(false)}
                >
                  {REACTION_TYPES.map(({ type, emoji, label }) => (
                    <Button
                      key={type}
                      variant="ghost"
                      size="sm"
                      onClick={() => handleReaction(type)}
                      disabled={isVoting}
                      className="text-lg hover:scale-125 transition-transform duration-200 p-1 h-8 w-8"
                      title={label}
                    >
                      {emoji}
                    </Button>
                  ))}
                </div>
              )}
            </div>

            {/* Discussion Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDiscussion}
              className="text-muted-foreground hover:text-blue-400 px-2 py-1 h-7 rounded transition-all duration-200 hover:bg-blue-500/10"
            >
              <i className="fas fa-comment mr-1.5 text-xs"></i>
              <span className="text-xs">Discuss</span>
            </Button>

            {/* Share Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                navigator.clipboard.writeText(`${window.location.origin}#${post.postId}`);
              }}
              className="text-muted-foreground hover:text-green-400 px-2 py-1 h-7 rounded transition-all duration-200 hover:bg-green-500/10"
            >
              <i className="fas fa-share mr-1.5 text-xs"></i>
              <span className="text-xs">Share</span>
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}