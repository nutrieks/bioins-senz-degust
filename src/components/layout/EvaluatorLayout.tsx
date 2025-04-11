
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { UserRole } from "@/types";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

interface EvaluatorLayoutProps {
  children: React.ReactNode;
}

export function EvaluatorLayout({ children }: EvaluatorLayoutProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && user.role !== UserRole.EVALUATOR) {
      navigate("/");
    }
  }, [user, navigate]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-primary text-primary-foreground p-4 flex justify-between items-center">
        <div>
          <h1 className="text-lg font-bold">Bioins senzorska analiza</h1>
          <p className="text-sm opacity-90">Platforma za senzorsku analizu</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm font-medium">{user?.username}</p>
            <p className="text-xs opacity-80">
              Ocjenjivačko mjesto: {user?.evaluatorPosition || "-"}
            </p>
          </div>
          <Button variant="secondary" size="sm" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Odjava
          </Button>
        </div>
      </header>

      <main className="container mx-auto py-4 px-4 md:px-0">
        {children}
      </main>

      <footer className="bg-muted py-4 text-center text-sm text-muted-foreground">
        <p>© {new Date().getFullYear()} Bioins senzorska analiza</p>
      </footer>
    </div>
  );
}
