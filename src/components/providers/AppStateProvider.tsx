"use client";

import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  ReactNode,
  useCallback,
  useState,
} from "react";
import { CHALLENGE_DATA } from "@/lib/challenges-data";
import type { GameState, LeaderboardEntry, Team } from "@/lib/types";
import { useSession } from "@/hooks/use-session";

type Action =
  | { type: "SELECT_CHALLENGE"; payload: string }
  | {
      type: "COMPLETE_CHALLENGE";
      payload: { id: string; score: number; teamName: string };
    }
  | { type: "BACK_TO_MENU" }
  | { type: "ADD_LEADERBOARD_ENTRY"; payload: LeaderboardEntry }
  | { type: "SET_LEADERBOARD"; payload: LeaderboardEntry[] }
  | { type: "RESET_GAME" }
  | { type: "SET_TEAM_DATA"; payload: Partial<GameState> }
  | { type: "SET_TEAM"; payload: Team }
  | { type: "LOGOUT" };

const initialState: GameState = {
  status: "not-started",
  activeChallengeId: null,
  scores: Array(CHALLENGE_DATA.length).fill(0),
  challengesCompleted: Array(CHALLENGE_DATA.length).fill(false),
  leaderboard: [],
  totalScore: 0,
  showConfetti: false,
};

const AppStateContext = createContext<
  | {
      state: GameState;
      dispatch: React.Dispatch<Action>;
      selectChallenge: (id: string) => void;
      completeChallenge: (id: string, score: number) => void;
      backToMenu: () => void;
      addLeaderboardEntry: (entry: Omit<LeaderboardEntry, "createdAt">) => void;
      resetGame: () => void;
      setTeam: (team: Team) => void;
      logout: () => Promise<void>;
      team: Team | null;
      loading: boolean;
    }
  | undefined
>(undefined);

const updateAndSaveLeaderboard = (entry: LeaderboardEntry) => {
  fetch("/api/leaderboard", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: entry.name, score: entry.score }),
  }).catch((err) => {});
};

const gameStateReducer = (state: GameState, action: Action): GameState => {
  switch (action.type) {
    case "SET_TEAM_DATA":
      return { ...state, ...action.payload, status: "in-progress" };
    case "SELECT_CHALLENGE":
      return {
        ...state,
        status: "in-progress",
        activeChallengeId: action.payload,
        showConfetti: false,
      };
    case "BACK_TO_MENU":
      return { ...state, activeChallengeId: null };
    case "COMPLETE_CHALLENGE": {
      const { id, score, teamName } = action.payload;
      const challengeIndex = CHALLENGE_DATA.findIndex((c) => c.id === id);
      if (challengeIndex === -1) return state;

      const newScores = [...state.scores];
      newScores[challengeIndex] = score;

      const newCompleted = [...state.challengesCompleted];
      newCompleted[challengeIndex] = true;

      const totalScore = newScores.reduce((a, b) => a + b, 0);
      const allCompleted = newCompleted.every(Boolean);

      // Save to database immediately
      const newEntry = {
        name: teamName,
        score: totalScore,
        createdAt: Date.now(),
      };
      
      // Save to database (leaderboard refresh will be handled by completeChallenge function)
      updateAndSaveLeaderboard(newEntry);

      return {
        ...state,
        scores: newScores,
        challengesCompleted: newCompleted,
        activeChallengeId: null,
        totalScore,
        status: allCompleted ? "finished" : "in-progress",
        showConfetti: allCompleted,
      };
    }
    case "SET_LEADERBOARD":
      return { ...state, leaderboard: action.payload };
    case "ADD_LEADERBOARD_ENTRY": {
      // Check if team already exists in leaderboard
      const existingEntryIndex = state.leaderboard.findIndex(
        (entry) => entry.name.toLowerCase() === action.payload.name.toLowerCase(),
      );
      let newLeaderboard = [...state.leaderboard];

      if (existingEntryIndex > -1) {
        // Update existing entry
        newLeaderboard[existingEntryIndex] = {
          ...newLeaderboard[existingEntryIndex],
          score: action.payload.score,
          createdAt: action.payload.createdAt,
        };
      } else {
        // Add new entry if team doesn't exist
        newLeaderboard.push(action.payload);
      }

      // Sort and limit to top 10
      newLeaderboard = newLeaderboard
        .sort((a, b) => {
          if (b.score !== a.score) {
            return b.score - a.score;
          }
          return a.createdAt - b.createdAt;
        })
        .slice(0, 10);

      updateAndSaveLeaderboard(action.payload);

      return { ...state, leaderboard: newLeaderboard };
    }
    case "RESET_GAME":
      return { ...initialState, leaderboard: state.leaderboard };
    case "LOGOUT":
      return initialState;
    default:
      return state;
  }
};

export const AppStateProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(gameStateReducer, initialState);
  const { team, loading, setTeam, logout: sessionLogout } = useSession();

  // Fetch leaderboard data from database
  const fetchLeaderboard = useCallback(async () => {
    try {
      const res = await fetch("/api/leaderboard");
      if (res.ok) {
        const data = await res.json();
        dispatch({ type: "SET_LEADERBOARD", payload: data });
      }
    } catch (err) {
      // Failed to fetch leaderboard
    }
  }, []);

  useEffect(() => {
    // Fetch initial leaderboard data
    fetchLeaderboard();
    
    // Set up real-time refresh every 5 seconds
    const interval = setInterval(fetchLeaderboard, 5000);
    
    return () => clearInterval(interval);
  }, [fetchLeaderboard]);

  // Load team progress from database
  const loadTeamProgress = useCallback(async () => {
    if (!team) return;
    
    try {
      const response = await fetch('/api/progress');
      if (response.ok) {
        const progressData = await response.json();
        
        // Convert database progress to game state format
        const challengesCompleted = Array(CHALLENGE_DATA.length).fill(false);
        const scores = Array(CHALLENGE_DATA.length).fill(0);
        let totalScore = 0;
        
        progressData.forEach((progress: any) => {
          const challengeIndex = CHALLENGE_DATA.findIndex(c => c.id === progress.challengeId);
          if (challengeIndex !== -1) {
            challengesCompleted[challengeIndex] = progress.completed;
            scores[challengeIndex] = progress.score;
            totalScore += progress.score;
          }
        });
        
        const allCompleted = challengesCompleted.every(Boolean);
        
        dispatch({ 
          type: "SET_TEAM_DATA", 
          payload: {
            challengesCompleted,
            scores,
            totalScore,
            status: allCompleted ? "finished" : "in-progress",
            showConfetti: false
          }
        });
      } else {
        // If no progress found, reset to initial state
        dispatch({ type: "RESET_GAME" });
      }
    } catch (error) {
      // Fallback to localStorage for backward compatibility
      const savedProgress = localStorage.getItem(`progress_${team.name}`);
      if (savedProgress) {
        dispatch({ type: "SET_TEAM_DATA", payload: JSON.parse(savedProgress) });
      } else {
        dispatch({ type: "RESET_GAME" });
      }
    }
  }, [team]);

  useEffect(() => {
    if (team) {
      // Load team progress from database
      loadTeamProgress();
    } else {
      dispatch({ type: "LOGOUT" });
    }
  }, [team, loadTeamProgress]);

  useEffect(() => {
    // Persist state to local storage on change, but not for admins
    if (team && !team.isAdmin && state.status !== "not-started") {
      localStorage.setItem(`progress_${team.name}`, JSON.stringify(state));
    }
  }, [state, team]);

  const selectChallenge = useCallback(
    (id: string) => dispatch({ type: "SELECT_CHALLENGE", payload: id }),
    [],
  );
  const completeChallenge = useCallback(
    async (id: string, score: number) => {
      if (team) {
        // Save progress to database first
        try {
          await fetch('/api/progress', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              challengeId: id,
              score,
              completed: true
            })
          });
        } catch (error) {
          // Failed to save progress to database
        }

        dispatch({
          type: "COMPLETE_CHALLENGE",
          payload: { id, score, teamName: team.name },
        });
        
        // Refresh leaderboard after a short delay to ensure database write completes
        setTimeout(() => {
          fetchLeaderboard();
        }, 200);
      }
    },
    [team, fetchLeaderboard],
  );
  const backToMenu = useCallback(() => dispatch({ type: "BACK_TO_MENU" }), []);
  const addLeaderboardEntry = useCallback(
    (entry: Omit<LeaderboardEntry, "createdAt">) => {
      const newEntry: LeaderboardEntry = {
        ...entry,
        createdAt: Date.now(),
      };
      dispatch({ type: "ADD_LEADERBOARD_ENTRY", payload: newEntry });
    },
    [],
  );
  const resetGame = useCallback(async () => {
    if (team && !team.isAdmin) {
      // Clear progress from database
      try {
        await fetch('/api/progress', { method: 'DELETE' });
      } catch (error) {
        // Failed to reset progress in database
      }
      
      // Also clear localStorage for backward compatibility
      localStorage.removeItem(`progress_${team.name}`);
    }
    
    // Reset pacmanPlayed flag in localStorage (will be checked by PacmanChallenge component)
    try {
      localStorage.setItem("pacmanPlayed", "false");
    } catch (err) {
      // Failed to reset pacmanPlayed
    }
    
    dispatch({ type: "RESET_GAME" });
  }, [team]);

  const handleLogout = useCallback(async () => {
    await sessionLogout();
    // Don't remove progress from localStorage - let it persist for when user logs back in
    // if (team) {
    //   localStorage.removeItem(`progress_${team.name}`);
    // }
    dispatch({ type: "LOGOUT" });
  }, [sessionLogout, team]);

  return (
    <AppStateContext.Provider
      value={{
        state,
        dispatch,
        selectChallenge,
        completeChallenge,
        backToMenu,
        addLeaderboardEntry,
        resetGame,
        team,
        setTeam,
        logout: handleLogout,
        loading,
      }}
    >
      {children}
    </AppStateContext.Provider>
  );
};

export const useAppState = () => {
  const context = useContext(AppStateContext);
  if (context === undefined) {
    throw new Error("useAppState must be used within an AppStateProvider");
  }
  return context;
};
