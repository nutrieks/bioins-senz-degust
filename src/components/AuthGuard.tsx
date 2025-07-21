
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { UserRole } from "@/types";
import { LoadingState } from "@/components/evaluation/LoadingState";

interface AuthGuardProps {
  role: UserRole;
}

const AuthGuard = ({ role }: AuthGuardProps) => {
  const { user, loading } = useAuth();

  console.log('🛡️ AuthGuard check:', { 
    loading, 
    user: user?.username, 
    userRole: user?.role, 
    requiredRole: role 
  });

  // Show loading state during authentication check
  if (loading) {
    return <LoadingState message="Provjera prijave..." />;
  }

  // Redirect to login if not authenticated
  if (!user) {
    console.log('🛡️ AuthGuard: No user, redirecting to login');
    return <Navigate to="/login" replace />;
  }
  
  // Redirect to appropriate dashboard if user has wrong role
  if (user.role !== role) {
    console.log('🛡️ AuthGuard: Wrong role, redirecting to dashboard');
    const redirectPath = user.role === UserRole.ADMIN ? "/admin" : "/evaluator";
    return <Navigate to={redirectPath} replace />;
  }

  console.log('🛡️ AuthGuard: Access granted');
  // Render protected content if everything is ok
  return <Outlet />;
};

export default AuthGuard;
