import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Home from "@/pages/home";
import Features from "@/pages/features";
import NotFound from "@/pages/not-found";
import { useEffect } from "react";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/features" component={Features} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  useEffect(() => {
    // Remove any loading states immediately
    document.body.classList.remove('loading');
    
    // Prevent any flash of unstyled content
    const style = document.createElement('style');
    style.textContent = `
      * { 
        transition: none !important; 
        animation: none !important; 
      }
    `;
    document.head.appendChild(style);
    
    // Remove the style after a brief moment to allow normal transitions
    setTimeout(() => {
      document.head.removeChild(style);
    }, 100);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;