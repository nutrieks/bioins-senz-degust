
import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { LoginForm } from "@/components/login/LoginForm";
import { useAuth } from "@/contexts/AuthContext";
import { UserRole } from "@/types";

export default function Login() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const hasRedirected = useRef(false);

  useEffect(() => {
    // Only redirect if we have a user and haven't already redirected
    if (!loading && user && !hasRedirected.current) {
      hasRedirected.current = true;
      
      console.log('🔐 Login: Redirecting authenticated user:', user.username);
      
      if (user.role === UserRole.ADMIN) {
        navigate("/admin", { replace: true });
      } else if (user.role === UserRole.EVALUATOR) {
        navigate("/evaluator", { replace: true });
      }
    }
  }, [user, loading, navigate]);

  // Reset redirect flag when user changes
  useEffect(() => {
    if (!user) {
      hasRedirected.current = false;
    }
  }, [user]);

  // Show login form if not authenticated or still loading
  if (loading || !user) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-secondary/30 p-4">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-primary">Senzorska Degustacija</h1>
          <p className="text-lg text-muted-foreground">Platforma za senzorsku analizu</p>
        </div>
        <LoginForm />
      </div>
    );
  }

  // Return null during redirect to prevent flash
  return null;
}
