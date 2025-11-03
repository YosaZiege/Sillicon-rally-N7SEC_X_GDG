"use client";
import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { ChallengeProps } from "@/lib/types";
import { useAppState } from "@/components/providers/AppStateProvider";

export default function PacmanChallenge({
  onComplete,
  challenge,
}: ChallengeProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const { backToMenu } = useAppState();

  // 🔁 Initialize pacmanPlayed to false when iframe loads
  useEffect(() => {
    const iframeEl = iframeRef.current;
    if (!iframeEl) return;

    const handleLoad = () => {
      try {
        const iframeWin = iframeEl.contentWindow;
        if (iframeWin) {
          iframeWin.localStorage.setItem("pacmanPlayed", "false");
        }
      } catch (err) {
        // Cannot access iframe localStorage yet
      }
    };

    iframeEl.addEventListener("load", handleLoad);
    return () => iframeEl.removeEventListener("load", handleLoad);
  }, []);

  // 🔁 Poll for pacmanPlayed = true
  useEffect(() => {
    const interval = setInterval(() => {
      const iframeWin = iframeRef.current?.contentWindow;
      if (!iframeWin) return;

      try {
        const played = iframeWin.localStorage.getItem("pacmanPlayed");
        if (played === "true") {
          clearInterval(interval);

          // get score if possible
          const scoreEl = iframeWin.document?.getElementById("points-display");

          const scoreText = scoreEl?.textContent ?? "0";
          const rawScore = parseInt(scoreText, 10) || 0;

          // Scale down for user-friendly display (e.g., 1000 → 100)
          const scaledScore = Math.round(rawScore / 10);

          onComplete(scaledScore);
        }
      } catch (err) {
        // Waiting for iframe access
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <>
      {/* Back button */}
      <Button
        variant="default"
        onClick={backToMenu}
        className="z-[100] fixed top-4 left-4 bg-primary text-white hover:bg-primary/80"
      >
        Back to Challenges
      </Button>

      {/* Fullscreen Pacman iframe */}
      <iframe
        ref={iframeRef}
        src="/index.html"
        className="fixed top-0 left-0 w-screen h-screen z-50"
        title={challenge.title}
        style={{ border: "none" }}
      />
    </>
  );
}
