import { Pool } from 'pg';
import type { Team, LeaderboardEntry, GameProgress } from './types';

// Parse connection string into config object
function parseConnectionConfig() {
  const connectionString = process.env.PRISMA_DATABASE_URL || 
                          process.env.POSTGRES_URL || 
                          process.env.POSTGRES_PRISMA_URL ||
                          process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error('No PostgreSQL connection string found');
  }

  try {
    // Parse the connection string as URL
    const url = new URL(connectionString);
    
    const config = {
      host: url.hostname,
      port: parseInt(url.port) || 5432,
      database: url.pathname.replace(/^\//, '') || 'postgres', // Remove leading slash
      user: url.username,
      password: url.password,
      ssl: {
        rejectUnauthorized: false
      },
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    };

    
    return config;
  } catch (error) {
    
    // Fallback to connection string if parsing fails
    return {
      connectionString,
      ssl: { rejectUnauthorized: false },
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    };
  }
}

// Create connection pool
const poolConfig = parseConnectionConfig();
const pool = new Pool(poolConfig);

// Test connection on startup
pool.on('connect', () => {
  // Connected to PostgreSQL
});

pool.on('error', (err) => {
  // PostgreSQL pool error
});

// Postgres storage adapter
export const postgresStorage = {
  // Initialize tables if they don't exist
  async initializeTables() {
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

      // Create game progress table
      await client.query(`
        CREATE TABLE IF NOT EXISTS game_progress (
          id SERIAL PRIMARY KEY,
          team_name TEXT NOT NULL,
          challenge_id TEXT NOT NULL,
          score INTEGER NOT NULL DEFAULT 0,
          completed BOOLEAN NOT NULL DEFAULT FALSE,
          completed_at BIGINT,
          created_at BIGINT NOT NULL,
          updated_at BIGINT NOT NULL,
          UNIQUE(team_name, challenge_id)
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
  },

  // Teams operations
  async getTeams() {
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
      })) as Team[];
    } catch (error) {
      throw error;
    } finally {
      client.release();
    }
  },

  async addTeam(team: Team) {
    const client = await pool.connect();
    try {
      await client.query(`
        INSERT INTO teams (id, team_name, is_admin, is_active, created_at)
        VALUES ($1, $2, $3, $4, $5)
      `, [team.id, team.teamName, team.isAdmin, team.isActive, team.createdAt]);
      return team;
    } catch (error: any) {
      throw error;
    } finally {
      client.release();
    }
  },

  async updateTeam(id: string, updates: Partial<Team>) {
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
      } as Team;
    } catch (error: any) {
      throw error;
    } finally {
      client.release();
    }
  },

  async deleteTeam(id: string) {
    const client = await pool.connect();
    try {
      const { rowCount } = await client.query('DELETE FROM teams WHERE id = $1', [id]);
      return (rowCount ?? 0) > 0;
    } catch (error) {
      throw error;
    } finally {
      client.release();
    }
  },

  async findTeam(predicate: (team: Team) => boolean) {
    const teams = await this.getTeams();
    return teams.find(predicate);
  },

  // Leaderboard operations
  async getLeaderboard() {
    const client = await pool.connect();
    try {
      const { rows } = await client.query('SELECT * FROM leaderboard ORDER BY score DESC, created_at ASC');
      return rows.map((row: any) => ({
        name: row.name,
        score: row.score,
        createdAt: row.created_at
      })) as LeaderboardEntry[];
    } catch (error) {
      throw error;
    } finally {
      client.release();
    }
  },

  async addLeaderboardEntry(entry: LeaderboardEntry) {
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
    } catch (error) {
      throw error;
    } finally {
      client.release();
    }
  },

  async clearLeaderboard() {
    const client = await pool.connect();
    try {
      await client.query('DELETE FROM leaderboard');
    } catch (error) {
      throw error;
    } finally {
      client.release();
    }
  },

  // Reset all data
  async resetAll() {
    const client = await pool.connect();
    try {
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
    } catch (error) {
      throw error;
    } finally {
      client.release();
    }
  },

  // CTF Control operations
  async getCTFState() {
    const client = await pool.connect();
    try {
      const { rows } = await client.query('SELECT * FROM ctf_state WHERE id = 1');
      const row = rows[0];
      return {
        isActive: Boolean(row?.is_active ?? true),
        leaderboardLocked: Boolean(row?.leaderboard_locked ?? false)
      };
    } catch (error) {
      throw error;
    } finally {
      client.release();
    }
  },

  async setCTFActive(active: boolean, deactivateTeams: boolean = false) {
    const client = await pool.connect();
    try {
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
      
      return this.getCTFState();
    } catch (error) {
      throw error;
    } finally {
      client.release();
    }
  },

  async setLeaderboardLocked(locked: boolean) {
    const client = await pool.connect();
    try {
      await client.query(`
        UPDATE ctf_state 
        SET leaderboard_locked = $1, updated_at = $2
        WHERE id = 1
      `, [locked, Date.now()]);
      return this.getCTFState();
    } catch (error) {
      throw error;
    } finally {
      client.release();
    }
  },

  // Get active teams only
  async getActiveTeams() {
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
      })) as Team[];
    } catch (error) {
      throw error;
    } finally {
      client.release();
    }
  },

  // Check if team is active
  async isTeamActive(teamName: string) {
    const client = await pool.connect();
    try {
      const { rows } = await client.query('SELECT is_active FROM teams WHERE team_name ILIKE $1', [teamName]);
      return rows.length > 0 ? Boolean(rows[0].is_active) : false;
    } catch (error) {
      throw error;
    } finally {
      client.release();
    }
  },

  // Activate/deactivate specific team
  async setTeamActive(id: string, active: boolean) {
    const client = await pool.connect();
    try {
      const { rows } = await client.query(`
        UPDATE teams 
        SET is_active = $1
        WHERE id = $2 AND is_admin = FALSE
        RETURNING *
      `, [active, id]);
      
      if (rows.length === 0) return null;
      
      const row = rows[0];
      return {
        id: row.id,
        name: row.team_name,
        teamName: row.team_name,
        isAdmin: Boolean(row.is_admin),
        isActive: Boolean(row.is_active),
        createdAt: row.created_at
      } as Team;
    } catch (error) {
      throw error;
    } finally {
      client.release();
    }
  },

  // Game Progress operations
  async getTeamProgress(teamName: string) {
    const client = await pool.connect();
    try {
      const { rows } = await client.query(
        'SELECT * FROM game_progress WHERE team_name = $1 ORDER BY created_at ASC',
        [teamName]
      );
      return rows.map((row: any) => ({
        id: row.id,
        teamName: row.team_name,
        challengeId: row.challenge_id,
        score: row.score,
        completed: Boolean(row.completed),
        completedAt: row.completed_at,
        createdAt: row.created_at,
        updatedAt: row.updated_at
      })) as GameProgress[];
    } catch (error) {
      throw error;
    } finally {
      client.release();
    }
  },

  async saveGameProgress(progress: Omit<GameProgress, 'id'>) {
    const client = await pool.connect();
    try {
      const now = Date.now();
      await client.query(`
        INSERT INTO game_progress (team_name, challenge_id, score, completed, completed_at, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (team_name, challenge_id) DO UPDATE SET
          score = EXCLUDED.score,
          completed = EXCLUDED.completed,
          completed_at = EXCLUDED.completed_at,
          updated_at = EXCLUDED.updated_at
      `, [
        progress.teamName,
        progress.challengeId,
        progress.score,
        progress.completed,
        progress.completedAt || (progress.completed ? now : null),
        progress.createdAt || now,
        now
      ]);
    } catch (error) {
      throw error;
    } finally {
      client.release();
    }
  },

  async resetTeamProgress(teamName: string) {
    const client = await pool.connect();
    try {
      await client.query('DELETE FROM game_progress WHERE team_name = $1', [teamName]);
    } catch (error) {
      throw error;
    } finally {
      client.release();
    }
  },

  async getAllProgress() {
    const client = await pool.connect();
    try {
      const { rows } = await client.query('SELECT * FROM game_progress ORDER BY team_name, created_at ASC');
      return rows.map((row: any) => ({
        id: row.id,
        teamName: row.team_name,
        challengeId: row.challenge_id,
        score: row.score,
        completed: Boolean(row.completed),
        completedAt: row.completed_at,
        createdAt: row.created_at,
        updatedAt: row.updated_at
      })) as GameProgress[];
    } catch (error) {
      throw error;
    } finally {
      client.release();
    }
  },

  // Admin operations
  async clearAllProgress() {
    const client = await pool.connect();
    try {
      await client.query('DELETE FROM game_progress');
    } catch (error) {
      throw error;
    } finally {
      client.release();
    }
  },

  async deleteAllNonAdminTeams() {
    const client = await pool.connect();
    try {
      // First delete their progress
      await client.query(`
        DELETE FROM game_progress 
        WHERE team_name IN (
          SELECT team_name FROM teams WHERE is_admin = FALSE
        )
      `);
      
      // Then delete the teams
      const result = await client.query('DELETE FROM teams WHERE is_admin = FALSE');
      return result.rowCount || 0;
    } catch (error) {
      throw error;
    } finally {
      client.release();
    }
  }
};