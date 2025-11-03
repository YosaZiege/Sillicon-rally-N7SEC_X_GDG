import { NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { sessionOptions, type SessionData } from '@/lib/session';
import { cookies } from 'next/headers';
import { storage } from '@/lib/storage';

// GET handler to retrieve CTF state
export async function GET() {
    const cookieStore = await cookies();
    const session = await getIronSession<SessionData>(cookieStore, sessionOptions);

    if (!session.isLoggedIn || !session.isAdmin) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
    }

    try {
        const ctfState = await storage.getCTFState();
        return NextResponse.json(ctfState);
    } catch (error) {
        return NextResponse.json({ message: 'Failed to retrieve CTF state' }, { status: 500 });
    }
}

// POST handler to control CTF state
export async function POST(request: Request) {
    const cookieStore = await cookies();
    const session = await getIronSession<SessionData>(cookieStore, sessionOptions);

    if (!session.isLoggedIn || !session.isAdmin) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
    }

    try {
        const { action, value } = await request.json();

        if (!action) {
            return NextResponse.json({ message: 'Action is required' }, { status: 400 });
        }

        let result;
        switch (action) {
            case 'setCTFActive':
                const { active: ctfActive, deactivateTeams } = typeof value === 'boolean' ? { active: value, deactivateTeams: false } : value;
                result = await storage.setCTFActive(ctfActive, deactivateTeams);
                break;
            case 'setLeaderboardLocked':
                result = await storage.setLeaderboardLocked(value);
                break;
            case 'setTeamActive':
                const { teamId, active: teamActive } = value;
                result = await storage.setTeamActive(teamId, teamActive);
                if (!result) {
                    return NextResponse.json({ message: 'Team not found or cannot be modified' }, { status: 404 });
                }
                break;
            default:
                return NextResponse.json({ message: 'Invalid action' }, { status: 400 });
        }

        return NextResponse.json({ success: true, data: result });

    } catch (error) {
        return NextResponse.json({ message: 'An internal server error occurred' }, { status: 500 });
    }
}
