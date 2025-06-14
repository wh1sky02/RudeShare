import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { DailyChallenge } from "@shared/schema";

interface DailyChallengeProps {
  onRespondToChallenge: (prompt: string) => void;
}

export default function DailyChallenge({ onRespondToChallenge }: DailyChallengeProps) {
  const { data: challenge, isLoading } = useQuery<DailyChallenge>({
    queryKey: ["/api/daily-challenge"],
    queryFn: async () => {
      const response = await fetch("/api/daily-challenge");
      if (!response.ok) throw new Error('Failed to fetch daily challenge');
      return response.json();
    },
  });

  if (isLoading) {
    return (
      <Card className="glass border-border/50 glow-red-hover transition-all duration-300">
        <CardHeader>
          <CardTitle className="gradient-text text-lg sm:text-xl">
            <i className="fas fa-fire mr-2 sm:mr-3"></i>
            Today's Brutal Challenge
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse">
            <div className="h-6 bg-accent/30 rounded w-3/4 mb-4"></div>
            <div className="h-10 bg-accent/30 rounded w-full"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!challenge) {
    return (
      <Card className="glass border-border/50">
        <CardHeader>
          <CardTitle className="gradient-text text-lg sm:text-xl">
            <i className="fas fa-fire mr-2 sm:mr-3"></i>
            Today's Brutal Challenge
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-6 sm:py-8">
            <i className="fas fa-exclamation-triangle text-3xl sm:text-4xl mb-4 text-primary"></i>
            <p>No challenge available today.</p>
            <p className="text-sm">Check back later for brutal prompts!</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const handleRespond = () => {
    onRespondToChallenge(challenge.prompt);
  };

  return (
    <Card className="glass border-border/50 glow-red-hover transition-all duration-300 hover:shadow-xl">
      <CardHeader>
        <CardTitle className="gradient-text flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0 text-lg sm:text-xl">
          <span>
            <i className="fas fa-fire mr-2 sm:mr-3"></i>
            Today's Brutal Challenge
          </span>
          <div className="text-sm font-normal text-muted-foreground bg-accent/30 px-3 py-1 rounded-full self-start sm:self-auto">
            {challenge.responseCount} responses
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 sm:space-y-6">
        <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 sm:p-6">
          <div className="text-base sm:text-lg font-bold text-foreground mb-2">
            {challenge.prompt}
          </div>
          <div className="text-sm text-muted-foreground">
            Drop your most savage take on this prompt
          </div>
        </div>
        
        <Button 
          onClick={handleRespond}
          className="w-full bg-primary hover:bg-primary/90 glow-red-hover transition-all duration-200 font-bold text-base sm:text-lg py-4 sm:py-6 touch-manipulation"
        >
          <i className="fas fa-fist-raised mr-2 sm:mr-3"></i>
          Accept Challenge & Destroy It
        </Button>
        
        <div className="text-center text-xs text-muted-foreground">
          New challenge drops daily at midnight
        </div>
      </CardContent>
    </Card>
  );
}