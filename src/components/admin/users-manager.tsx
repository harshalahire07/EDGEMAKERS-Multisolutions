"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  getAllUsers,
  deleteUser,
  toggleAdminStatus,
  resetPassword,
} from "@/lib/user-database";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { User } from "@/lib/data";
import {
  Trash2,
  Shield,
  User as UserIcon,
  ShieldCheck,
  ShieldOff,
  KeyRound,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function UsersManager() {
  const [users, setUsers] = useState<User[]>([]);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [userToResetPassword, setUserToResetPassword] = useState<User | null>(
    null
  );
  const [newPassword, setNewPassword] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = () => {
    const allUsers = getAllUsers();
    setUsers(allUsers);
  };

  const handleDelete = (user: User) => {
    if (user.isAdmin) {
      toast({
        title: "Cannot Delete Admin",
        description: "Admin accounts cannot be deleted.",
        variant: "destructive",
      });
      return;
    }
    setUserToDelete(user);
  };

  const confirmDelete = () => {
    if (!userToDelete) return;

    const success = deleteUser(userToDelete.id);

    if (success) {
      toast({
        title: "User Deleted",
        description: `${userToDelete.name} has been removed.`,
      });
      loadUsers();
    } else {
      toast({
        title: "Error",
        description: "Failed to delete user.",
        variant: "destructive",
      });
    }

    setUserToDelete(null);
  };

  const handleToggleAdmin = (user: User) => {
    const success = toggleAdminStatus(user.id);

    if (success) {
      toast({
        title: user.isAdmin ? "Admin Removed" : "Admin Granted",
        description: `${user.name} is ${
          user.isAdmin ? "no longer" : "now"
        } an admin.`,
      });
      loadUsers();
    } else {
      toast({
        title: "Error",
        description: "Failed to update admin status.",
        variant: "destructive",
      });
    }
  };

  const handleResetPassword = (user: User) => {
    setUserToResetPassword(user);
    setNewPassword("");
  };

  const confirmResetPassword = async () => {
    if (!userToResetPassword || !newPassword) return;

    const result = await resetPassword(userToResetPassword.id, newPassword);

    if (result.success) {
      toast({
        title: "Password Reset",
        description: `Password for ${userToResetPassword.name} has been reset successfully.`,
      });
      setUserToResetPassword(null);
      setNewPassword("");
    } else {
      toast({
        title: "Error",
        description: result.error || "Failed to reset password.",
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-2xl">
            Registered Users
          </CardTitle>
          <CardDescription>
            Manage user accounts and view registration details
          </CardDescription>
        </CardHeader>
        <CardContent>
          {users.length === 0 ? (
            <div className="text-center py-12">
              <UserIcon className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">
                No Users Registered
              </h3>
              <p className="text-sm text-muted-foreground mt-2">
                Users will appear here once they sign up.
              </p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Registered</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        {user.isAdmin ? (
                          <Badge variant="default" className="gap-1">
                            <Shield className="h-3 w-3" />
                            Admin
                          </Badge>
                        ) : (
                          <Badge variant="secondary">User</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(user.createdAt)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggleAdmin(user)}
                            title={
                              user.isAdmin
                                ? "Remove admin privileges"
                                : "Grant admin privileges"
                            }
                          >
                            {user.isAdmin ? (
                              <ShieldOff className="h-4 w-4 text-orange-500" />
                            ) : (
                              <ShieldCheck className="h-4 w-4 text-green-500" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleResetPassword(user)}
                            title="Reset password"
                          >
                            <KeyRound className="h-4 w-4 text-blue-500" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(user)}
                            disabled={user.isAdmin}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Badge variant="secondary">Total: {users.length}</Badge>
              <Badge variant="default">
                Admins: {users.filter((u) => u.isAdmin).length}
              </Badge>
              <Badge variant="outline">
                Regular: {users.filter((u) => !u.isAdmin).length}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <AlertDialog
        open={!!userToDelete}
        onOpenChange={() => setUserToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User Account?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{" "}
              <strong>{userToDelete?.name}</strong>&apos;s account? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={!!userToResetPassword}
        onOpenChange={() => {
          setUserToResetPassword(null);
          setNewPassword("");
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset User Password</AlertDialogTitle>
            <AlertDialogDescription>
              Enter a new password for{" "}
              <strong>{userToResetPassword?.name}</strong>. The password must be
              at least 6 characters long.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-2 py-4">
            <Label htmlFor="new-password">New Password</Label>
            <Input
              id="new-password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password (min 6 characters)"
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setUserToResetPassword(null);
                setNewPassword("");
              }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmResetPassword}
              disabled={!newPassword || newPassword.length < 6}
            >
              Reset Password
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
