'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, Play, Square, Lock, Unlock } from 'lucide-react';

interface CTFState {
  isActive: boolean;
  leaderboardLocked: boolean;
}

interface Team {
  id: string;
  teamName: string;
  isAdmin: boolean;
  isActive: boolean;
  createdAt: string;
}

export default function CTFControl() {
  const [ctfState, setCTFState] = useState<CTFState>({ isActive: true, leaderboardLocked: false });
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCTFState();
    fetchTeams();
  }, []);

  const fetchCTFState = async () => {
    try {
      const response = await fetch('/api/ctf-control');
      if (response.ok) {
        const data = await response.json();
        setCTFState(data);
      }
    } catch (err) {
      // Failed to fetch CTF state
    }
  };

  const fetchTeams = async () => {
    try {
      const response = await fetch('/api/teams');
      if (response.ok) {
        const data = await response.json();
        setTeams(data);
      }
    } catch (err) {
      // Failed to fetch teams
    }
  };

  const handleCTFControl = async (action: string, value: any) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/ctf-control', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, value }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update CTF state');
      }

      // Refresh state
      await fetchCTFState();
      await fetchTeams();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const stopCTF = () => {
    const deactivateTeams = confirm('Do you want to deactivate all teams when stopping the CTF?\n\nClick OK to deactivate teams, or Cancel to just stop the CTF and lock the leaderboard.');
    if (confirm(`Are you sure you want to stop the CTF? This will lock the leaderboard${deactivateTeams ? ' and deactivate all non-admin teams' : ''}.`)) {
      handleCTFControl('setCTFActive', { active: false, deactivateTeams });
    }
  };

  const startCTF = () => {
    handleCTFControl('setCTFActive', { active: true, deactivateTeams: false });
  };

  const toggleLeaderboardLock = () => {
    handleCTFControl('setLeaderboardLocked', !ctfState.leaderboardLocked);
  };

  const toggleTeamActive = (teamId: string, active: boolean) => {
    handleCTFControl('setTeamActive', { teamId, active });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            CTF Control Panel
          </CardTitle>
          <CardDescription>
            Control the CTF state and manage team access
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-base font-medium">CTF Status</Label>
              <p className="text-sm text-muted-foreground">
                {ctfState.isActive ? 'CTF is currently active' : 'CTF is currently stopped'}
              </p>
            </div>
            <div className="flex gap-2">
              {ctfState.isActive ? (
                <Button 
                  onClick={stopCTF} 
                  variant="destructive" 
                  disabled={loading}
                  className="flex items-center gap-2"
                >
                  <Square className="h-4 w-4" />
                  Stop CTF
                </Button>
              ) : (
                <Button 
                  onClick={startCTF} 
                  disabled={loading}
                  className="flex items-center gap-2"
                >
                  <Play className="h-4 w-4" />
                  Start CTF
                </Button>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-base font-medium">Leaderboard</Label>
              <p className="text-sm text-muted-foreground">
                {ctfState.leaderboardLocked ? 'Leaderboard is locked' : 'Leaderboard accepts new entries'}
              </p>
            </div>
            <Button
              onClick={toggleLeaderboardLock}
              variant={ctfState.leaderboardLocked ? "destructive" : "outline"}
              disabled={loading}
              className="flex items-center gap-2"
            >
              {ctfState.leaderboardLocked ? (
                <>
                  <Unlock className="h-4 w-4" />
                  Unlock
                </>
              ) : (
                <>
                  <Lock className="h-4 w-4" />
                  Lock
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Team Management</CardTitle>
          <CardDescription>
            Activate or deactivate individual teams
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {teams.filter(team => !team.isAdmin).map((team) => (
              <div key={team.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">{team.teamName}</p>
                  <p className="text-sm text-muted-foreground">
                    Status: {team.isActive ? 'Active' : 'Inactive'}
                  </p>
                </div>
                <Switch
                  checked={team.isActive}
                  onCheckedChange={(checked) => toggleTeamActive(team.id, checked)}
                  disabled={loading}
                />
              </div>
            ))}
            {teams.filter(team => !team.isAdmin).length === 0 && (
              <p className="text-muted-foreground text-center py-4">No teams found</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
