"use client";

import { useState, useEffect } from "react";
import Leaderboard from "@/components/Leaderboard";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Pencil, Trash2, ShieldCheck, RotateCcw, UserX } from "lucide-react";
import CTFControl from "@/components/admin/CTFControl";

interface Team {
  id: string;
  teamName: string;
  isAdmin: boolean;
  createdAt: string;
}

export default function AdminDashboard() {
  const [newTeamName, setNewTeamName] = useState("");
  const [teams, setTeams] = useState<Team[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [updatedTeamName, setUpdatedTeamName] = useState("");

  const fetchTeams = async () => {
    try {
      const response = await fetch("/api/teams");
      if (!response.ok) throw new Error("Failed to fetch teams");
      const data = await response.json();
      setTeams(data);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not load the list of teams.",
      });
    }
  };

  useEffect(() => {
    fetchTeams();
  }, []);
  const handleResetLeaderboard = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to reset the leaderboard? This will clear all scores, progress, and solved challenges from the database.",
    );
    if (!confirmed) return;

    try {
      // Call the new admin reset API
      const response = await fetch("/api/admin/reset", { 
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reset_all" })
      });
      
      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.message || "Failed to reset leaderboard");
      }

      const result = await response.json();

      // Clear all localStorage items for team progress (backward compatibility)
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith("progress_")) {
          localStorage.removeItem(key);
        }
      });

      toast({
        title: "Complete Reset Successful",
        description: result.message || "All scores, progress, and solved challenges have been cleared.",
      });

      // Refresh teams list
      fetchTeams();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Could not reset leaderboard and progress.",
      });
    }
  };

  const handleDeleteAllNonAdminTeams = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to delete ALL non-admin teams? This will permanently remove all teams except admins and their progress data. This action cannot be undone.",
    );
    if (!confirmed) return;

    try {
      const response = await fetch("/api/admin/reset", { 
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete_non_admin_teams" })
      });
      
      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.message || "Failed to delete teams");
      }

      const result = await response.json();

      toast({
        title: "Teams Deleted Successfully",
        description: result.message || "All non-admin teams have been deleted.",
      });

      // Refresh teams list
      fetchTeams();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Could not delete teams.",
      });
    }
  };

  const handleCreateTeam = async () => {
    if (!newTeamName.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Team name cannot be empty.",
      });
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch("/api/teams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teamName: newTeamName }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to create team");
      }

      toast({
        title: "Success!",
        description: `Team "${newTeamName}" has been created.`,
      });
      setNewTeamName("");
      fetchTeams();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: error.message || "Could not create the team.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteTeam = async (teamId: string) => {
    try {
      const response = await fetch(`/api/teams`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: teamId }),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.message || "Failed to delete team");
      }

      toast({
        title: "Success!",
        description: "The team has been deleted.",
      });
      fetchTeams();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error deleting team",
        description: error.message,
      });
    }
  };

  const handleOpenEditDialog = (team: Team) => {
    setEditingTeam(team);
    setUpdatedTeamName(team.teamName);
    setIsEditDialogOpen(true);
  };

  const handleUpdateTeam = async () => {
    if (!editingTeam || !updatedTeamName.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Team name cannot be empty.",
      });
      return;
    }

    try {
      const response = await fetch(`/api/teams`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editingTeam.id, newName: updatedTeamName }),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.message || "Failed to update team name.");
      }

      toast({
        title: "Success!",
        description: `Team name updated to "${updatedTeamName}".`,
      });
      fetchTeams();
      setIsEditDialogOpen(false);
      setEditingTeam(null);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error updating team",
        description: error.message,
      });
    }
  };

  const handleToggleAdmin = async (team: Team) => {
    try {
      const response = await fetch(`/api/teams`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: team.id, isAdmin: !team.isAdmin }),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.message || "Failed to update admin status.");
      }

      toast({
        title: "Success!",
        description: `Admin status for "${team.teamName}" has been updated.`,
      });
      fetchTeams();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error updating admin status",
        description: error.message,
      });
    }
  };

  return (
    <div className="container mx-auto p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      
      {/* CTF Control Section */}
      <div className="mb-8">
        <CTFControl />
      </div>
      
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        <div className="lg:col-span-1 space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Create a New Team</CardTitle>
              <CardDescription>Add a new team to the arena.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                id="newTeamName"
                placeholder="Enter new team name"
                value={newTeamName}
                onChange={(e) => setNewTeamName(e.target.value)}
                disabled={isLoading}
              />
              <Button
                onClick={handleCreateTeam}
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? "Creating..." : "Create Team"}
              </Button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Live Leaderboard</CardTitle>
            </CardHeader>
            <CardContent>
              <Leaderboard />
              <div className="flex flex-col gap-2 mt-4">
                <Button
                  variant="destructive"
                  onClick={handleResetLeaderboard}
                  className="w-full"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Reset Leaderboard & Progress
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDeleteAllNonAdminTeams}
                  className="w-full"
                >
                  <UserX className="w-4 h-4 mr-2" />
                  Delete All Non-Admin Teams
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Manage Teams</CardTitle>
            <CardDescription>
              A list of all teams currently in the system.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Team Name</TableHead>
                  <TableHead>Date Created</TableHead>
                  <TableHead>Is Admin</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {teams.map((team) => (
                  <TableRow key={team.id}>
                    <TableCell className="font-medium">
                      {team.teamName}
                    </TableCell>
                    <TableCell>
                      {format(new Date(team.createdAt), "PPP")}
                    </TableCell>
                    <TableCell>{team.isAdmin ? "Yes" : "No"}</TableCell>
                    <TableCell className="text-right">
                      {team.teamName.toLowerCase() !== "l7ajroot" && (
                        <div className="flex gap-2 justify-end">
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                title={
                                  team.isAdmin ? "Remove Admin" : "Make Admin"
                                }
                              >
                                <ShieldCheck
                                  className={`h-4 w-4 ${team.isAdmin ? "text-primary" : "text-muted-foreground"}`}
                                />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Confirm Admin Status Change
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to{" "}
                                  {team.isAdmin
                                    ? "remove admin privileges from"
                                    : "grant admin privileges to"}{" "}
                                  "{team.teamName}"?
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleToggleAdmin(team)}
                                >
                                  Confirm
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>

                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenEditDialog(team)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>

                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Are you sure?
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  This action cannot be undone. This will
                                  permanently delete the team "{team.teamName}".
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteTeam(team.id)}
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                {teams.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="text-center text-muted-foreground"
                    >
                      No teams created yet.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Team Name</DialogTitle>
            <DialogDescription>
              Update the name for the team "{editingTeam?.teamName}".
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                New Name
              </Label>
              <Input
                id="name"
                value={updatedTeamName}
                onChange={(e) => setUpdatedTeamName(e.target.value)}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleUpdateTeam}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
