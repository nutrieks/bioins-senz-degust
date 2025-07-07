
// Datoteka: src/components/auth/ProtectedRoute.tsx
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { LoadingState } from '@/components/evaluation/LoadingState';

export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    // Prikazuj globalni loader DOK god traje početna provjera sesije.
    return <LoadingState />;
  }
  if (!user) {
    // Ako provjera završi i nema korisnika, preusmjeri na login.
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  // Ako je provjera gotova i korisnik postoji, prikaži zaštićenu stranicu.
  return <>{children}</>;
};
