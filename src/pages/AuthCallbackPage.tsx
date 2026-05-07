import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";

const REDIRECT_MS = 3000;

const AuthCallbackPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = window.setTimeout(() => {
      navigate("/login", { replace: true });
    }, REDIRECT_MS);

    return () => {
      window.clearTimeout(timer);
    };
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <Card className="w-full max-w-md border-border shadow-sm">
          <CardHeader className="text-center space-y-4 pb-2">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-500/15">
              <CheckCircle className="h-12 w-12 text-green-600" aria-hidden />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Email Confirmed!
            </h1>
            <CardDescription className="text-base">
              Your account is ready. Redirecting you to login...
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-2 pb-6">
            <p className="text-center text-sm text-muted-foreground">
              If you are not redirected,{" "}
              <button
                type="button"
                className="font-medium text-primary underline-offset-4 hover:underline"
                onClick={() => navigate("/login", { replace: true })}
              >
                go to login
              </button>
              .
            </p>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default AuthCallbackPage;
