import Navigation from "@/components/Navigation";
import HeroSection from "@/components/HeroSection";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Code, Brain, Target, Zap } from "lucide-react";

const LandingPage = () => {
  const features = [
    {
      icon: Code,
      title: "Live Code Analysis",
      description: "Track every keystroke and decision in real-time as candidates solve problems."
    },
    {
      icon: Brain,
      title: "Thought Process Evaluation",
      description: "AI-powered insights into problem-solving approaches and logical thinking patterns."
    },
    {
      icon: Target,
      title: "Comprehensive Scoring",
      description: "Multi-dimensional assessment covering logic, debugging, efficiency, and creativity."
    },
    {
      icon: Zap,
      title: "Instant Feedback",
      description: "Get immediate AI-generated feedback and actionable insights for each candidate."
    }
  ];

  return (
    <div className="min-h-screen">
      <Navigation />
      <HeroSection />
      
      {/* Features Section */}
      <section className="py-20 bg-background-secondary">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Why Choose LTPE?
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Go beyond traditional coding tests with our innovative approach to technical evaluation.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card 
                key={feature.title} 
                className="card-modern group cursor-pointer animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardHeader className="text-center pb-4">
                  <div className="w-12 h-12 mx-auto mb-4 rounded-lg bg-gradient-primary p-3 group-hover:scale-110 transition-transform">
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-center">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;