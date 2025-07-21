
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LoginForm } from "@/components/login/LoginForm";
import { useAuth } from "@/contexts/AuthContext";
import { UserRole } from "@/types";

export default function Login() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    console.log('🔐 Login component state:', { 
      loading, 
      user: user ? `${user.username} (${user.role})` : 'No user'
    });

    // If user is already authenticated, redirect immediately
    if (!loading && user) {
      console.log('🔐 Login: User already authenticated, redirecting...');
      
      if (user.role === UserRole.ADMIN) {
        console.log('🔐 Redirecting admin to /admin');
        navigate("/admin", { replace: true });
      } else if (user.role === UserRole.EVALUATOR) {
        console.log('🔐 Redirecting evaluator to /evaluator');
        navigate("/evaluator", { replace: true });
      }
    }
  }, [user, loading, navigate]);

  // Show loading state while checking authentication
  if (loading) {
    console.log('🔐 Login: Showing loading state');
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-secondary/30 p-4">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-primary">Senzorska Degustacija</h1>
          <p className="text-lg text-muted-foreground">Učitavanje...</p>
        </div>
      </div>
    );
  }

  // If user is authenticated, don't show login form (redirect should happen)
  if (user) {
    console.log('🔐 Login: User authenticated, should redirect soon');
    return null;
  }

  // Show login form for unauthenticated users
  console.log('🔐 Login: Showing login form');
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
