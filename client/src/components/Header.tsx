import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLocation } from "wouter";

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onNewPost: () => void;
  onShowGuidelines: () => void;
}

export default function Header({ searchQuery, onSearchChange, onNewPost, onShowGuidelines }: HeaderProps) {
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [location, navigate] = useLocation();

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border/50">
      <div className="max-w-6xl mx-auto px-3 sm:px-4 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 sm:space-x-4">
            <button 
              onClick={() => navigate("/")}
              className="text-lg sm:text-xl font-bold gradient-text hover:opacity-80 transition-opacity"
            >
              <i className="fas fa-fire mr-2 text-red-500"></i>
              <span className="hidden xs:inline">RudeShare</span>
              <span className="xs:hidden">RS</span>
            </button>
            <span className="text-xs text-muted-foreground hidden sm:inline font-medium">
              Brutal. Honest. No BS.
            </span>
          </div>

          <div className="flex items-center space-x-2">
            {/* Desktop Search Bar - only show on home page */}
            {location === "/" && (
              <div className="relative hidden md:block">
                <Input
                  type="text"
                  placeholder="Search brutal posts..."
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="w-48 lg:w-56 pl-8 pr-3 h-8 bg-card border-border/50 focus:border-primary/50 transition-all duration-200 text-sm"
                />
                <i className="fas fa-search absolute left-2.5 top-1/2 transform -translate-y-1/2 text-muted-foreground text-xs"></i>
              </div>
            )}

            {/* Mobile Search Button - only show on home page */}
            {location === "/" && (
              <Button
                variant="ghost"
                size="sm"
                className="md:hidden hover:bg-accent/50 transition-colors p-1.5 h-8 w-8"
                onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
              >
                <i className="fas fa-search text-xs"></i>
              </Button>
            )}

            {/* Features Button */}
            <Button 
              variant={location === "/features" ? "default" : "ghost"}
              size="sm"
              onClick={() => navigate("/features")}
              className="hover:bg-accent/50 transition-colors p-1.5 h-8 w-8 sm:w-auto sm:px-3"
            >
              <i className="fas fa-fire text-xs"></i>
              <span className="hidden sm:inline ml-1.5 text-sm">Features</span>
            </Button>

            {/* New Post Button */}
            <Button 
              onClick={onNewPost} 
              className="bg-primary hover:bg-primary/90 glow-red-hover transition-all duration-200 font-medium text-xs sm:text-sm px-2.5 sm:px-3 py-1.5 h-8 sm:h-9"
            >
              <i className="fas fa-plus mr-1 sm:mr-1.5 text-xs"></i>
              <span className="hidden sm:inline">Drop Your Rant</span>
              <span className="sm:hidden">Rant</span>
            </Button>

            {/* Guidelines Button */}
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onShowGuidelines}
              className="hover:bg-accent/50 transition-colors p-1.5 h-8 w-8"
            >
              <i className="fas fa-skull text-xs"></i>
            </Button>
          </div>
        </div>

        {/* Mobile Search Bar - only show on home page */}
        {location === "/" && mobileSearchOpen && (
          <div className="mt-2 md:hidden animate-in slide-in-from-top-2 duration-200">
            <div className="relative">
              <Input
                type="text"
                placeholder="Search brutal posts..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full pl-8 pr-10 h-8 bg-card border-border/50 focus:border-primary/50 transition-all duration-200 text-sm"
                autoFocus
              />
              <i className="fas fa-search absolute left-2.5 top-1/2 transform -translate-y-1/2 text-muted-foreground text-xs"></i>
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
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