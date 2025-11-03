import { NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { sessionOptions, type SessionData } from '@/lib/session';
import { cookies } from 'next/headers';
import { postgresStorage } from '@/lib/postgres-storage';

// Reset everything - leaderboard, team progress, and solved challenges
export async function POST(request: Request) {
    try {
        const cookieStore = await cookies();
        const session = await getIronSession<SessionData>(cookieStore, sessionOptions);
        
        // Check if user is admin
        if (!session.isLoggedIn || !session.isAdmin) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const { action } = await request.json();

        await postgresStorage.initializeTables();

        switch (action) {
            case 'reset_all':
                // Clear leaderboard
                await postgresStorage.clearLeaderboard();
                
                // Clear all game progress (this will reset all team scores and solved challenges)
                await postgresStorage.clearAllProgress();
                
                return NextResponse.json({ 
                    message: 'Successfully reset leaderboard and all team progress' 
                });

            case 'delete_non_admin_teams':
                // Delete all non-admin teams and their progress
                const deletedCount = await postgresStorage.deleteAllNonAdminTeams();
                
                return NextResponse.json({ 
                    message: `Successfully deleted ${deletedCount} non-admin teams and their progress` 
                });

            default:
                return NextResponse.json({ message: 'Invalid action' }, { status: 400 });
        }

    } catch (error) {
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}
