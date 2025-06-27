
import { useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ChangePasswordDialog } from "@/components/admin/users/ChangePasswordDialog";
import { UserStatusToggle } from "@/components/admin/users/UserStatusToggle";
import { UserSyncButton } from "@/components/admin/users/UserSyncButton";
import { PublicSyncButton } from "@/components/admin/users/PublicSyncButton";
import { User, UserRole } from "@/types";
import { Key, Users } from "lucide-react";
import { useUsers } from "@/hooks/useUsers";

export default function UsersPage() {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const { data: users = [], isLoading, isError, error } = useUsers();

  if (isError) {
    return (
      <AdminLayout>
        <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-red-600 mb-4">
              Greška pri dohvaćanju korisnika
            </h2>
            <p className="text-muted-foreground mb-4">
              {error?.message || 'Nepoznata greška'}
            </p>
            <Button 
              onClick={() => window.location.reload()}
              variant="outline"
            >
              Pokušaj ponovno
            </Button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  const handleChangePassword = (user: User) => {
    setSelectedUser(user);
    setPasswordDialogOpen(true);
  };

  const handlePasswordChanged = () => {
    // React Query handles cache invalidation automatically
  };

  const handleStatusChanged = () => {
    // React Query handles cache invalidation automatically
  };

  const getUserDisplayName = (user: User) => {
    if (user.role === UserRole.ADMIN) {
      return "Administrator";
    }
    return `Ocjenjivač ${user.evaluatorPosition}`;
  };

  const getRoleBadgeVariant = (role: UserRole) => {
    return role === UserRole.ADMIN ? "default" : "secondary";
  };

  const getStatusBadgeVariant = (isActive: boolean) => {
    return isActive ? "default" : "destructive";
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          <h1 className="text-2xl font-bold">Upravljanje korisnicima</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Hitna sinkronizacija korisnika</CardTitle>
            <div className="text-sm text-muted-foreground">
              Koristite ovu javnu funkciju za početnu sinkronizaciju korisnika s Supabase Auth sistemom.
              Nakon što se korisnici sinkroniziraju, moći ćete se prijaviti normalno.
            </div>
          </CardHeader>
          <CardContent>
            <PublicSyncButton />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Standardna sinkronizacija korisnika</CardTitle>
            <div className="text-sm text-muted-foreground">
              Ako login ne funkcionira, sinkronizirajte korisnike s Supabase Auth sistemom.
              (Ova funkcija radi samo kada ste prijavljeni)
            </div>
          </CardHeader>
          <CardContent>
            <UserSyncButton />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Svi korisnici sistema</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center items-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2">Učitavanje...</span>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Korisnik</TableHead>
                    <TableHead>Korisničko ime</TableHead>
                    <TableHead>Uloga</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Aktivacija</TableHead>
                    <TableHead>Akcije</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">
                        {getUserDisplayName(user)}
                      </TableCell>
                      <TableCell className="font-mono">
                        {user.username}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getRoleBadgeVariant(user.role)}>
                          {user.role === UserRole.ADMIN ? "Admin" : "Ocjenjivač"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(user.isActive)}>
                          {user.isActive ? "Aktivan" : "Neaktivan"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <UserStatusToggle 
                          user={user} 
                          onStatusChanged={handleStatusChanged}
                        />
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleChangePassword(user)}
                        >
                          <Key className="mr-2 h-4 w-4" />
                          Promijeni lozinku
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <ChangePasswordDialog
          user={selectedUser}
          open={passwordDialogOpen}
          onOpenChange={setPasswordDialogOpen}
          onPasswordChanged={handlePasswordChanged}
        />
      </div>
    </AdminLayout>
  );
}
