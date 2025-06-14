import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onNewPost: () => void;
  onShowGuidelines: () => void;
}

export default function Header({ searchQuery, onSearchChange, onNewPost, onShowGuidelines }: HeaderProps) {
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  return (
    <header className="glass sticky top-0 z-50 border-b border-border/50">
      <div className="max-w-6xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <h1 className="text-2xl font-bold gradient-text">
              <i className="fas fa-fire mr-3 text-red-500"></i>
              RudeShare
            </h1>
            <span className="text-sm text-muted-foreground hidden sm:inline font-medium tracking-wide">
              Brutal. Honest. No BS.
            </span>
          </div>

          <div className="flex items-center space-x-3">
            {/* Desktop Search Bar */}
            <div className="relative hidden sm:block">
              <Input
                type="text"
                placeholder="Search brutal posts..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-72 pl-10 pr-4 bg-card border-border/50 focus:border-primary/50 transition-all duration-200"
              />
              <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground text-sm"></i>
            </div>

            {/* Mobile Search Button */}
            <Button
              variant="ghost"
              size="sm"
              className="sm:hidden hover:bg-accent/50 transition-colors"
              onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
            >
              <i className="fas fa-search"></i>
            </Button>

            {/* New Post Button */}
            <Button 
              onClick={onNewPost} 
              className="bg-primary hover:bg-primary/90 glow-red-hover transition-all duration-200 font-medium"
            >
              <i className="fas fa-plus mr-2"></i>
              <span className="hidden sm:inline">Drop Your Rant</span>
              <span className="sm:hidden">Rant</span>
            </Button>

            {/* Guidelines Button */}
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onShowGuidelines}
              className="hover:bg-accent/50 transition-colors"
            >
              <i className="fas fa-skull"></i>
            </Button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        {mobileSearchOpen && (
          <div className="mt-4 sm:hidden">
            <div className="relative">
              <Input
                type="text"
                placeholder="Search brutal posts..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full pl-10 pr-4 bg-card border-border/50 focus:border-primary/50 transition-all duration-200"
              />
              <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground text-sm"></i>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
