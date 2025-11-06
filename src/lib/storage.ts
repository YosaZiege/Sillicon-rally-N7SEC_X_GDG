// PostgreSQL-only storage system
import type { Team, LeaderboardEntry } from './types';

// Global storage instance
let dbInstance: any = null;
let storageInitialized = false;

// Initialize PostgreSQL storage
async function initializeStorage() {
  if (storageInitialized) return dbInstance;

  // Check for required Postgres connection string
  const postgresUrl = process.env.PRISMA_DATABASE_URL || 
                     process.env.POSTGRES_URL || 
                     process.env.POSTGRES_PRISMA_URL ||
                     process.env.DATABASE_URL;

  try {
    const { postgresStorage } = await import('./postgres-storage');
    
    // REMOVE THIS LINE - tables are initialized via init.sql
    // await postgresStorage.initializeTables();
    
    dbInstance = postgresStorage;
    storageInitialized = true;
    console.log('✅ Storage initialized successfully');
    return dbInstance;
  } catch (error: any) {
    console.error('❌ Failed to initialize storage:', error);
    throw error;
  }
}

// Get storage instance with proper initialization
async function getStorage() {
  if (!storageInitialized) {
   dbInstance = await initializeStorage();
  }
  return dbInstance;
}

// Helper function to mask password in connection string for logging
function maskPassword(connectionString: string): string {
  try {
    const url = new URL(connectionString);
    if (url.password) {
      url.password = '***';
    }
    return url.toString();
  } catch {
    return connectionString.replace(/:([^:@]+)@/, ':***@');
  }
}

// PostgreSQL database operations
export const storage = {
  // Team operations
  async getTeams(): Promise<Team[]> {
    const db = await getStorage();
    return await db.getTeams();
  },

  async addTeam(team: Team): Promise<Team> {
    const db = await getStorage();
    return await db.addTeam(team);
  },

  async updateTeam(id: string, updates: Partial<Team>): Promise<Team | null> {
    const db = await getStorage();
    return await db.updateTeam(id, updates);
  },

  async deleteTeam(id: string): Promise<boolean> {
    const db = await getStorage();
    return await db.deleteTeam(id);
  },

  async findTeam(predicate: (team: Team) => boolean): Promise<Team | undefined> {
    const db = await getStorage();
    return await db.findTeam(predicate);
  },

  async getTeamById(id: string): Promise<Team | null> {
    const db = await getStorage();
    const teams = await db.getTeams();
    return teams.find((team : Team) => team.id === id) || null;
  },

  async getTeamByName(teamName: string): Promise<Team | null> {
    const db = await getStorage();
    const teams = await db.getTeams();
    return teams.find((team : Team) => team.teamName.toLowerCase() === teamName.toLowerCase()) || null;
  },

  // Leaderboard operations
  async getLeaderboard(): Promise<LeaderboardEntry[]> {
    const db = await getStorage();
    return await db.getLeaderboard();
  },

  async addLeaderboardEntry(entry: LeaderboardEntry): Promise<LeaderboardEntry> {
    const db = await getStorage();
    return await db.addLeaderboardEntry(entry);
  },

  async clearLeaderboard(): Promise<void> {
    const db = await getStorage();
    return await db.clearLeaderboard();
  },

  // CTF state operations
  async getCTFState(): Promise<{ isActive: boolean; leaderboardLocked: boolean }> {
    const db = await getStorage();
    return await db.getCTFState();
  },

  async setCTFActive(active: boolean, deactivateTeams: boolean = false): Promise<{ isActive: boolean; leaderboardLocked: boolean }> {
    const db = await getStorage();
    return await db.setCTFActive(active, deactivateTeams);
  },

  async setLeaderboardLocked(locked: boolean): Promise<{ isActive: boolean; leaderboardLocked: boolean }> {
    const db = await getStorage();
    return await db.setLeaderboardLocked(locked);
  },

  // Team activation operations
  async getActiveTeams(): Promise<Team[]> {
    const db = await getStorage();
    return await db.getActiveTeams();
  },

  async isTeamActive(teamName: string): Promise<boolean> {
    const db = await getStorage();
    return await db.isTeamActive(teamName);
  },

  async setTeamActive(id: string, active: boolean): Promise<Team | null> {
    const db = await getStorage();
    return await db.setTeamActive(id, active);
  },

  // Utility operations
  async resetAll(): Promise<void> {
    const db = await getStorage();
    return await db.resetAll();
  },

  // Storage info
  async getStorageInfo(): Promise<{ type: string; initialized: boolean; url?: string }> {
    await getStorage();
    const postgresUrl = process.env.PRISMA_DATABASE_URL || 
                       process.env.POSTGRES_URL || 
                       process.env.POSTGRES_PRISMA_URL ||
                       process.env.DATABASE_URL;
    
    return {
      type: 'postgres',
      initialized: storageInitialized,
      url: postgresUrl ? maskPassword(postgresUrl) : undefined
    };
  },

  // Health check
  async healthCheck(): Promise<{ status: string; details: any }> {
    try {
      const db = await getStorage();
      const teams = await db.getTeams();
      const leaderboard = await db.getLeaderboard();
      const ctfState = await db.getCTFState();
      
      return {
        status: 'healthy',
        details: {
          teams: teams.length,
          leaderboardEntries: leaderboard.length,
          ctfState,
          storage: 'postgres'
        }
      };
    } catch (error: any) {
      return {
        status: 'unhealthy',
        details: {
          error: error.message,
          storage: 'unknown'
        }
      };
    }
  }
};

// Initialize storage on import
initializeStorage().catch((error) => {
  console.error('❌ Failed to initialize storage on startup:', error);
});

export default storage;
