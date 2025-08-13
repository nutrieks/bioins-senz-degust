
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";

interface EvaluatorLayoutProps {
  children: React.ReactNode;
}

export function EvaluatorLayout({ children }: EvaluatorLayoutProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="admin-gradient-bg border-b border-border/20 backdrop-blur-sm p-4 flex justify-between items-center admin-glow-border">
        <div className="flex items-center gap-3">
          <BrandLogo to="/evaluator" size="sm" />
          <div className="leading-tight">
            <h1 className="text-lg font-bold text-foreground">Bioins senzorska analiza</h1>
            <p className="text-sm opacity-80 text-muted-foreground">Platforma za senzorsku analizu</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm font-medium text-foreground">{user?.username}</p>
            <p className="text-xs opacity-80 text-muted-foreground">
              Ocjenjivačko mjesto: {user?.evaluatorPosition || "-"}
            </p>
          </div>
          <Button variant="secondary" size="sm" onClick={handleLogout} className="hover-scale">
            <LogOut className="h-4 w-4 mr-2" />
            Odjava
          </Button>
        </div>
      </header>

      <main className="py-6 px-4 md:px-0">
        {children}
      </main>

      <footer className="bg-card/50 border-t border-border/20 py-4 text-center text-sm text-muted-foreground">
        <p>© {new Date().getFullYear()} Bioins senzorska analiza</p>
      </footer>
    </div>
  );
}
