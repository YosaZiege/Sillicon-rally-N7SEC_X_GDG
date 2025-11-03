
import { NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { sessionOptions, type SessionData } from '@/lib/session';
import { cookies } from 'next/headers';
import { storage } from '@/lib/storage';

export async function POST(request: Request) {
    try {
        const { teamName } = await request.json();

        if (!teamName) {
            return NextResponse.json({ message: 'Team name is required' }, { status: 400 });
        }

        const cookieStore = await cookies();
        const session = await getIronSession<SessionData>(cookieStore, sessionOptions);
        
        const isAdmin = teamName.toLowerCase() === 'l7ajroot';
        let team = null;

        if (!isAdmin) {
            team = await storage.findTeam((t: any) => t.teamName.toLowerCase() === teamName.toLowerCase());
            if (!team) {
                return NextResponse.json({ message: 'This team does not exist. Please contact an admin.' }, { status: 403 });
            }
            if (!team.isActive) {
                return NextResponse.json({ message: 'Your team has been deactivated. Please contact an admin.' }, { status: 403 });
            }
        } else {
            // For admin user, get or create the admin team
            team = await storage.findTeam((t: any) => t.teamName.toLowerCase() === 'l7ajroot');
            if (!team) {
                // Create admin team if it doesn't exist
                team = {
                    id: 'team_1761147651991',
                    name: 'L7ajroot',
                    teamName: 'L7ajroot',
                    isAdmin: true,
                    isActive: true,
                    createdAt: new Date().toISOString()
                };
            }
        }

        // Save team info in session
        session.isLoggedIn = true;
        session.teamName = teamName;
        session.isAdmin = isAdmin;
        await session.save();

        return NextResponse.json({
            isLoggedIn: true,
            id: team.id,
            teamName: session.teamName,
            name: team.name,
            isAdmin: session.isAdmin,
            isActive: team.isActive,
            createdAt: team.createdAt
        });

    } catch (error) {
        return NextResponse.json({ message: 'An internal server error occurred' }, { status: 500 });
    }
}
