
"use client";

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { Team } from '@/lib/types';

export function useSession() {
    const [team, setTeam] = useState<Team | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    const fetchSession = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/session');
            const data = await res.json();
            if (data.isLoggedIn) {
                setTeam({ 
                    id: data.id || `team_${Date.now()}`,
                    name: data.teamName, 
                    teamName: data.teamName,
                    isAdmin: data.isAdmin,
                    isActive: true,
                    createdAt: new Date().toISOString()
                });
            } else {
                setTeam(null);
            }
        } catch (error) {
            setTeam(null);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchSession();
    }, [fetchSession]);

    const logout = async () => {
        try {
            await fetch('/api/logout');
            setTeam(null);
            router.push('/login');
        } catch (error) {
            // Failed to logout
        }
    };

    return { team, loading, setTeam, logout, refetch: fetchSession };
}
