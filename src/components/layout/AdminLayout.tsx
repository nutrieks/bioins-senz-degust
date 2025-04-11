
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { UserRole } from "@/types";
import { Button } from "@/components/ui/button";
import { 
  Calendar, 
  ClipboardList, 
  FileBarChart, 
  Home, 
  LogOut, 
  Menu, 
  Users
} from "lucide-react";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (user && user.role !== UserRole.ADMIN) {
      navigate("/");
    }
  }, [user, navigate]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const navigation = [
    { name: "Početna", href: "/admin", icon: Home },
    { name: "Događaji", href: "/admin/events", icon: Calendar },
    { name: "Proizvodi", href: "/admin/products", icon: ClipboardList },
    { name: "Izvještaji", href: "/admin/reports", icon: FileBarChart },
    { name: "Korisnici", href: "/admin/users", icon: Users },
  ];

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar for desktop */}
      <div className="hidden md:flex md:w-64 md:flex-col">
        <div className="flex min-h-0 flex-1 flex-col border-r bg-card">
          <div className="flex flex-1 flex-col overflow-y-auto pt-5 pb-4">
            <div className="flex flex-shrink-0 items-center px-4">
              <h1 className="text-xl font-bold">Sensor Taste Nexus</h1>
            </div>
            <nav className="mt-5 flex-1 space-y-1 px-2">
              {navigation.map((item) => (
                <Button
                  key={item.name}
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => navigate(item.href)}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Button>
              ))}
            </nav>
          </div>
          <div className="flex flex-shrink-0 border-t p-4">
            <div className="flex items-center">
              <div>
                <p className="text-sm font-medium">{user?.username}</p>
                <p className="text-xs text-muted-foreground">Administrator</p>
              </div>
              <Button variant="ghost" size="icon" onClick={handleLogout} className="ml-auto">
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu button */}
      <div className="md:hidden absolute top-0 left-0 p-4 z-50">
        <Button variant="outline" size="icon" onClick={toggleMobileMenu}>
          <Menu className="h-5 w-5" />
        </Button>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-background">
          <div className="flex min-h-full flex-col">
            <div className="flex items-center justify-between px-4 py-4 border-b">
              <h1 className="text-xl font-bold">Sensor Taste Nexus</h1>
              <Button variant="ghost" size="icon" onClick={toggleMobileMenu}>
                <span className="sr-only">Close menu</span>
                ✕
              </Button>
            </div>
            <nav className="flex-1 space-y-1 px-2 py-4">
              {navigation.map((item) => (
                <Button
                  key={item.name}
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => {
                    navigate(item.href);
                    setIsMobileMenuOpen(false);
                  }}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Button>
              ))}
            </nav>
            <div className="border-t p-4">
              <div className="flex items-center">
                <div>
                  <p className="text-sm font-medium">{user?.username}</p>
                  <p className="text-xs text-muted-foreground">Administrator</p>
                </div>
                <Button variant="ghost" size="icon" onClick={handleLogout} className="ml-auto">
                  <LogOut className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
