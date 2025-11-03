// PostgreSQL database adapter
import { Pool } from 'pg';
import { Team, LeaderboardEntry } from './types';

// Create connection pool
const pool = new Pool({
  connectionString: process.env.PRISMA_DATABASE_URL || 
                   process.env.POSTGRES_URL || 
                   process.env.POSTGRES_PRISMA_URL ||
                   process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

// Check if we have a database connection
if (!process.env.PRISMA_DATABASE_URL && 
    !process.env.POSTGRES_URL && 
    !process.env.POSTGRES_PRISMA_URL &&
    !process.env.DATABASE_URL) {
  throw new Error(
    'PostgreSQL connection string is required. ' +
    'Please set PRISMA_DATABASE_URL, POSTGRES_URL, POSTGRES_PRISMA_URL, or DATABASE_URL environment variable.'
  );
}

// Initialize tables
export async function initializeTables() {
  const client = await pool.connect();
  try {
    // Create teams table
    await client.query(`
      CREATE TABLE IF NOT EXISTS teams (
        id TEXT PRIMARY KEY,
        team_name TEXT UNIQUE NOT NULL,
        is_admin BOOLEAN NOT NULL DEFAULT FALSE,
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        created_at TEXT NOT NULL
      )
    `);

    // Create leaderboard table
    await client.query(`
      CREATE TABLE IF NOT EXISTS leaderboard (
        id SERIAL PRIMARY KEY,
        name TEXT UNIQUE NOT NULL,
        score INTEGER NOT NULL DEFAULT 0,
        created_at BIGINT NOT NULL
      )
    `);

    // Create CTF state table
    await client.query(`
      CREATE TABLE IF NOT EXISTS ctf_state (
        id INTEGER PRIMARY KEY DEFAULT 1,
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        leaderboard_locked BOOLEAN NOT NULL DEFAULT FALSE,
        updated_at BIGINT NOT NULL,
        CONSTRAINT single_row CHECK (id = 1)
      )
    `);

    // Insert default CTF state if not exists
    await client.query(`
      INSERT INTO ctf_state (id, is_active, leaderboard_locked, updated_at)
      VALUES (1, TRUE, FALSE, $1)
      ON CONFLICT (id) DO NOTHING
    `, [Date.now()]);

    // Insert default admin team if not exists
    await client.query(`
      INSERT INTO teams (id, team_name, is_admin, is_active, created_at)
      VALUES ('team_1761147651991', 'L7ajroot', TRUE, TRUE, $1)
      ON CONFLICT (id) DO NOTHING
    `, [new Date().toISOString()]);

  } catch (error) {
    throw error;
  } finally {
    client.release();
  }
}

// Team operations
export const teamQueries = {
  getAll: async (): Promise<Team[]> => {
    const client = await pool.connect();
    try {
      const { rows } = await client.query('SELECT * FROM teams ORDER BY created_at DESC');
      return rows.map((row: any) => ({
        id: row.id,
        name: row.team_name,
        teamName: row.team_name,
        isAdmin: Boolean(row.is_admin),
        isActive: Boolean(row.is_active),
        createdAt: row.created_at
      }));
    } finally {
      client.release();
    }
  },

  getById: async (id: string): Promise<Team | null> => {
    const client = await pool.connect();
    try {
      const { rows } = await client.query('SELECT * FROM teams WHERE id = $1', [id]);
      if (rows.length === 0) return null;
      
      const row = rows[0];
      return {
        id: row.id,
        name: row.team_name,
        teamName: row.team_name,
        isAdmin: Boolean(row.is_admin),
        isActive: Boolean(row.is_active),
        createdAt: row.created_at
      };
    } finally {
      client.release();
    }
  },

  getByName: async (teamName: string): Promise<Team | null> => {
    const client = await pool.connect();
    try {
      const { rows } = await client.query('SELECT * FROM teams WHERE team_name ILIKE $1', [teamName]);
      if (rows.length === 0) return null;
      
      const row = rows[0];
      return {
        id: row.id,
        name: row.team_name,
        teamName: row.team_name,
        isAdmin: Boolean(row.is_admin),
        isActive: Boolean(row.is_active),
        createdAt: row.created_at
      };
    } finally {
      client.release();
    }
  },

  create: async (team: Team): Promise<Team> => {
    const client = await pool.connect();
    try {
      await client.query(`
        INSERT INTO teams (id, team_name, is_admin, is_active, created_at)
        VALUES ($1, $2, $3, $4, $5)
      `, [team.id, team.teamName, team.isAdmin, team.isActive, team.createdAt]);
      return team;
    } catch (error: any) {
      if (error.code === '23505') { // Unique violation
        throw new Error(`Team name '${team.teamName}' already exists`);
      }
      throw error;
    } finally {
      client.release();
    }
  },

  update: async (id: string, updates: Partial<Team>): Promise<Team | null> => {
    const client = await pool.connect();
    try {
      const setParts: string[] = [];
      const values: any[] = [];

      if (updates.teamName !== undefined) {
        setParts.push(`team_name = $${setParts.length + 1}`);
        values.push(updates.teamName);
      }
      if (updates.isAdmin !== undefined) {
        setParts.push(`is_admin = $${setParts.length + 1}`);
        values.push(updates.isAdmin);
      }
      if (updates.isActive !== undefined) {
        setParts.push(`is_active = $${setParts.length + 1}`);
        values.push(updates.isActive);
      }

      if (setParts.length === 0) return null;

      values.push(id);
      const query = `UPDATE teams SET ${setParts.join(', ')} WHERE id = $${values.length} RETURNING *`;
      
      const { rows } = await client.query(query, values);
      if (rows.length === 0) return null;
      
      const row = rows[0];
      return {
        id: row.id,
        name: row.team_name,
        teamName: row.team_name,
        isAdmin: Boolean(row.is_admin),
        isActive: Boolean(row.is_active),
        createdAt: row.created_at
      };
    } catch (error: any) {
      if (error.code === '23505') { // Unique violation
        throw new Error(`Team name '${updates.teamName}' already exists`);
      }
      throw error;
    } finally {
      client.release();
    }
  },

  delete: async (id: string): Promise<boolean> => {
    const client = await pool.connect();
    try {
      const { rowCount } = await client.query('DELETE FROM teams WHERE id = $1', [id]);
      return (rowCount ?? 0) > 0;
    } finally {
      client.release();
    }
  },

  isActive: async (teamName: string): Promise<boolean> => {
    const client = await pool.connect();
    try {
      const { rows } = await client.query('SELECT is_active FROM teams WHERE team_name ILIKE $1', [teamName]);
      return rows.length > 0 ? Boolean(rows[0].is_active) : false;
    } finally {
      client.release();
    }
  },

  setActive: async (id: string, active: boolean): Promise<Team | null> => {
    return teamQueries.update(id, { isActive: active });
  },

  getActive: async (): Promise<Team[]> => {
    const client = await pool.connect();
    try {
      const { rows } = await client.query('SELECT * FROM teams WHERE is_active = TRUE ORDER BY created_at DESC');
      return rows.map((row: any) => ({
        id: row.id,
        name: row.team_name,
        teamName: row.team_name,
        isAdmin: Boolean(row.is_admin),
        isActive: Boolean(row.is_active),
        createdAt: row.created_at
      }));
    } finally {
      client.release();
    }
  },

  count: async (): Promise<number> => {
    const client = await pool.connect();
    try {
      const { rows } = await client.query('SELECT COUNT(*) as count FROM teams');
      return parseInt(rows[0].count);
    } finally {
      client.release();
    }
  },

  getAdmins: async (): Promise<Team[]> => {
    const client = await pool.connect();
    try {
      const { rows } = await client.query('SELECT * FROM teams WHERE is_admin = TRUE ORDER BY created_at DESC');
      return rows.map((row: any) => ({
        id: row.id,
        name: row.team_name,
        teamName: row.team_name,
        isAdmin: Boolean(row.is_admin),
        isActive: Boolean(row.is_active),
        createdAt: row.created_at
      }));
    } finally {
      client.release();
    }
  }
};

// Leaderboard operations
export const leaderboardQueries = {
  getAll: async (): Promise<LeaderboardEntry[]> => {
    const client = await pool.connect();
    try {
      const { rows } = await client.query('SELECT * FROM leaderboard ORDER BY score DESC, created_at ASC');
      return rows.map((row: any) => ({
        name: row.name,
        score: row.score,
        createdAt: row.created_at
      }));
    } finally {
      client.release();
    }
  },

  getByName: async (name: string): Promise<LeaderboardEntry | null> => {
    const client = await pool.connect();
    try {
      const { rows } = await client.query('SELECT * FROM leaderboard WHERE name = $1', [name]);
      if (rows.length === 0) return null;
      
      const row = rows[0];
      return {
        name: row.name,
        score: row.score,
        createdAt: row.created_at
      };
    } finally {
      client.release();
    }
  },

  addOrUpdate: async (entry: LeaderboardEntry): Promise<LeaderboardEntry> => {
    const client = await pool.connect();
    try {
      await client.query(`
        INSERT INTO leaderboard (name, score, created_at)
        VALUES ($1, $2, $3)
        ON CONFLICT (name) DO UPDATE SET
          score = EXCLUDED.score,
          created_at = EXCLUDED.created_at
      `, [entry.name, entry.score, entry.createdAt]);
      return entry;
    } finally {
      client.release();
    }
  },

  updateScore: async (name: string, score: number): Promise<LeaderboardEntry | null> => {
    const client = await pool.connect();
    try {
      const { rowCount } = await client.query(`
        UPDATE leaderboard 
        SET score = $1, created_at = $2
        WHERE name = $3
      `, [score, Date.now(), name]);
      
      if ((rowCount ?? 0) === 0) return null;
      return leaderboardQueries.getByName(name);
    } finally {
      client.release();
    }
  },

  incrementScore: async (name: string, increment: number = 1): Promise<LeaderboardEntry | null> => {
    const client = await pool.connect();
    try {
      await client.query(`
        INSERT INTO leaderboard (name, score, created_at)
        VALUES ($1, $2, $3)
        ON CONFLICT (name) DO UPDATE SET
          score = leaderboard.score + EXCLUDED.score,
          created_at = EXCLUDED.created_at
      `, [name, increment, Date.now()]);
      return leaderboardQueries.getByName(name);
    } finally {
      client.release();
    }
  },

  clear: async (): Promise<void> => {
    const client = await pool.connect();
    try {
      await client.query('DELETE FROM leaderboard');
    } finally {
      client.release();
    }
  },

  count: async (): Promise<number> => {
    const client = await pool.connect();
    try {
      const { rows } = await client.query('SELECT COUNT(*) as count FROM leaderboard');
      return parseInt(rows[0].count);
    } finally {
      client.release();
    }
  }
};

// CTF state operations
export const ctfStateQueries = {
  get: async (): Promise<{ isActive: boolean; leaderboardLocked: boolean }> => {
    const client = await pool.connect();
    try {
      const { rows } = await client.query('SELECT * FROM ctf_state WHERE id = 1');
      const row = rows[0];
      return {
        isActive: Boolean(row?.is_active ?? true),
        leaderboardLocked: Boolean(row?.leaderboard_locked ?? false)
      };
    } finally {
      client.release();
    }
  },

  setActive: async (active: boolean, deactivateTeams: boolean = false): Promise<{ isActive: boolean; leaderboardLocked: boolean }> => {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      if (!active) {
        // When stopping CTF, always lock leaderboard
        await client.query(`
          UPDATE ctf_state 
          SET is_active = FALSE, leaderboard_locked = TRUE, updated_at = $1
          WHERE id = 1
        `, [Date.now()]);
        
        // Optionally deactivate teams
        if (deactivateTeams) {
          await client.query('UPDATE teams SET is_active = FALSE WHERE is_admin = FALSE');
        }
      } else {
        // When starting CTF, unlock leaderboard and reactivate all teams
        await client.query(`
          UPDATE ctf_state 
          SET is_active = TRUE, leaderboard_locked = FALSE, updated_at = $1
          WHERE id = 1
        `, [Date.now()]);
        await client.query('UPDATE teams SET is_active = TRUE');
      }
      
      await client.query('COMMIT');
      return ctfStateQueries.get();
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  },

  setLeaderboardLocked: async (locked: boolean): Promise<{ isActive: boolean; leaderboardLocked: boolean }> => {
    const client = await pool.connect();
    try {
      await client.query(`
        UPDATE ctf_state 
        SET leaderboard_locked = $1, updated_at = $2
        WHERE id = 1
      `, [locked, Date.now()]);
      return ctfStateQueries.get();
    } finally {
      client.release();
    }
  }
};

// Utility functions
export const dbUtils = {
  resetAll: async (): Promise<void> => {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      await client.query('DELETE FROM teams');
      await client.query('DELETE FROM leaderboard');
      
      await client.query(`
        UPDATE ctf_state 
        SET is_active = TRUE, leaderboard_locked = FALSE, updated_at = $1
        WHERE id = 1
      `, [Date.now()]);
      
      // Re-insert admin team
      await client.query(`
        INSERT INTO teams (id, team_name, is_admin, is_active, created_at)
        VALUES ('team_1761147651991', 'L7ajroot', TRUE, TRUE, $1)
      `, [new Date().toISOString()]);
      
      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  },

  getStats: async (): Promise<{ teamCount: number; leaderboardCount: number; ctfState: any }> => {
    const teamCount = await teamQueries.count();
    const leaderboardCount = await leaderboardQueries.count();
    const ctfState = await ctfStateQueries.get();
    
    return {
      teamCount,
      leaderboardCount,
      ctfState
    };
  },

  close: async (): Promise<void> => {
    await pool.end();
  }
};

// Initialize tables on startup
initializeTables().catch(() => {});

export default {
  teamQueries,
  leaderboardQueries,
  ctfStateQueries,
  dbUtils,
  initializeTables
};