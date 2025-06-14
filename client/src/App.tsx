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
    // Immediately disable all transitions and animations
    const disableAnimationsStyle = document.createElement('style');
    disableAnimationsStyle.id = 'disable-animations';
    disableAnimationsStyle.innerHTML = `
      *, *::before, *::after {
        transition: none !important;
        animation: none !important;
        -webkit-transition: none !important;
        -moz-transition: none !important;
        -o-transition: none !important;
        -webkit-animation: none !important;
        -moz-animation: none !important;
        -o-animation: none !important;
      }
      
      /* Override any library animations */
      .animate-in,
      .animate-out,
      [data-state="open"],
      [data-state="closed"],
      [data-radix-dialog-overlay],
      [data-radix-dialog-content] {
        animation: none !important;
        transition: none !important;
      }
    `;
    document.head.appendChild(disableAnimationsStyle);
    
    // Remove loading classes
    document.body.classList.remove('loading');
    document.body.classList.add('loaded');
    
    // Keep animations disabled for a longer period
    setTimeout(() => {
      const enableTransitionsStyle = document.createElement('style');
      enableTransitionsStyle.innerHTML = `
        * {
          transition: all 0.1s ease;
        }
        
        button:hover {
          transition: all 0.1s ease;
        }
      `;
      document.head.appendChild(enableTransitionsStyle);
      
      // Remove the disable animations style
      const disableStyle = document.getElementById('disable-animations');
      if (disableStyle) {
        disableStyle.remove();
      }
    }, 2000); // Keep disabled for 2 seconds
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