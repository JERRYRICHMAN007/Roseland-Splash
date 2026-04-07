import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShieldAlert, Lock } from "lucide-react";
import { isStoreManagerRole } from "@/utils/managerAccess";

interface ProtectedManagerRouteProps {
  children: React.ReactNode;
}

/**
 * Requires a signed-in user with role owner or admin.
 * Unauthenticated users are sent to /manager/login.
 */
const ProtectedManagerRoute = ({ children }: ProtectedManagerRouteProps) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading…</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    const returnTo = `${location.pathname}${location.search}`;
    navigate(`/manager/login?returnTo=${encodeURIComponent(returnTo)}`, { replace: true });
    return null;
  }

  if (!isStoreManagerRole(user?.role)) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-8 pb-6 text-center space-y-4">
            <div className="mx-auto w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
              <ShieldAlert className="text-destructive" size={32} />
            </div>
            <div>
              <h2 className="text-xl font-bold mb-2">Access denied</h2>
              <p className="text-muted-foreground text-sm">
                This area is only for store owners. Customer accounts cannot open the manager dashboard.
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <Button onClick={() => navigate("/", { replace: true })}>Go to store</Button>
              <Button
                variant="outline"
                onClick={() => navigate("/manager/login", { replace: true })}
              >
                <Lock className="mr-2" size={16} />
                Manager sign-in
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedManagerRoute;
