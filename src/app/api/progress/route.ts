import { NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { sessionOptions, type SessionData } from '@/lib/session';
import { cookies } from 'next/headers';
import { postgresStorage } from '@/lib/postgres-storage';

// Get team progress
export async function GET(request: Request) {
    try {
        const cookieStore = await cookies();
        const session = await getIronSession<SessionData>(cookieStore, sessionOptions);
        
        if (!session.isLoggedIn || !session.teamName) {
            return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
        }

        await postgresStorage.initializeTables();
        const progress = await postgresStorage.getTeamProgress(session.teamName);
        
        return NextResponse.json(progress);
    } catch (error) {
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}

// Save challenge progress
export async function POST(request: Request) {
    try {
        const cookieStore = await cookies();
        const session = await getIronSession<SessionData>(cookieStore, sessionOptions);
        
        if (!session.isLoggedIn || !session.teamName) {
            return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
        }

        const { challengeId, score, completed } = await request.json();

        if (!challengeId || score === undefined || completed === undefined) {
            return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
        }

        await postgresStorage.initializeTables();
        await postgresStorage.saveGameProgress({
            teamName: session.teamName,
            challengeId,
            score,
            completed,
            completedAt: completed ? Date.now() : undefined,
            createdAt: Date.now(),
            updatedAt: Date.now()
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}

// Reset team progress
export async function DELETE(request: Request) {
    try {
        const cookieStore = await cookies();
        const session = await getIronSession<SessionData>(cookieStore, sessionOptions);
        
        if (!session.isLoggedIn || !session.teamName) {
            return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
        }

        await postgresStorage.initializeTables();
        await postgresStorage.resetTeamProgress(session.teamName);

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}
