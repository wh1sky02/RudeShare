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
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-4xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-semibold text-slate-800">
              <i className="fas fa-dove text-blue-600 mr-2"></i>
              FreedomShare
            </h1>
            <span className="text-sm text-slate-500 hidden sm:inline">
              Anonymous. Open. Free.
            </span>
          </div>

          <div className="flex items-center space-x-3">
            {/* Desktop Search Bar */}
            <div className="relative hidden sm:block">
              <Input
                type="text"
                placeholder="Search posts..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-64 pl-9 pr-4"
              />
              <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 text-sm"></i>
            </div>

            {/* Mobile Search Button */}
            <Button
              variant="ghost"
              size="sm"
              className="sm:hidden"
              onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
            >
              <i className="fas fa-search"></i>
            </Button>

            {/* New Post Button */}
            <Button onClick={onNewPost} className="bg-blue-600 hover:bg-blue-700">
              <i className="fas fa-plus mr-1"></i>
              <span className="hidden sm:inline">New Post</span>
            </Button>

            {/* Guidelines Button */}
            <Button variant="ghost" size="sm" onClick={onShowGuidelines}>
              <i className="fas fa-info-circle"></i>
            </Button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        {mobileSearchOpen && (
          <div className="mt-3 sm:hidden">
            <div className="relative">
              <Input
                type="text"
                placeholder="Search posts..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full pl-9 pr-4"
              />
              <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 text-sm"></i>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
