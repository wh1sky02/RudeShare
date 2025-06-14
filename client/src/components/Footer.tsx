import { Button } from "@/components/ui/button";

interface FooterProps {
  onShowGuidelines: () => void;
}

export default function Footer({ onShowGuidelines }: FooterProps) {
  return (
    <footer className="bg-white border-t border-slate-200 mt-12">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="flex items-center space-x-6 text-sm text-slate-600">
            <a
              href="https://github.com"
              className="hover:text-slate-800 transition-colors"
              target="_blank"
              rel="noopener noreferrer"
            >
              <i className="fab fa-github mr-1"></i>
              Open Source
            </a>
            <Button
              variant="ghost"
              size="sm"
              onClick={onShowGuidelines}
              className="hover:text-slate-800 transition-colors p-0 h-auto text-sm text-slate-600"
            >
              <i className="fas fa-book mr-1"></i>
              Guidelines
            </Button>
            <a
              href="#"
              className="hover:text-slate-800 transition-colors"
            >
              <i className="fas fa-shield-alt mr-1"></i>
              Privacy
            </a>
          </div>

          <div className="text-sm text-slate-500">
            <span>Made with</span>
            <i className="fas fa-fire text-red-500 mx-1"></i>
            <span>for brutal honesty</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
