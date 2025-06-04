
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { updateUserStatus } from "@/services/dataService";
import { User } from "@/types";

interface UserStatusToggleProps {
  user: User;
  onStatusChanged: () => void;
}

export function UserStatusToggle({ user, onStatusChanged }: UserStatusToggleProps) {
  const { toast } = useToast();

  const handleStatusChange = async (checked: boolean) => {
    try {
      const success = await updateUserStatus(user.id, checked);
      
      if (success) {
        toast({
          title: "Uspjeh",
          description: `Korisnik je ${checked ? "aktiviran" : "deaktiviran"}.`,
        });
        onStatusChanged();
      } else {
        toast({
          title: "Greška",
          description: "Greška pri mijenjanju statusa korisnika.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Greška",
        description: "Došlo je do pogreške.",
        variant: "destructive",
      });
    }
  };

  return (
    <Switch
      checked={user.isActive}
      onCheckedChange={handleStatusChange}
    />
  );
}
