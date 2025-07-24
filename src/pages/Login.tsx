
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LoginForm } from "@/components/login/LoginForm";
import { useAuth } from "@/contexts/AuthContext";
import { UserRole } from "@/types";

export default function Login() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    console.log('🔐 Login page: Auth state check', { loading, user: user?.username });
    
    // NO REDIRECT LOGIC HERE - AuthContext handles all redirects now
    if (!loading && user) {
      console.log('🔐 Login page: User already authenticated, AuthContext will handle redirect');
    }
  }, [user, loading]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-slate-600">Učitavanje...</p>
          <p className="text-xs text-slate-400 mt-2">AuthProvider loading: {loading ? 'true' : 'false'}</p>
        </div>
      </div>
    );
  }

  if (user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-slate-600">Prijavljeni ste kao {user.username}</p>
          <p className="text-xs text-slate-400 mt-2">AuthContext će obraditi preusmjeravanje...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
      <LoginForm />
    </div>
  );
}
