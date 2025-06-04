
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { syncUsersWithAuth, SyncResult } from "@/services/supabase/userSync";
import { RefreshCw, CheckCircle, AlertCircle } from "lucide-react";

export function UserSyncButton() {
  const [isLoading, setIsLoading] = useState(false);
  const [syncResult, setSyncResult] = useState<SyncResult | null>(null);
  const { toast } = useToast();

  const handleSync = async () => {
    setIsLoading(true);
    setSyncResult(null);

    try {
      const result = await syncUsersWithAuth();
      setSyncResult(result);

      if (result.success) {
        toast({
          title: "Sinkronizacija uspješna",
          description: result.message,
        });
      } else {
        toast({
          title: "Greška pri sinkronizaciji",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Sync error:', error);
      toast({
        title: "Greška",
        description: "Došlo je do neočekivane greške prilikom sinkronizacije.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Button 
        onClick={handleSync} 
        disabled={isLoading}
        variant="outline"
        className="w-full sm:w-auto"
      >
        <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
        {isLoading ? 'Sinkronizira...' : 'Sinkroniziraj korisnike s Auth'}
      </Button>

      {syncResult && (
        <Alert variant={syncResult.success ? "default" : "destructive"}>
          {syncResult.success ? (
            <CheckCircle className="h-4 w-4" />
          ) : (
            <AlertCircle className="h-4 w-4" />
          )}
          <AlertDescription>
            <div>
              <p className="font-medium">{syncResult.message}</p>
              {syncResult.syncedUsers > 0 && (
                <p className="text-sm mt-1">
                  Sinkronizirano korisnika: {syncResult.syncedUsers}
                </p>
              )}
              {syncResult.errors.length > 0 && (
                <div className="mt-2">
                  <p className="text-sm font-medium">Greške:</p>
                  <ul className="text-sm mt-1 space-y-1">
                    {syncResult.errors.map((error, index) => (
                      <li key={index} className="text-muted-foreground">
                        • {error}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
