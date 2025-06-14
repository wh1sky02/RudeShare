import { useState } from "react";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import DailyChallenge from "@/components/DailyChallenge";
import HallOfShame from "@/components/HallOfShame";
import NewPostModal from "@/components/NewPostModal";
import GuidelinesModal from "@/components/GuidelinesModal";

export default function Features() {
  const [searchQuery, setSearchQuery] = useState("");
  const [postModalOpen, setPostModalOpen] = useState(false);
  const [guidelinesModalOpen, setGuidelinesModalOpen] = useState(false);

  const handleRespondToChallenge = (prompt: string) => {
    setPostModalOpen(true);
    // You could pre-fill the post content with the challenge prompt if needed
  };

  return (
    <div className="min-h-screen bg-background">
      <Header
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onNewPost={() => setPostModalOpen(true)}
        onShowGuidelines={() => setGuidelinesModalOpen(true)}
      />

      <main className="max-w-4xl mx-auto px-4 py-4 sm:py-6">
        {/* Page Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold gradient-text mb-2">
            <i className="fas fa-fire mr-3"></i>
            Brutal Features
          </h1>
          <p className="text-muted-foreground text-base sm:text-lg">
            Daily challenges and the hall of shame for polite violations
          </p>
        </div>

        {/* Daily Challenge Section */}
        <div className="mb-8 sm:mb-12">
          <DailyChallenge onRespondToChallenge={handleRespondToChallenge} />
        </div>

        {/* Hall of Shame Section */}
        <div className="mb-8 sm:mb-12">
          <HallOfShame />
        </div>

        {/* Back to Home Button */}
        <div className="text-center">
          <Button 
            variant="outline" 
            className="px-6 py-2 border-border/50 hover:border-primary/50 hover:bg-accent/30 transition-all duration-200 touch-manipulation"
            onClick={() => window.history.back()}
          >
            <i className="fas fa-arrow-left mr-2"></i>
            Back to Feed
          </Button>
        </div>
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