import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { isStoreManagerRole } from "@/utils/managerAccess";

/**
 * Dedicated manager sign-in (not linked from public navigation).
 * Same Supabase-backed credentials as customers, but only owner/admin may proceed.
 */
const ManagerLoginPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login, isAuthenticated, user, isLoading } = useAuth();
  const { toast } = useToast();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isLoading) return;
    if (isAuthenticated && isStoreManagerRole(user?.role)) {
      const returnTo = searchParams.get("returnTo") || "/manager/dashboard";
      navigate(returnTo, { replace: true });
    }
  }, [isLoading, isAuthenticated, user?.role, navigate, searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email.trim() || !password) {
      setError("Enter email and password.");
      return;
    }
    setSubmitting(true);
    try {
      const signedIn = await login(email.trim().toLowerCase(), password);
      if (!signedIn) {
        setError("Invalid email or password.");
        toast({
          title: "Sign-in failed",
          description: "Check your credentials and try again.",
          variant: "destructive",
        });
        return;
      }
      if (!isStoreManagerRole(signedIn.role)) {
        toast({
          title: "Not a manager account",
          description: "This login is for store staff only. Use the main site login for shopping.",
          variant: "destructive",
        });
        setError("This account is not authorized for the manager dashboard.");
        return;
      }
      const returnTo = searchParams.get("returnTo") || "/manager/dashboard";
      navigate(returnTo, { replace: true });
      toast({ title: "Signed in", description: "Welcome to the manager dashboard." });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-muted/40 flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-border shadow-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl">Manager sign-in</CardTitle>
          <CardDescription>
            Store dashboard — staff only. Passwords are managed securely by Supabase Auth.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <p className="text-sm text-destructive" role="alert">
                {error}
              </p>
            )}
            <div className="space-y-2">
              <Label htmlFor="mgr-email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                <Input
                  id="mgr-email"
                  type="email"
                  autoComplete="username"
                  className="pl-10"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="owner@yourstore.com"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="mgr-password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                <Input
                  id="mgr-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  className="pl-10 pr-10"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? "Signing in…" : "Sign in to dashboard"}
            </Button>
          </form>
          <p className="text-xs text-muted-foreground mt-6 text-center">
            First-time setup?{" "}
            <Link to="/manager/setup" className="text-primary underline underline-offset-2">
              Create store owner account
            </Link>
            {" · "}
            <Link to="/" className="text-primary underline underline-offset-2">
              Back to store
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ManagerLoginPage;
