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
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 sm:space-x-6">
            <h1 className="text-xl sm:text-2xl font-bold gradient-text">
              <i className="fas fa-fire mr-2 sm:mr-3 text-red-500"></i>
              <span className="hidden xs:inline">RudeShare</span>
              <span className="xs:hidden">RS</span>
            </h1>
            <span className="text-xs sm:text-sm text-muted-foreground hidden sm:inline font-medium tracking-wide">
              Brutal. Honest. No BS.
            </span>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Desktop Search Bar */}
            <div className="relative hidden md:block">
              <Input
                type="text"
                placeholder="Search brutal posts..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-64 lg:w-72 pl-10 pr-4 bg-card border-border/50 focus:border-primary/50 transition-all duration-200"
              />
              <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground text-sm"></i>
            </div>

            {/* Mobile Search Button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden hover:bg-accent/50 transition-colors p-2 h-9 w-9"
              onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
            >
              <i className="fas fa-search text-sm"></i>
            </Button>

            {/* New Post Button */}
            <Button 
              onClick={onNewPost} 
              className="bg-primary hover:bg-primary/90 glow-red-hover transition-all duration-200 font-medium text-sm sm:text-base px-3 sm:px-4 py-2 h-9 sm:h-10"
            >
              <i className="fas fa-plus mr-1 sm:mr-2 text-sm"></i>
              <span className="hidden sm:inline">Drop Your Rant</span>
              <span className="sm:hidden">Rant</span>
            </Button>

            {/* Guidelines Button */}
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onShowGuidelines}
              className="hover:bg-accent/50 transition-colors p-2 h-9 w-9"
            >
              <i className="fas fa-skull text-sm"></i>
            </Button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        {mobileSearchOpen && (
          <div className="mt-3 md:hidden animate-in slide-in-from-top-2 duration-200">
            <div className="relative">
              <Input
                type="text"
                placeholder="Search brutal posts..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full pl-10 pr-4 bg-card border-border/50 focus:border-primary/50 transition-all duration-200"
                autoFocus
              />
              <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground text-sm"></i>
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                onClick={() => setMobileSearchOpen(false)}
              >
                <i className="fas fa-times text-xs"></i>
              </Button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}