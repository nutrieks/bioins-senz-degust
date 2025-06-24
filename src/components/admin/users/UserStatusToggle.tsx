
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { updateUserStatus } from "@/services/dataService";
import { User } from "@/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface UserStatusToggleProps {
  user: User;
  onStatusChanged: () => void;
}

export function UserStatusToggle({ user, onStatusChanged }: UserStatusToggleProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const updateStatusMutation = useMutation({
    mutationFn: ({ userId, isActive }: { userId: string; isActive: boolean }) => 
      updateUserStatus(userId, isActive),
    onSuccess: (success, { isActive }) => {
      if (success) {
        toast({
          title: "Uspjeh",
          description: `Korisnik je ${isActive ? "aktiviran" : "deaktiviran"}.`,
        });
        queryClient.invalidateQueries({ queryKey: ['users'] });
        onStatusChanged();
      } else {
        toast({
          title: "Greška",
          description: "Greška pri mijenjanju statusa korisnika.",
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

  const handleStatusChange = async (checked: boolean) => {
    updateStatusMutation.mutate({ userId: user.id, isActive: checked });
  };

  return (
    <Switch
      checked={user.isActive}
      onCheckedChange={handleStatusChange}
      disabled={updateStatusMutation.isPending}
    />
  );
}
