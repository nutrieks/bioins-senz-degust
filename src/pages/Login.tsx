
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LoginForm } from "@/components/login/LoginForm";
import { useAuth } from "@/contexts/AuthContext";
import { UserRole } from "@/types";

export default function Login() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  // Ovaj useEffect ostaje kako bi preusmjerio korisnika ako je već prijavljen
  // i pokuša pristupiti /login stranici.
  useEffect(() => {
    if (!loading && user) {
      if (user.role === UserRole.ADMIN) {
        navigate("/admin");
      } else if (user.role === UserRole.EVALUATOR) {
        navigate("/evaluator");
      }
    }
  }, [user, loading, navigate]);

  // Nema više potrebe za prikazivanjem spinnera ovdje. AuthGuard to radi.
  // Ako je `isLoading` true, AuthGuard će prikazati spinner prije nego što se ova komponenta i iscrta.

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
