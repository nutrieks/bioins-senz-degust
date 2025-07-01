
// Datoteka: src/components/auth/ProtectedRoute.tsx
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { LoadingState } from '@/components/evaluation/LoadingState'; // Koristimo postojeći loader

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    // Prikazuj globalni loader DOK god traje početna provjera sesije.
    // Ovo zaustavlja ostatak aplikacije i sprječava stanje utrke.
    return <LoadingState />;
  }

  if (!user) {
    // Ako provjera završi i nema korisnika, preusmjeri na login.
    // Pamtimo odakle je korisnik došao da ga možemo vratiti nakon prijave.
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Ako je provjera gotova i korisnik postoji, prikaži zaštićenu stranicu.
  return <>{children}</>;
};
