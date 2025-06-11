
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LoginForm } from "@/components/login/LoginForm";
import { useAuth } from "@/contexts/AuthContext";
import { UserRole } from "@/types";
import { cleanupAuthState } from "@/utils/authUtils";

export default function Login() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [showTimeout, setShowTimeout] = useState(false);

  // Clean up auth state when login page loads
  useEffect(() => {
    cleanupAuthState();
  }, []);

  useEffect(() => {
    console.log('Login page - user:', user?.username, 'loading:', loading);
    
    if (!loading && user) {
      console.log('Redirecting user based on role:', user.role);
      // Redirect based on user role
      if (user.role === UserRole.ADMIN) {
        navigate("/admin");
      } else if (user.role === UserRole.EVALUATOR) {
        navigate("/evaluator");
      }
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    // Pokažij timeout poruku ako loading traje duže od 8 sekundi
    if (loading) {
      const timer = setTimeout(() => {
        setShowTimeout(true);
      }, 8000);

      return () => clearTimeout(timer);
    } else {
      setShowTimeout(false);
    }
  }, [loading]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-lg">Učitavanje...</p>
          
          {showTimeout && (
            <div className="space-y-2 mt-4">
              <p className="text-sm text-yellow-600">
                Učitavanje traje duže nego obično...
              </p>
              <p className="text-xs text-muted-foreground">
                Molimo osvježite stranicu ako se problem nastavi.
              </p>
              <button 
                onClick={() => window.location.reload()} 
                className="text-sm text-blue-600 hover:underline"
              >
                Osvježite stranicu
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

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
