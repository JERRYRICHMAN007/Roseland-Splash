import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { getSupabaseClient } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Lock, Eye, EyeOff, CheckCircle2, AlertCircle } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useToast } from "@/hooks/use-toast";
import * as authService from "@/services/authService";

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isValidSession, setIsValidSession] = useState<boolean | null>(null);
  const [passwordReset, setPasswordReset] = useState(false);

  // Check if we have a valid reset session - simplified approach
  useEffect(() => {
    let mounted = true;

    const validateSession = async () => {
      const supabase = getSupabaseClient();
      if (!supabase) {
        if (mounted) {
          setIsValidSession(false);
          setError("Database not configured. Please refresh the page.");
        }
        return;
      }

      // Check URL hash for reset token (Supabase sends reset links with hash like #access_token=...&type=recovery)
      const hash = window.location.hash.substring(1);
      const hashParams = new URLSearchParams(hash);
      const accessToken = hashParams.get("access_token");
      const type = hashParams.get("type");

      // Also check search params
      const accessTokenFromSearch = searchParams.get("access_token");
      const typeFromSearch = searchParams.get("type");

      const hasToken = !!(accessToken || accessTokenFromSearch);
      const isRecoveryType = type === "recovery" || typeFromSearch === "recovery";

      console.log("Reset link validation:", {
        hasHash: hash.length > 0,
        hasToken,
        isRecoveryType,
        hashPreview: hash.length > 0 ? hash.substring(0, 50) + "..." : "empty",
        url: window.location.href,
      });

      // Strategy: If we detect valid recovery tokens in URL, immediately allow user to proceed
      // Supabase will establish the session automatically when processing the hash
      if ((hasToken && isRecoveryType) || hash.includes("access_token") || hash.includes("type=recovery")) {
        console.log("✅ Valid recovery tokens detected - allowing password reset");
        if (mounted) {
          setIsValidSession(true);
          // Don't clear hash yet - Supabase needs it to establish session
        }
        return;
      }

      // If no tokens in URL hash, check for existing session (might have been processed already)
      try {
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        
        if (mounted) {
          if (sessionData?.session) {
            setIsValidSession(true);
            // Clear the hash from URL for security
            window.history.replaceState(null, '', window.location.pathname + window.location.search);
          } else {
            // Check if error is specifically about expired token
            if (sessionError?.message?.includes('expired') || sessionError?.message?.includes('invalid')) {
              setIsValidSession(false);
              setError("This password reset link has expired. Please request a new one.");
            } else {
              // No tokens and no session - invalid link
              setIsValidSession(false);
              setError("Invalid or expired reset link. Please request a new password reset.");
            }
          }
        }
      } catch (sessionErr: any) {
        // Handle expired token errors gracefully
        if (mounted) {
          if (sessionErr.message?.includes('expired') || sessionErr.message?.includes('otp_expired')) {
            setIsValidSession(false);
            setError("This password reset link has expired. Please request a new one.");
          } else {
            setIsValidSession(false);
            setError("Invalid reset link. Please request a new password reset.");
          }
        }
      }
    };

    // Check immediately - no delay needed
    validateSession();

    return () => {
      mounted = false;
    };
  }, [searchParams]);

  const validatePassword = (): boolean => {
    if (!password) {
      setError("Password is required");
      return false;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      return false;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return false;
    }

    setError("");
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validatePassword()) {
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const supabase = getSupabaseClient();
      if (!supabase) {
        setError("Database not configured. Please refresh the page.");
        setIsSubmitting(false);
        return;
      }

      console.log("🔐 Starting password reset process...");

      // IMPORTANT: For Supabase recovery, we call updateUser directly
      // Supabase will automatically process the hash tokens from the URL
      // DO NOT clear the hash before updating password!
      
      console.log("Calling Supabase updateUser with new password...");
      
      // First, ensure we have a valid session by processing the hash
      const hash = window.location.hash.substring(1);
      if (hash) {
        console.log("Processing URL hash to establish session...");
        // Supabase will automatically process the hash when we call getSession
        await supabase.auth.getSession();
      }

      const { error: updateError } = await supabase.auth.updateUser({
        password: password,
      });

      console.log("Password update result:", { error: updateError?.message || null });
      
      if (updateError) {
        console.error("❌ Password update failed:", updateError);
        
        // Handle specific error cases
        let errorMessage = updateError.message || "Failed to reset password. Please try again or request a new reset link.";
        
        if (updateError.message?.includes('expired') || updateError.message?.includes('otp_expired') || updateError.message?.includes('invalid')) {
          errorMessage = "This password reset link has expired. Please request a new one from the forgot password page.";
        }
        
        setError(errorMessage);
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
      } else {
        console.log("✅ Password updated successfully!");
        setPasswordReset(true);
        toast({
          title: "Password Reset Successfully!",
          description: "Your password has been reset. You can now log in with your new password.",
        });

        // Sign out the user to clear the reset session
        await supabase.auth.signOut();

        // Redirect to login after 2 seconds
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      }
    } catch (error: any) {
      console.error("Password reset error:", error);
      const errorMsg = error.message || "Something went wrong. Please try again or request a new password reset.";
      setError(errorMsg);
      toast({
        title: "Error",
        description: errorMsg,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading state
  if (isValidSession === null) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8 md:py-16">
          <div className="max-w-md mx-auto">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center space-y-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  <p>Validating reset link...</p>
                  <p className="text-sm text-muted-foreground">
                    This should only take a moment
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Invalid session
  if (!isValidSession) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8 md:py-16">
          <div className="max-w-md mx-auto">
            <Card>
              <CardHeader className="text-center space-y-2">
                <div className="mx-auto w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center">
                  <AlertCircle className="text-destructive" size={32} />
                </div>
                <CardTitle className="text-2xl">Invalid Reset Link</CardTitle>
                <CardDescription>
                  This password reset link is invalid or has expired.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {error && (
                  <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md border border-destructive/20">
                    {error}
                  </div>
                )}
                <Button
                  type="button"
                  className="w-full"
                  onClick={() => navigate("/forgot-password")}
                >
                  Request New Reset Link
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => navigate("/login")}
                >
                  Back to Login
                </Button>
              </CardContent>
            </Card>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Success state
  if (passwordReset) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8 md:py-16">
          <div className="max-w-md mx-auto">
            <Card>
              <CardHeader className="text-center space-y-2">
                <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="text-primary" size={32} />
                </div>
                <CardTitle className="text-2xl">Password Reset Successful!</CardTitle>
                <CardDescription>
                  Your password has been successfully reset. Redirecting to login...
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Reset password form
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8 md:py-16">
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader className="text-center space-y-2">
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                <Lock className="text-primary" size={32} />
              </div>
              <CardTitle className="text-2xl">Reset Password</CardTitle>
              <CardDescription>
                Enter your new password below
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md border border-destructive/20">
                    {error}
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="password">New Password *</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="At least 6 characters"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        setError("");
                      }}
                      className="pl-10 pr-10"
                      required
                      minLength={6}
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

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password *</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Re-enter your new password"
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        setError("");
                      }}
                      className="pl-10 pr-10"
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                    >
                      {showConfirmPassword ? (
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
                  {isSubmitting ? "Resetting Password..." : "Reset Password"}
                </Button>

                <div className="text-center">
                  <Button
                    type="button"
                    variant="ghost"
                    className="w-full"
                    onClick={() => navigate("/login")}
                  >
                    Back to Login
                  </Button>
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

export default ResetPasswordPage;
