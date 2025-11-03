
import { NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { sessionOptions, type SessionData } from '@/lib/session';
import { cookies } from 'next/headers';
export const dynamic = 'force-dynamic';
export async function GET() {
    try {
        const cookieStore = await cookies();
        const session = await getIronSession<SessionData>(cookieStore, sessionOptions);
        session.destroy();
        return NextResponse.json({ isLoggedIn: false, teamName: null, isAdmin: false });
    } catch (error) {
        return NextResponse.json({ message: 'An internal server error occurred' }, { status: 500 });
    }
}
