"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";  
import { useAppState } from "@/components/providers/AppStateProvider";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { Crown, Trophy } from "lucide-react";
import type { LeaderboardEntry } from "@/lib/types";

export default function Leaderboard() {
  const router = useRouter();
  const { state, addLeaderboardEntry, team } = useAppState();
  const [name, setName] = useState(team?.name || "");
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (state.leaderboard) {
      const teamOnLeaderboard = state.leaderboard.some(
        (entry) => entry.name === team?.name,
      );
      if (state.status === "finished" && teamOnLeaderboard) {
        setSubmitted(true);
      }
      setIsLoading(false);
    }
  }, [state.leaderboard, state.status, team?.name]);
  useEffect(() => {

    if (team && !team.isAdmin) {
      router.replace("/");
    }

  }, [team , router])
  useEffect(() => {
    if (team?.name) {
      setName(team.name);
    }
  }, [team?.name]);

  const handleSubmit = () => {
    if (name.trim()) {
      addLeaderboardEntry({ name: name.trim(), score: state.totalScore });
      setSubmitted(true);
    }
  };

  const getRankIcon = (index: number) => {
    if (index === 0) return <Crown className="w-5 h-5 text-yellow-500" />;
    if (index === 1) return <Trophy className="w-5 h-5 text-gray-400" />;
    if (index === 2) return <Trophy className="w-5 h-5 text-yellow-700" />;
    return <span className="text-sm font-bold">{index + 1}</span>;
  };

  return (
    <Card className="w-full mx-auto  max-w-7xl ">
      <CardHeader>
        <CardTitle className="text-center text-2xl flex items-center justify-center gap-2">
          <Trophy className="w-6 h-6" />
          Leaderboard
        </CardTitle>
      </CardHeader>
      <CardContent className="w-full">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">Rank</TableHead>
              <TableHead>Name</TableHead>
              <TableHead className="text-right">Score</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={3} className="text-center">
                  Loading...
                </TableCell>
              </TableRow>
            )}
            {!isLoading &&
              state.leaderboard.map((entry, index) => (
                <TableRow
                  key={index}
                  className={entry.name === team?.name ? "bg-primary/10" : ""}
                >
                  <TableCell className="font-medium text-center">
                    {getRankIcon(index)}
                  </TableCell>
                  <TableCell>{entry.name}</TableCell>
                  <TableCell className="text-right font-bold">
                    {entry.score}
                  </TableCell>
                </TableRow>
              ))}
            {!isLoading && state.leaderboard.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={3}
                  className="text-center text-muted-foreground"
                >
                  Be the first to get on the leaderboard!
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
      {!submitted && state.status === "finished" && !team?.isAdmin && (
        <CardFooter className="flex-col gap-2 items-stretch">
          <p className="text-sm text-center text-muted-foreground">
            Your score has been submitted to the leaderboard under your team
            name.
          </p>
        </CardFooter>
      )}
    </Card>
  );
}
