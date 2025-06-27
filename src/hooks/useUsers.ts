
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { getUsers, updateUserPassword, updateUserStatus } from '@/services/dataService';
import { User, UserRole } from '@/types';

export function useUsers() {
  return useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const usersData = await getUsers();
      // Sort users by role and position
      usersData.sort((a, b) => {
        if (a.role === UserRole.ADMIN && b.role !== UserRole.ADMIN) return -1;
        if (a.role !== UserRole.ADMIN && b.role === UserRole.ADMIN) return 1;
        if (a.role === UserRole.EVALUATOR && b.role === UserRole.EVALUATOR) {
          return (a.evaluatorPosition || 0) - (b.evaluatorPosition || 0);
        }
        return 0;
      });
      return usersData;
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
    retry: 3,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

export function useUserMutations() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const changePasswordMutation = useMutation({
    mutationFn: async ({ userId, newPassword }: { userId: string; newPassword: string }) => {
      return updateUserPassword(userId, newPassword);
    },
    onSuccess: () => {
      toast({
        title: "Uspješno",
        description: "Lozinka je uspješno promijenjena.",
      });
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (error) => {
      console.error("Error changing password:", error);
      toast({
        title: "Greška",
        description: "Došlo je do pogreške prilikom mijenjanja lozinke.",
        variant: "destructive",
      });
    },
  });

  const toggleUserStatusMutation = useMutation({
    mutationFn: async ({ userId, isActive }: { userId: string; isActive: boolean }) => {
      return updateUserStatus(userId, isActive);
    },
    onSuccess: () => {
      toast({
        title: "Uspješno",
        description: "Status korisnika je uspješno promijenjen.",
      });
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (error) => {
      console.error("Error toggling user status:", error);
      toast({
        title: "Greška",
        description: "Došlo je do pogreške prilikom mijenjanja statusa korisnika.",
        variant: "destructive",
      });
    },
  });

  return {
    changePassword: changePasswordMutation,
    toggleUserStatus: toggleUserStatusMutation,
  };
}
