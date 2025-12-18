import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { UserX, Eye, Search, Ban, CheckCircle, Download, Mail } from "lucide-react";

interface User {
  id: string;
  email: string;
  fullName: string;
  currentPlan: string;
  createdAt: string;
  isAdmin: boolean;
  isActive: number;
  lastLoginAt: string | null;
}

interface UserDetails {
  user: User;
  cvCount: number;
  orderCount: number;
  totalSpent: number;
  lastOrderDate: string | null;
  cvList: Array<{ id: string; jobTitle: string; createdAt: string }>;
}

export default function UserManagementPage() {
  const { toast } = useToast();
  const [selectedPlan, setSelectedPlan] = useState<Record<string, string>>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [userDetailsDialog, setUserDetailsDialog] = useState<UserDetails | null>(null);
  const [emailDialog, setEmailDialog] = useState<User | null>(null);
  const [emailSubject, setEmailSubject] = useState("");
  const [emailMessage, setEmailMessage] = useState("");

  const { data: users = [], isLoading } = useQuery({
    queryKey: ["/api/admin/users"],
    queryFn: async () => {
      const response = await fetch("/api/admin/users");
      if (!response.ok) throw new Error("Failed to fetch users");
      return await response.json() as User[];
    },
  });

  const updatePlanMutation = useMutation({
    mutationFn: async ({ userId, newPlan }: { userId: string; newPlan: string }) => {
      const response = await fetch(`/api/admin/users/${userId}/plan`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: newPlan }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update plan");
      }
      return await response.json();
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      await queryClient.refetchQueries({ queryKey: ["/api/admin/users"] });
      toast({
        title: "Plan updated",
        description: "User plan has been updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const resetUsageMutation = useMutation({
    mutationFn: async (userId: string) => {
      const response = await fetch(`/api/admin/users/${userId}/reset-usage`, {
        method: "POST",
      });
      if (!response.ok) throw new Error("Failed to reset usage");
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Usage reset",
        description: "User usage counters have been reset",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Reset failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const toggleUserStatusMutation = useMutation({
    mutationFn: async ({ userId, isActive }: { userId: string; isActive: number }) => {
      const response = await fetch(`/api/admin/users/${userId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update user status");
      }
      return await response.json();
    },
    onSuccess: async (_, variables) => {
      await queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      await queryClient.refetchQueries({ queryKey: ["/api/admin/users"] });
      toast({
        title: variables.isActive === 1 ? "User enabled" : "User disabled",
        description: `User has been ${variables.isActive === 1 ? "enabled" : "disabled"} successfully`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Status update failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete user");
      }
      return await response.json();
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      await queryClient.refetchQueries({ queryKey: ["/api/admin/users"] });
      setUserToDelete(null);
      toast({
        title: "User deleted",
        description: "User and all associated data have been permanently deleted",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Delete failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const fetchUserDetails = async (userId: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/details`);
      if (!response.ok) throw new Error("Failed to fetch user details");
      const data = await response.json();
      setUserDetailsDialog(data);
    } catch (error) {
      toast({
        title: "Failed to load details",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    }
  };

  const exportToCSV = () => {
    const csvData = filteredUsers.map(user => ({
      Email: user.email,
      Name: user.fullName || '',
      Status: user.isActive === 1 ? 'Active' : 'Disabled',
      Plan: user.currentPlan,
      Role: user.isAdmin ? 'Admin' : 'User',
      'Last Login': user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : 'Never',
      'Joined Date': new Date(user.createdAt).toLocaleString(),
    }));

    const headers = Object.keys(csvData[0] || {});
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => 
        headers.map(header => {
          const value = row[header as keyof typeof row];
          return `"${value}"`;
        }).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `users_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Export successful",
      description: `Exported ${filteredUsers.length} users to CSV`,
    });
  };

  const sendEmailMutation = useMutation({
    mutationFn: async ({ userId, subject, message }: { userId: string; subject: string; message: string }) => {
      const response = await fetch(`/api/admin/users/${userId}/send-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, message }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to send email");
      }
      return await response.json();
    },
    onSuccess: async () => {
      setEmailDialog(null);
      setEmailSubject("");
      setEmailMessage("");
      toast({
        title: "Email sent",
        description: "Email has been sent successfully to the user",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to send email",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const filteredUsers = users.filter((user) => {
    const query = searchQuery.toLowerCase();
    return (
      user.email.toLowerCase().includes(query) ||
      (user.fullName && user.fullName.toLowerCase().includes(query)) ||
      user.currentPlan.toLowerCase().includes(query)
    );
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading users...</p>
        </div>
      </div>
    );
  }

  const handlePlanUpdate = (userId: string) => {
    const newPlan = selectedPlan[userId];
    if (newPlan) {
      updatePlanMutation.mutate({ userId, newPlan });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">User Management</h1>
        <p className="text-muted-foreground">
          Manage user accounts, plans, and usage
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <CardTitle>All Users</CardTitle>
              <CardDescription>
                {filteredUsers.length} of {users.length} user{users.length !== 1 ? 's' : ''}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search users by email, name, or plan..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Button
                variant="outline"
                onClick={exportToCSV}
                disabled={filteredUsers.length === 0}
              >
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Current Plan</TableHead>
                  <TableHead>Last Login</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground">
                      No users found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id} data-testid={`row-user-${user.id}`} className={user.isActive === 0 ? "opacity-50" : ""}>
                      <TableCell className="font-medium" data-testid={`email-${user.id}`}>
                        {user.email}
                        {user.isAdmin && (
                          <Badge variant="secondary" className="ml-2">Admin</Badge>
                        )}
                      </TableCell>
                      <TableCell data-testid={`name-${user.id}`}>{user.fullName || '-'}</TableCell>
                      <TableCell>
                        <Badge variant={user.isActive === 1 ? "default" : "destructive"}>
                          {user.isActive === 1 ? "Active" : "Disabled"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" data-testid={`plan-${user.id}`}>
                          {user.currentPlan}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {user.lastLoginAt 
                          ? new Date(user.lastLoginAt).toLocaleDateString()
                          : 'Never'}
                      </TableCell>
                      <TableCell data-testid={`joined-${user.id}`}>
                        {new Date(user.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2 flex-wrap">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => fetchUserDetails(user.id)}
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setEmailDialog(user)}
                            title="Send Email"
                          >
                            <Mail className="h-4 w-4" />
                          </Button>
                          <Select
                            value={selectedPlan[user.id] || user.currentPlan}
                            onValueChange={(value) => 
                              setSelectedPlan({ ...selectedPlan, [user.id]: value })
                            }
                          >
                            <SelectTrigger className="w-[110px]" data-testid={`select-plan-${user.id}`}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="basic">Basic</SelectItem>
                              <SelectItem value="pro">Pro</SelectItem>
                              <SelectItem value="premium">Premium</SelectItem>
                            </SelectContent>
                          </Select>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handlePlanUpdate(user.id)}
                            disabled={
                              !selectedPlan[user.id] || 
                              selectedPlan[user.id] === user.currentPlan ||
                              updatePlanMutation.isPending
                            }
                            data-testid={`button-update-plan-${user.id}`}
                          >
                            Update
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => resetUsageMutation.mutate(user.id)}
                            disabled={resetUsageMutation.isPending}
                            data-testid={`button-reset-usage-${user.id}`}
                            title="Reset Usage"
                          >
                            Reset
                          </Button>
                          <Button
                            size="sm"
                            variant={user.isActive === 1 ? "ghost" : "default"}
                            onClick={() => 
                              toggleUserStatusMutation.mutate({ 
                                userId: user.id, 
                                isActive: user.isActive === 1 ? 0 : 1 
                              })
                            }
                            disabled={user.isAdmin || toggleUserStatusMutation.isPending}
                            title={user.isActive === 1 ? "Disable User" : "Enable User"}
                          >
                            {user.isActive === 1 ? (
                              <Ban className="h-4 w-4" />
                            ) : (
                              <CheckCircle className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => setUserToDelete(user)}
                            disabled={user.isAdmin || deleteUserMutation.isPending}
                            title="Delete User"
                          >
                            <UserX className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!userToDelete} onOpenChange={() => setUserToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the user{" "}
              <span className="font-semibold">{userToDelete?.email}</span> and all associated data including:
              <ul className="list-disc list-inside mt-2">
                <li>All CVs and resumes</li>
                <li>All cover letters</li>
                <li>All orders and payment history</li>
                <li>All usage statistics</li>
              </ul>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => userToDelete && deleteUserMutation.mutate(userToDelete.id)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Permanently
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* User Details Dialog */}
      <Dialog open={!!userDetailsDialog} onOpenChange={() => setUserDetailsDialog(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
            <DialogDescription>
              Comprehensive information about {userDetailsDialog?.user.email}
            </DialogDescription>
          </DialogHeader>
          
          {userDetailsDialog && (
            <div className="space-y-4">
              {/* User Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Email</p>
                  <p className="text-sm">{userDetailsDialog.user.email}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Name</p>
                  <p className="text-sm">{userDetailsDialog.user.fullName || 'Not set'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Current Plan</p>
                  <Badge variant="outline">{userDetailsDialog.user.currentPlan}</Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Status</p>
                  <Badge variant={userDetailsDialog.user.isActive === 1 ? "default" : "destructive"}>
                    {userDetailsDialog.user.isActive === 1 ? "Active" : "Disabled"}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Joined</p>
                  <p className="text-sm">{new Date(userDetailsDialog.user.createdAt).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Last Login</p>
                  <p className="text-sm">
                    {userDetailsDialog.user.lastLoginAt 
                      ? new Date(userDetailsDialog.user.lastLoginAt).toLocaleString()
                      : 'Never'}
                  </p>
                </div>
              </div>

              {/* Statistics */}
              <div className="border-t pt-4">
                <h4 className="text-sm font-semibold mb-3">Statistics</h4>
                <div className="grid grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="pt-4">
                      <p className="text-2xl font-bold">{userDetailsDialog.cvCount}</p>
                      <p className="text-xs text-muted-foreground">Total CVs</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-4">
                      <p className="text-2xl font-bold">{userDetailsDialog.orderCount}</p>
                      <p className="text-xs text-muted-foreground">Total Orders</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-4">
                      <p className="text-2xl font-bold">GHS {userDetailsDialog.totalSpent.toFixed(2)}</p>
                      <p className="text-xs text-muted-foreground">Total Spent</p>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* CV List */}
              {userDetailsDialog.cvList.length > 0 && (
                <div className="border-t pt-4">
                  <h4 className="text-sm font-semibold mb-3">Recent CVs</h4>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {userDetailsDialog.cvList.map((cv) => (
                      <div key={cv.id} className="flex justify-between items-center p-2 border rounded">
                        <div>
                          <p className="text-sm font-medium">{cv.jobTitle}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(cv.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setUserDetailsDialog(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Send Email Dialog */}
      <Dialog open={!!emailDialog} onOpenChange={() => {
        setEmailDialog(null);
        setEmailSubject("");
        setEmailMessage("");
      }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Send Email to User</DialogTitle>
            <DialogDescription>
              Send a notification email to {emailDialog?.email}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Subject</label>
              <Input
                placeholder="Email subject..."
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Message</label>
              <Textarea
                placeholder="Email message..."
                value={emailMessage}
                onChange={(e) => setEmailMessage(e.target.value)}
                className="mt-1 min-h-[150px]"
              />
            </div>
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setEmailDialog(null);
                setEmailSubject("");
                setEmailMessage("");
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={() => emailDialog && sendEmailMutation.mutate({
                userId: emailDialog.id,
                subject: emailSubject,
                message: emailMessage,
              })}
              disabled={!emailSubject || !emailMessage || sendEmailMutation.isPending}
            >
              {sendEmailMutation.isPending ? "Sending..." : "Send Email"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
