
'use client';

import { useState, useEffect, Suspense } from 'react';
import { useAppState } from '@/components/providers/AppStateProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter, useSearchParams } from 'next/navigation';

function LoginForm() {
  const [teamName, setTeamName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { setTeam } = useAppState();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const message = searchParams.get('message');
    if (message) {
      setError(message);
    }
  }, [searchParams]);

  const handleLogin = async () => {
    if (!teamName.trim()) {
      setError('Team name cannot be empty.');
      return;
    }
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teamName }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to login');
      }

      
      // Set team data in context
      const teamData = {
        id: data.id || `team_${Date.now()}`,
        name: data.name || data.teamName, 
        teamName: data.teamName,
        isAdmin: data.isAdmin,
        isActive: data.isActive ?? true,
        createdAt: data.createdAt || new Date().toISOString()
      };
      
      setTeam(teamData);
      
      // Use replace instead of push to avoid back button issues
      // and redirect immediately without delay
      router.replace('/');

    } catch (e: any) {
      setError(e.message || 'Failed to login. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Team Login</CardTitle>
          <CardDescription>Enter your team name to start or continue the challenge.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Input
              id="teamName"
              placeholder="e.g., The Code Breakers"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              disabled={isLoading}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
            />
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button onClick={handleLogin} disabled={isLoading} className="w-full">
              {isLoading ? 'Logging in...' : 'Enter Arena'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function Login() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}
