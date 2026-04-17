import { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Lock, LogIn, Eye, EyeOff } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useToast } from "@/hooks/use-toast";

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated } = useAuth();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [infoMessage, setInfoMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Redirect if already logged in - use useEffect to avoid render-time navigation
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // Pre-fill email and flash message from signup (success or "already exists")
  useEffect(() => {
    const locationState = location.state as {
      email?: string;
      message?: string;
      loginFlash?: { tone: "success" | "error"; text: string };
    } | null;
    if (locationState?.email) {
      setFormData((prev) => ({ ...prev, email: locationState.email! }));
    }
    const flash = locationState?.loginFlash;
    const legacyMessage = locationState?.message;
    if (flash) {
      if (flash.tone === "error") {
        setError(flash.text);
        setInfoMessage("");
        toast({
          title: "Account already exists",
          description: flash.text,
          variant: "destructive",
        });
      } else {
        setError("");
        setInfoMessage(flash.text);
        toast({
          title: "Account created",
          description: flash.text,
        });
      }
      navigate(location.pathname + location.search, {
        replace: true,
        state: { email: locationState?.email },
      });
    } else if (legacyMessage) {
      setError(legacyMessage);
      setInfoMessage("");
      toast({
        title: "Notice",
        description: legacyMessage,
        variant: "destructive",
      });
      navigate(location.pathname + location.search, {
        replace: true,
        state: { email: locationState?.email },
      });
    }
  }, [location, navigate, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setInfoMessage("");

    if (!formData.email || !formData.password) {
      setError("Please fill in all fields");
      return;
    }

    setIsSubmitting(true);

    try {
      // Add timeout wrapper with longer timeout to account for session setting
      const loginWithTimeout = Promise.race([
        login(formData.email.trim().toLowerCase(), formData.password),
        new Promise<boolean>((_, reject) => {
          setTimeout(() => {
            reject(new Error("Login request timed out. Please check your internet connection."));
          }, 30000); // 30 second timeout (increased to account for session setting)
        }),
      ]);

      const success = await loginWithTimeout;

      if (success) {
        toast({
          title: "Welcome Back!",
          description: "You've successfully logged in.",
        });
        
        // Redirect to previous page or home
        const returnTo = new URLSearchParams(window.location.search).get("returnTo") || "/";
        navigate(returnTo);
      } else {
        setError("Invalid email or password. Please try again or sign up if you don't have an account.");
        toast({
          title: "Login Failed",
          description: "Invalid email or password. Please check your credentials and try again.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Login error:", error);
      const errorMessage = error.message || "Something went wrong. Please try again.";
      const errorLower = errorMessage.toLowerCase();
      
      // Handle "Email logins disabled" error
      if (errorLower.includes("email logins are disabled") || 
          errorLower.includes("logins are disabled") ||
          errorLower.includes("email provider disabled")) {
        setError("Email logins are currently disabled. Please contact support or check your Supabase settings.");
        toast({
          title: "Login Disabled",
          description: "Email logins are disabled in your Supabase project. Please enable email authentication in Supabase Dashboard → Authentication → Providers → Email",
          variant: "destructive",
        });
      } else {
        setError(errorMessage);
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8 md:py-16">
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader className="text-center space-y-2">
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                <LogIn className="text-primary" size={32} />
              </div>
              <CardTitle className="text-2xl">Log In</CardTitle>
              <CardDescription>
                Sign in to your account to continue
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {infoMessage && (
                  <div className="bg-primary/10 text-foreground text-sm p-3 rounded-md border border-primary/20">
                    {infoMessage}
                  </div>
                )}
                {error && (
                  <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md border border-destructive/20">
                    {error}
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
                    <Input
                      id="email"
                      type="email"
                      placeholder="john.doe@example.com"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password *</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                      }
                      className="pl-10 pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Logging in..." : "Log In"}
                </Button>

                <div className="text-center">
                  <Link
                    to="/forgot-password"
                    className="text-sm text-primary hover:underline font-medium"
                  >
                    Forgot password?
                  </Link>
                </div>

                <div className="text-center text-sm text-muted-foreground">
                  Don't have an account?{" "}
                  <Link
                    to="/signup"
                    className="text-primary hover:underline font-medium"
                  >
                    Sign up
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default LoginPage;

