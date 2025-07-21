
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LoginForm } from "@/components/login/LoginForm";
import { useAuth } from "@/contexts/AuthContext";
import { UserRole } from "@/types";

export default function Login() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    console.log('🔐 Login useEffect triggered:', { 
      loading, 
      user: user ? `${user.username} (${user.role})` : 'No user',
      currentPath: window.location.pathname
    });

    // Only redirect if user is authenticated and we're not loading
    if (!loading && user) {
      console.log('🔐 Login: User is authenticated, preparing redirect...');
      
      // Add a small delay to allow any toasts to show
      const redirectTimer = setTimeout(() => {
        if (user.role === UserRole.ADMIN) {
          console.log('🔐 Redirecting admin to /admin');
          navigate("/admin", { replace: true });
        } else if (user.role === UserRole.EVALUATOR) {
          console.log('🔐 Redirecting evaluator to /evaluator');
          navigate("/evaluator", { replace: true });
        } else {
          console.warn('🚨 Unknown user role:', user.role);
        }
      }, 500); // 500ms delay to show toast

      return () => clearTimeout(redirectTimer);
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

  // If user is authenticated, show minimal content while redirect happens
  if (user) {
    console.log('🔐 Login: User authenticated, redirect should happen soon');
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-secondary/30 p-4">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-primary">Senzorska Degustacija</h1>
          <p className="text-lg text-muted-foreground">Preusmjeravanje...</p>
        </div>
      </div>
    );
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
