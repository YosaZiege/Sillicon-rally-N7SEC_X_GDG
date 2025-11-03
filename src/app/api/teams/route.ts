
import { NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { sessionOptions, type SessionData } from '@/lib/session';
import { cookies } from 'next/headers';
import { storage } from '@/lib/storage';

// GET handler to retrieve all teams
export async function GET() {
    try {
        const teams = await storage.getTeams();
        return NextResponse.json(teams);
    } catch (error) {
        return NextResponse.json({ message: 'An internal server error occurred' }, { status: 500 });
    }
}

// POST handler to create a new team
export async function POST(request: Request) {
    const cookieStore = await cookies();
    const session = await getIronSession<SessionData>(cookieStore, sessionOptions);

    if (!session.isLoggedIn || !session.isAdmin) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
    }

    try {
        const { teamName } = await request.json();

        if (!teamName) {
            return NextResponse.json({ message: 'Team name is required' }, { status: 400 });
        }
        
        const existingTeam = await storage.findTeam((t: any) => t.teamName.toLowerCase() === teamName.toLowerCase());
        if (existingTeam) {
            return NextResponse.json({ message: 'A team with this name already exists' }, { status: 409 });
        }

        const newTeam = await storage.addTeam({
            id: `team_${Date.now()}`,
            name: teamName,
            teamName,
            isAdmin: teamName.toLowerCase() === 'l7ajroot', // Ensure l7ajroot is always admin
            isActive: true, // New teams are active by default
            createdAt: new Date().toISOString()
        });

        return NextResponse.json(newTeam, { status: 201 });

    } catch (error) {
        return NextResponse.json({ message: 'An internal server error occurred' }, { status: 500 });
    }
}

// PUT handler to update a team's name or admin status
export async function PUT(request: Request) {
    const cookieStore = await cookies();
    const session = await getIronSession<SessionData>(cookieStore, sessionOptions);

    if (!session.isLoggedIn || !session.isAdmin) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
    }

    try {
        const { id, newName, isAdmin } = await request.json();

        if (!id) {
            return NextResponse.json({ message: 'Team ID is required' }, { status: 400 });
        }
        
        const teamToUpdate = await storage.findTeam((t: any) => t.id === id);
        if (!teamToUpdate) {
            return NextResponse.json({ message: 'Team not found' }, { status: 404 });
        }

        // Prevent l7ajroot admin status from being revoked
        if (teamToUpdate.teamName.toLowerCase() === 'l7ajroot' && isAdmin === false) {
             return NextResponse.json({ message: 'Cannot revoke admin status from the root admin.' }, { status: 400 });
        }

        // Handle name change
        if (newName) {
            // Check if new name already exists (and is not the same team)
            const existingTeam = await storage.findTeam((t: any) => t.teamName.toLowerCase() === newName.toLowerCase() && t.id !== id);
            if (existingTeam) {
                return NextResponse.json({ message: 'A team with this name already exists' }, { status: 409 });
            }
        }

        // Update the team
        const updates: any = {};
        if (newName) updates.teamName = newName;
        if (typeof isAdmin === 'boolean') updates.isAdmin = isAdmin;
        
        const updatedTeam = await storage.updateTeam(id, updates);
        return NextResponse.json(updatedTeam);

    } catch (error) {
        return NextResponse.json({ message: 'An internal server error occurred' }, { status: 500 });
    }
}

// DELETE handler to delete a team
export async function DELETE(request: Request) {
    const cookieStore = await cookies();
    const session = await getIronSession<SessionData>(cookieStore, sessionOptions);

    if (!session.isLoggedIn || !session.isAdmin) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
    }

    try {
        const { id } = await request.json();

        if (!id) {
            return NextResponse.json({ message: 'Team ID is required' }, { status: 400 });
        }

        const teamToDelete = await storage.findTeam((t: any) => t.id === id);
        if (!teamToDelete) {
            return NextResponse.json({ message: 'Team not found' }, { status: 404 });
        }

        // Prevent deleting the root admin team
        if (teamToDelete.teamName.toLowerCase() === 'l7ajroot') {
            return NextResponse.json({ message: 'Cannot delete the root admin team' }, { status: 400 });
        }

        const success = await storage.deleteTeam(id);
        if (success) {
            return NextResponse.json({ message: 'Team deleted successfully' }, { status: 200 });
        } else {
            return NextResponse.json({ message: 'Failed to delete team' }, { status: 500 });
        }

    } catch (error) {
        return NextResponse.json({ message: 'An internal server error occurred' }, { status: 500 });
    }
}
