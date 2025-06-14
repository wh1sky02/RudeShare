import { Button } from "@/components/ui/button";

interface FooterProps {
  onShowGuidelines: () => void;
}

export default function Footer({ onShowGuidelines }: FooterProps) {
  return (
    <footer className="glass border-t border-border/50 mt-16">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-6 md:space-y-0">
          <div className="flex items-center space-x-8 text-sm text-muted-foreground">
            <a
              href="https://github.com"
              className="hover:text-primary transition-colors duration-200 flex items-center space-x-2 font-medium"
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
              className="hover:text-primary transition-colors duration-200 p-0 h-auto text-sm text-muted-foreground font-medium"
            >
              <i className="fas fa-skull mr-2 text-lg"></i>
              Guidelines
            </Button>
            <a
              href="#"
              className="hover:text-primary transition-colors duration-200 flex items-center space-x-2 font-medium"
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
