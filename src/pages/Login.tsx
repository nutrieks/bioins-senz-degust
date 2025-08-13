
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LoginForm } from "@/components/login/LoginForm";
import { useAuth } from "@/contexts/AuthContext";
import { UserRole } from "@/types";
import { BrandLogo } from "@/components/BrandLogo";

export default function Login() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Ova logika se izvršava SVAKI PUT kada se 'user' ili 'loading' promijene.
    // Ako učitavanje završi i imamo korisnika, preusmjeri ga.
    if (!loading && user) {
      const redirectPath = user.role === UserRole.ADMIN ? '/admin' : '/evaluator';
      console.log(`🔐 Login Page: User detected. Redirecting to ${redirectPath}`);
      navigate(redirectPath, { replace: true });
    }
  }, [user, loading, navigate]);

  // Prikazujemo spinner dok se provjerava inicijalna sesija
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-slate-600">Provjera sesije...</p>
        </div>
      </div>
    );
  }

  // Ako nakon provjere i dalje nema korisnika, prikaži formu za prijavu.
  // Ako korisnik postoji, useEffect iznad će odraditi preusmjeravanje.
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-card to-muted relative overflow-hidden">
      {/* Enhanced dark background gradient overlay */}
      <div className="absolute inset-0 admin-gradient-bg opacity-20"></div>
      <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 via-transparent to-accent/5"></div>
      <div className="relative z-10 w-full max-w-md px-4 animate-fade-in">
        <div className="flex justify-center mb-8">
          <BrandLogo to="/" size="lg" eager />
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
