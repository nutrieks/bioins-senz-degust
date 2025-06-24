
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { updateUserPassword } from "@/services/dataService";
import { User } from "@/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface ChangePasswordDialogProps {
  user: User | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPasswordChanged: () => void;
}

export function ChangePasswordDialog({ user, open, onOpenChange, onPasswordChanged }: ChangePasswordDialogProps) {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const changePasswordMutation = useMutation({
    mutationFn: ({ userId, password }: { userId: string; password: string }) => 
      updateUserPassword(userId, password),
    onSuccess: (success) => {
      if (success) {
        toast({
          title: "Uspjeh",
          description: "Lozinka je uspješno promijenjena.",
        });
        queryClient.invalidateQueries({ queryKey: ['users'] });
        onPasswordChanged();
        onOpenChange(false);
        setNewPassword("");
        setConfirmPassword("");
      } else {
        toast({
          title: "Greška",
          description: "Greška pri mijenjanju lozinke.",
          variant: "destructive",
        });
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Greška",
        description: "Došlo je do pogreške.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;
    
    if (newPassword.length < 6) {
      toast({
        title: "Greška",
        description: "Lozinka mora imati najmanje 6 znakova.",
        variant: "destructive",
      });
      return;
    }
    
    if (newPassword !== confirmPassword) {
      toast({
        title: "Greška",
        description: "Lozinke se ne podudaraju.",
        variant: "destructive",
      });
      return;
    }

    changePasswordMutation.mutate({ userId: user.id, password: newPassword });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Promijeni lozinku</DialogTitle>
          <DialogDescription>
            Mijenjanje lozinke za korisnika: {user?.username}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="newPassword" className="text-right">
                Nova lozinka
              </Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="col-span-3"
                required
                minLength={6}
                disabled={changePasswordMutation.isPending}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="confirmPassword" className="text-right">
                Potvrdi lozinku
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="col-span-3"
                required
                minLength={6}
                disabled={changePasswordMutation.isPending}
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={changePasswordMutation.isPending}
            >
              Otkaži
            </Button>
            <Button 
              type="submit" 
              disabled={changePasswordMutation.isPending}
            >
              {changePasswordMutation.isPending ? "Mijenjam..." : "Promijeni lozinku"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
