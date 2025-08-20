import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Code2, Home, BarChart3 } from "lucide-react";

const Navigation = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  const isActive = (path: string) => currentPath === path;

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-6">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2 group">
          <div className="relative">
            <Code2 className="h-8 w-8 text-primary transition-transform group-hover:scale-110" />
            <div className="absolute inset-0 h-8 w-8 rounded-full bg-primary/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <span className="hidden font-semibold text-xl text-foreground sm:block">
            LTPE
          </span>
        </Link>

        {/* Navigation Links */}
        <div className="flex items-center space-x-1">
          <Button
            asChild
            variant={isActive("/") ? "secondary" : "ghost"}
            size="sm"
            className="flex items-center space-x-2"
          >
            <Link to="/">
              <Home className="h-4 w-4" />
              <span className="hidden sm:inline">Home</span>
            </Link>
          </Button>
          
          <Button
            asChild
            variant={isActive("/coding") ? "secondary" : "ghost"}
            size="sm"
            className="flex items-center space-x-2"
          >
            <Link to="/coding">
              <Code2 className="h-4 w-4" />
              <span className="hidden sm:inline">Start</span>
            </Link>
          </Button>
          
          <Button
            asChild
            variant={isActive("/dashboard") ? "secondary" : "ghost"}
            size="sm"
            className="flex items-center space-x-2"
          >
            <Link to="/dashboard">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </Link>
          </Button>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;