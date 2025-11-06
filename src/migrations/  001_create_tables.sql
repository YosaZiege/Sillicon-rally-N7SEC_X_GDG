-- teams table
CREATE TABLE IF NOT EXISTS teams (
  id TEXT PRIMARY KEY,
  team_name TEXT UNIQUE NOT NULL,
  is_admin BOOLEAN NOT NULL DEFAULT FALSE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TEXT NOT NULL
);

-- leaderboard table
CREATE TABLE IF NOT EXISTS leaderboard (
  id SERIAL PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  score INTEGER NOT NULL DEFAULT 0,
  created_at BIGINT NOT NULL
);

-- ctf_state table
CREATE TABLE IF NOT EXISTS ctf_state (
  id INTEGER PRIMARY KEY DEFAULT 1,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  leaderboard_locked BOOLEAN NOT NULL DEFAULT FALSE,
  updated_at BIGINT NOT NULL,
  CONSTRAINT single_row CHECK (id = 1)
);

-- game_progress table
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
);

