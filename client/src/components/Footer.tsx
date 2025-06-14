import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

interface FooterProps {
  onShowGuidelines: () => void;
}

export default function Footer({ onShowGuidelines }: FooterProps) {
  const [location, navigate] = useLocation();

  return (
    <footer className="glass border-t border-border/50 mt-12 sm:mt-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-6 md:space-y-0">
          <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6 lg:space-x-8 text-sm text-muted-foreground">
            <button
              onClick={() => navigate("/")}
              className="hover:text-primary transition-colors duration-200 flex items-center space-x-2 font-medium touch-manipulation"
            >
              <i className="fas fa-home text-lg"></i>
              <span>Home</span>
            </button>
            <button
              onClick={() => navigate("/features")}
              className="hover:text-primary transition-colors duration-200 flex items-center space-x-2 font-medium touch-manipulation"
            >
              <i className="fas fa-fire text-lg"></i>
              <span>Features</span>
            </button>
            <a
              href="https://github.com"
              className="hover:text-primary transition-colors duration-200 flex items-center space-x-2 font-medium touch-manipulation"
              target="_blank"
              rel="noopener noreferrer"
            >
              <i className="fab fa-github text-lg"></i>
              <span>Open Source</span>
            </a>
            <Button
              variant="ghost"
              size="sm"
              onClick={onShowGuidelines}
              className="hover:text-primary transition-colors duration-200 p-0 h-auto text-sm text-muted-foreground font-medium touch-manipulation"
            >
              <i className="fas fa-skull mr-2 text-lg"></i>
              Guidelines
            </Button>
            <a
              href="#"
              className="hover:text-primary transition-colors duration-200 flex items-center space-x-2 font-medium touch-manipulation"
            >
              <i className="fas fa-user-secret text-lg"></i>
              <span>Privacy</span>
            </a>
          </div>

          <div className="text-sm text-muted-foreground flex items-center space-x-2">
            <span className="font-medium">Built for</span>
            <i className="fas fa-fire text-primary text-lg glow-red"></i>
            <span className="font-bold gradient-text">brutal honesty</span>
          </div>
        </div>
      </div>
    </footer>
  );
}