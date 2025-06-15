
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export function LoginForm() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const { login } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    
    try {
      console.log('Form submitting with:', identifier);
      
      // Convert identifier to username format
      let username = identifier;
      if (identifier === "ADMIN") {
        username = "admin";
      } else if (/^([1-9]|1[0-2])$/.test(identifier)) {
        username = `evaluator${identifier}`;
      }

      console.log('Attempting login with username:', username);
      
      const success = await login(username, password);
      
      if (!success) {
        setError("Neispravno korisničko ime ili lozinka");
        toast({
          title: "Greška prilikom prijave",
          description: "Molimo provjerite korisničko ime i lozinku",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Uspješna prijava",
          description: "Dobrodošli u sustav",
        });
      }
    } catch (error) {
      console.error('Login form error:', error);
      setError("Došlo je do greške prilikom prijave");
      toast({
        title: "Greška",
        description: "Došlo je do neočekivane greške",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

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
              disabled={isLoading}
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
              disabled={isLoading}
            />
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Prijava u tijeku..." : "Prijava"}
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
