import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lock } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-16">
          <div className="max-w-md mx-auto">
            <Card>
              <CardContent className="pt-6 text-center space-y-4">
                <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                  <Lock className="text-primary" size={32} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold mb-2">Authentication Required</h2>
                  <p className="text-muted-foreground mb-6">
                    You need to be logged in to access this page. Please sign in or create an account to continue.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button
                    onClick={() => {
                      const returnTo = location.pathname + location.search;
                      window.location.href = `/login?returnTo=${encodeURIComponent(returnTo)}`;
                    }}
                    size="lg"
                  >
                    Log In
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      const returnTo = location.pathname + location.search;
                      window.location.href = `/signup?returnTo=${encodeURIComponent(returnTo)}`;
                    }}
                    size="lg"
                  >
                    Sign Up
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;

