import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

interface FooterProps {
  onShowGuidelines: () => void;
}

export default function Footer({ onShowGuidelines }: FooterProps) {
  const [location, navigate] = useLocation();

  return (
    <footer className="glass border-t border-border/50 mt-8">
      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="flex flex-col sm:flex-row justify-between items-center space-y-3 sm:space-y-0">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 sm:gap-4 text-xs text-muted-foreground">
            <button
              onClick={() => navigate("/")}
              className="hover:text-primary transition-colors duration-200 flex items-center space-x-1 font-medium"
            >
              <i className="fas fa-home"></i>
              <span>Home</span>
            </button>
            <button
              onClick={() => navigate("/features")}
              className="hover:text-primary transition-colors duration-200 flex items-center space-x-1 font-medium"
            >
              <i className="fas fa-fire"></i>
              <span>Features</span>
            </button>
            <a
              href="https://github.com"
              className="hover:text-primary transition-colors duration-200 flex items-center space-x-1 font-medium"
              target="_blank"
              rel="noopener noreferrer"
            >
              <i className="fab fa-github"></i>
              <span>Source</span>
            </a>
            <Button
              variant="ghost"
              size="sm"
              onClick={onShowGuidelines}
              className="hover:text-primary transition-colors duration-200 p-0 h-auto text-xs text-muted-foreground font-medium"
            >
              <i className="fas fa-skull mr-1"></i>
              Guidelines
            </Button>
            <a
              href="#"
              className="hover:text-primary transition-colors duration-200 flex items-center space-x-1 font-medium"
            >
              <i className="fas fa-user-secret"></i>
              <span>Privacy</span>
            </a>
          </div>

          <div className="text-xs text-muted-foreground flex items-center space-x-1">
            <span>Built for</span>
            <i className="fas fa-fire text-primary glow-red"></i>
            <span className="font-bold gradient-text">brutal honesty</span>
          </div>
        </div>
      </div>
    </footer>
  );
}