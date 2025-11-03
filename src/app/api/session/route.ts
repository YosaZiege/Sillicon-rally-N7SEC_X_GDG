
import { NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { sessionOptions, type SessionData } from '@/lib/session';
import { cookies } from 'next/headers';
import { storage } from '@/lib/storage';
export const dynamic = 'force-dynamic';
export async function GET() {
    try {
        const cookieStore = await cookies();
        const session = await getIronSession<SessionData>(cookieStore, sessionOptions);

        if (!session.teamName) {
            return NextResponse.json({
                isLoggedIn: false,
                teamName: null,
                isAdmin: false
            });
        }

        // Check if team is still active (for non-admin users)
        if (!session.isAdmin) {
            const isActive = await storage.isTeamActive(session.teamName);
            if (!isActive) {
                // Team has been deactivated, clear session
                session.isLoggedIn = false;
                session.teamName = '';
                session.isAdmin = false;
                await session.save();
                
                return NextResponse.json({
                    isLoggedIn: false,
                    teamName: null,
                    isAdmin: false,
                    message: 'Team has been deactivated'
                });
            }
        }

        return NextResponse.json({
            isLoggedIn: true,
            teamName: session.teamName,
            isAdmin: session.isAdmin
        });
    } catch (error) {
        return NextResponse.json({ message: 'An internal server error occurred' }, { status: 500 });
    }
}
