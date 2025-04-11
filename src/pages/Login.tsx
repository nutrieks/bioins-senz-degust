
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LoginForm } from "@/components/login/LoginForm";
import { useAuth } from "@/contexts/AuthContext";
import { UserRole } from "@/types";

export default function Login() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      // Redirect based on user role
      if (user.role === UserRole.ADMIN) {
        navigate("/admin");
      } else if (user.role === UserRole.EVALUATOR) {
        navigate("/evaluator");
      }
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Učitavanje...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-secondary/30 p-4">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-primary">Sensory Taste Nexus</h1>
        <p className="text-lg text-muted-foreground">Platforma za senzorsku analizu</p>
      </div>
      <LoginForm />
    </div>
  );
}
