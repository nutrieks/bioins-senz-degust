
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { RefreshCw, CheckCircle, AlertCircle } from "lucide-react";

interface SyncResult {
  success: boolean;
  message: string;
  syncedUsers: number;
  totalUsers: number;
  errors: string[];
}

export function PublicSyncButton() {
  const [isLoading, setIsLoading] = useState(false);
  const [syncResult, setSyncResult] = useState<SyncResult | null>(null);
  const { toast } = useToast();

  const handleSync = async () => {
    setIsLoading(true);
    setSyncResult(null);

    try {
      // Call the public edge function directly
      const response = await fetch(`https://tlluqspuyjxfsrzpqked.supabase.co/functions/v1/sync-users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      setSyncResult(result);

      if (result.success) {
        toast({
          title: "Sinkronizacija uspješna",
          description: result.message,
        });
      } else {
        toast({
          title: "Greška pri sinkronizaciji",
          description: result.message || result.error,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Sync error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast({
        title: "Greška",
        description: `Došlo je do neočekivane greške: ${errorMessage}`,
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
        {isLoading ? 'Sinkronizira...' : 'Javna sinkronizacija korisnika'}
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
                  Sinkronizirano korisnika: {syncResult.syncedUsers} od {syncResult.totalUsers}
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
