import { useEffect, useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { UserRole } from "@/types";
import { Button } from "@/components/ui/button";
import { Calendar, ClipboardList, Home, LogOut, Menu, Users, PlusCircle } from "lucide-react";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const { user, logout, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) {
      navigate("/");
    } else if (user && user.role !== UserRole.ADMIN) {
      navigate("/");
    }
  }, [user, isLoading, navigate]);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const navigation = [
    {
      name: "Početna",
      href: "/admin",
      icon: Home,
      current: location.pathname === '/admin'
    },
    {
      name: "Događaji",
      href: "/admin/events",
      icon: Calendar,
      current: location.pathname.includes('/admin/events')
    },
    {
      name: "Proizvodi",
      href: "/admin/products",
      icon: ClipboardList,
      current: location.pathname.includes('/admin/products')
    },
    {
      name: "Korisnici",
      href: "/admin/users",
      icon: Users,
      current: location.pathname.includes('/admin/users')
    }
  ];

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar for desktop */}
      <div className="hidden md:flex md:w-64 md:flex-col">
        <div className="flex min-h-0 flex-1 flex-col border-r bg-card">
          <div className="flex flex-shrink-0 items-center px-4 py-4 border-b">
            <h1 className="text-xl font-bold text-center">Bioinstitut - senzorska analiza</h1>
          </div>
          <nav className="flex-1 space-y-1 px-4 py-4">
            {navigation.map(item => (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  item.current ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                <item.icon className="mr-3 h-5 w-5 flex-shrink-0" aria-hidden="true" />
                {item.name}
              </Link>
            ))}
            
            <div className="pt-4 mt-4 border-t">
              <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/admin/events/new')}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Novi događaj
              </Button>
            </div>
          </nav>
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
              <h1 className="text-xl font-bold">Bioins senzorska analiza</h1>
              <Button variant="ghost" size="icon" onClick={toggleMobileMenu}>
                <span className="sr-only">Close menu</span>
                ✕
              </Button>
            </div>
            <nav className="flex-1 space-y-1 px-4 py-4">
              {navigation.map(item => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    item.current ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <item.icon className="mr-3 h-5 w-5 flex-shrink-0" aria-hidden="true" />
                  {item.name}
                </Link>
              ))}
              
              <div className="pt-4 mt-4 border-t">
                <Button variant="outline" className="w-full justify-start" onClick={() => {
                  navigate('/admin/events/new');
                  setIsMobileMenuOpen(false);
                }}>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Novi događaj
                </Button>
              </div>
            </nav>
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
