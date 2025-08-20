import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, Play } from "lucide-react";
import heroImage from "@/assets/hero-illustration.jpg";

const HeroSection = () => {
  return (
    <div className="relative overflow-hidden bg-gradient-subtle">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5" />
      
      <div className="container mx-auto px-6 py-20 lg:py-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="space-y-8 animate-fade-in">
            <div className="space-y-4">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                Live Technical{" "}
                <span className="bg-gradient-primary bg-clip-text text-transparent">
                  Thought Process
                </span>{" "}
                Evaluator
              </h1>
              
              <p className="text-xl text-muted-foreground max-w-lg">
                Evaluating how you solve problems, not just the final code.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild className="btn-hero group">
                <Link to="/coding">
                  <Play className="mr-2 h-5 w-5 transition-transform group-hover:scale-110" />
                  Start Coding Test
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              
            </div>

            {/* Feature Pills */}
            <div className="flex flex-wrap gap-3 pt-4">
              {["Real-time Analysis", "AI Feedback", "Thought Process Tracking"].map((feature, index) => (
                <div
                  key={feature}
                  className="inline-flex items-center rounded-full bg-secondary/50 px-4 py-2 text-sm font-medium text-secondary-foreground animate-slide-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {feature}
                </div>
              ))}
            </div>
          </div>

          {/* Hero Image */}
          <div className="relative animate-fade-in" style={{ animationDelay: "0.3s" }}>
            <div className="relative">
              <img
                src={heroImage}
                alt="Technical evaluation platform illustration"
                className="w-full h-auto rounded-2xl shadow-card animate-float"
              />
              
              {/* Glow effect */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-primary opacity-10 blur-3xl" />
            </div>
            
            {/* Floating elements */}
            <div className="absolute -top-4 -right-4 w-16 h-16 bg-accent/20 rounded-full blur-xl animate-glow" />
            <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-primary/20 rounded-full blur-2xl animate-glow" style={{ animationDelay: "1.5s" }} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;