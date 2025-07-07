
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { UserRole } from "@/types";
import { LoadingState } from "@/components/evaluation/LoadingState";

interface AuthGuardProps {
  role: UserRole;
}

const AuthGuard = ({ role }: AuthGuardProps) => {
  const { user, loading } = useAuth();

  // Show loading state during authentication check
  if (loading) {
    return <LoadingState message="Provjera prijave..." />;
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
