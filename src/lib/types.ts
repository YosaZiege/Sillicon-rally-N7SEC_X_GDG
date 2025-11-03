
export interface Challenge {
  id: string;
  title: string;
  description: string;
  instructions: string;
}

export interface ChallengeProps {
  onComplete: (score: number) => void;
  challenge: Challenge;
}

export interface PhishingEmail {
  id: number;
  sender: string;
  subject: string;
  snippet: string;
  body: string;
  type: 'scam' | 'safe';
  explanation: string;
  redFlags: string[];
}

export interface DecoderPuzzle {
  id: string;
  name: string;
  encrypted: string;
  solution: string;
  hint: string;
}

export interface ScamQuizQuestion {
  question: string;
  options: string[];
  answer: string;
  explanation: string;
}

export interface SocialEngineeringScenario {
    scenario: string;
    type: string;
    options: {
        text: string;
        isCorrect: boolean;
        explanation: string;
    }[];
}

export interface PrivacyPuzzleIssue {
    id: string;
    uiText: string;
    explanation: string;
    area: string;
}

export interface OsintChallenge {
    id: string;
    imageUrl: string;
    coords: { lat: number; lng: number };
    clues: string[];
    hint: string;
}

export interface CaptchaChallengeData {
    id: string;
    type: 'text' | 'grid' | 'slider';
    prompt: string;
    image: string;
    solution: string | number | number[];
    gridSize?: number;
    solutions?: number[];
    piece?: string;
}


export interface LeaderboardEntry {
  name: string;
  score: number;
  createdAt: number;
}

export interface GameState {
  status: 'not-started' | 'in-progress' | 'finished';
  activeChallengeId: string | null;
  scores: number[];
  challengesCompleted: boolean[];
  leaderboard: LeaderboardEntry[];
  totalScore: number;
  showConfetti: boolean;
}

export interface Team {
    id: string;
    name: string;
    teamName: string;
    isAdmin: boolean;
    isActive: boolean;
    createdAt: string;
}

export interface GameProgress {
    id?: number;
    teamName: string;
    challengeId: string;
    score: number;
    completed: boolean;
    completedAt?: number;
    createdAt: number;
    updatedAt: number;
}
