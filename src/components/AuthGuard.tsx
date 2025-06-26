
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { UserRole } from "@/types";

// Ova komponenta će biti "čuvar" za sve rute koje zahtijevaju prijavu.
const AuthGuard = ({ role }: { role: UserRole }) => {
  const { user, isLoading, authError } = useAuth();

  // 1. Ako se stanje prijave još uvijek provjerava, prikaži globalni spinner.
  // Ovo je JEDINI spinner koji korisnik treba vidjeti prilikom prvog učitavanja.
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // 2. Ako je došlo do greške pri autentifikaciji, prikaži poruku.
  if (authError) {
    return (
      <div className="flex min-h-screen items-center justify-center text-center">
        <div>
          <h2 className="text-xl text-destructive">Greška pri prijavi</h2>
          <p className="text-muted-foreground">{authError}</p>
        </div>
      </div>
    );
  }

  // 3. Ako provjera završi i nema korisnika, preusmjeri na login.
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  // 4. Ako korisnik postoji, ali njegova uloga ne odgovara ulozi potrebnoj za rutu, preusmjeri ga.
  if (user.role !== role) {
    // Ako admin pokuša pristupiti evaluatorskoj ruti, ili obrnuto.
    return <Navigate to={user.role === UserRole.ADMIN ? "/admin" : "/evaluator"} replace />;
  }

  // 5. Ako je sve u redu (provjera gotova, korisnik postoji i ima ispravnu ulogu), prikaži stranicu.
  return <Outlet />;
};

export default AuthGuard;
