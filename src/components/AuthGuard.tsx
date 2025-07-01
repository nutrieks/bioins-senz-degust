
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { UserRole } from "@/types";
import { LoadingState } from "@/components/evaluation/LoadingState";

interface AuthGuardProps {
  role: UserRole;
}

const AuthGuard = ({ role }: AuthGuardProps) => {
  const { user, isLoading, authError } = useAuth();

  // Show loading state during authentication check
  if (isLoading) {
    return <LoadingState message="Provjera prijave..." />;
  }

  // Show error state if authentication failed
  if (authError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <h2 className="text-xl font-semibold text-destructive">Greška pri prijavi</h2>
          <p className="text-muted-foreground">{authError}</p>
          <button 
            onClick={() => window.location.href = '/login'}
            className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
          >
            Idite na prijavu
          </button>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  // Redirect to appropriate dashboard if user has wrong role
  if (user.role !== role) {
    const redirectPath = user.role === UserRole.ADMIN ? "/admin" : "/evaluator";
    return <Navigate to={redirectPath} replace />;
  }

  // Render protected content if everything is ok
  return <Outlet />;
};

export default AuthGuard;
