
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { UserRole } from "@/types";

export function LoginForm() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, loading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);
    
    try {
      console.log('🔐 LoginForm: Starting login process for:', identifier);
      
      const result = await login(identifier, password);
      const { error: loginError } = result;
      
      if (loginError) {
        console.error('🚨 LoginForm: Login failed:', loginError);
        setError("Neispravno korisničko ime ili lozinka");
        toast({
          title: "Greška prilikom prijave",
          description: "Molimo provjerite korisničko ime i lozinku",
          variant: "destructive",
        });
      } else if (!loginError) {
        setError('');
        toast({
          title: "Uspješna prijava",
          description: "Preusmjeravanje u tijeku...",
        });
        console.log('🔐 LoginForm: Login successful, handling direct navigation');
        
        // DIRECT NAVIGATION - zewnętrzny prijedlog implementiran
        const userRole = identifier.toUpperCase() === 'ADMIN' ? UserRole.ADMIN : UserRole.EVALUATOR;
        const redirectPath = userRole === UserRole.ADMIN ? '/admin' : '/evaluator';
        console.log('🔐 LoginForm: Navigating to:', redirectPath);
        navigate(redirectPath);
      }
    } catch (error) {
      console.error('🚨 LoginForm: Unexpected error:', error);
      setError("Došlo je do greške prilikom prijave");
      toast({
        title: "Greška",
        description: "Došlo je do neočekivane greške",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isDisabled = loading || isSubmitting;

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-2xl text-center">Bioins senzorska analiza</CardTitle>
        <CardDescription className="text-center">Prijavite se u platformu za senzorsku analizu</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 text-red-700 p-3 rounded-md text-sm">
              {error}
            </div>
          )}
          <div className="space-y-2">
            <label htmlFor="identifier" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Korisničko ime
            </label>
            <Input
              id="identifier"
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              required
              autoFocus
              className="w-full"
              placeholder="Unesite ADMIN ili broj mjesta (1-12)"
              disabled={isDisabled}
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Lozinka
            </label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full"
              placeholder="Unesite lozinku"
              disabled={isDisabled}
            />
          </div>
          <Button type="submit" className="w-full" disabled={isDisabled}>
            {isSubmitting ? "Prijava u tijeku..." : "Prijava"}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex justify-center">
        <p className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} Bioins senzorska analiza
        </p>
      </CardFooter>
    </Card>
  );
}
