import { NextResponse } from "next/server";
import { storage } from '@/lib/storage';

export async function GET() {
  try {
    const leaderboard = await storage.getLeaderboard();
    const teams = await storage.getTeams();

    const adminTeamNames = new Set(
      teams
        .filter((team) => team.isAdmin)
        .map((team) => team.teamName.toLowerCase()),
    );

    const filteredLeaderboard = leaderboard.filter(
      (entry) => !adminTeamNames.has(entry.name.toLowerCase()),
    );

    return NextResponse.json(filteredLeaderboard);
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to retrieve leaderboard data" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const { name, score } = await request.json();

    if (!name || typeof score !== "number") {
      return NextResponse.json(
        { message: "Name and score are required" },
        { status: 400 },
      );
    }

    // Check if leaderboard is locked
    const ctfState = await storage.getCTFState();
    if (ctfState.leaderboardLocked) {
      return NextResponse.json(
        { message: "Leaderboard is locked. No new entries allowed." },
        { status: 403 },
      );
    }

    const newEntry = {
      name,
      score,
      createdAt: Date.now(),
    };

    await storage.addLeaderboardEntry(newEntry);
    return NextResponse.json(newEntry, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to add leaderboard entry" },
      { status: 500 },
    );
  }
}

export async function DELETE() {
  try {
    await storage.clearLeaderboard();
    return NextResponse.json({ message: "Leaderboard cleared" });
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to clear leaderboard" },
      { status: 500 },
    );
  }
}
