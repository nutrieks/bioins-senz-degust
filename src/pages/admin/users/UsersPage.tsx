
import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ChangePasswordDialog } from "@/components/admin/users/ChangePasswordDialog";
import { UserStatusToggle } from "@/components/admin/users/UserStatusToggle";
import { getUsers } from "@/services/dataService";
import { User, UserRole } from "@/types";
import { Key, Users } from "lucide-react";

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const usersData = await getUsers();
      // Sort: Admin first, then evaluators by position
      usersData.sort((a, b) => {
        if (a.role === UserRole.ADMIN && b.role !== UserRole.ADMIN) return -1;
        if (a.role !== UserRole.ADMIN && b.role === UserRole.ADMIN) return 1;
        if (a.role === UserRole.EVALUATOR && b.role === UserRole.EVALUATOR) {
          return (a.evaluatorPosition || 0) - (b.evaluatorPosition || 0);
        }
        return 0;
      });
      setUsers(usersData);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleChangePassword = (user: User) => {
    setSelectedUser(user);
    setPasswordDialogOpen(true);
  };

  const handlePasswordChanged = () => {
    fetchUsers(); // Refresh users list
  };

  const handleStatusChanged = () => {
    fetchUsers(); // Refresh users list
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
            <CardTitle>Svi korisnici sistema</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center p-4">Učitavanje...</div>
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
