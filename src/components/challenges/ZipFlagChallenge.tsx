"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChallengeProps } from "@/lib/types";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Check, X } from "lucide-react";

const CORRECT_FLAG = process.env.FLAG_HAMID || 'FLAG_NOT_SET';
const ZIP_FILE_URL = "/files/fin.zip"; // URL to the file in your public folder

export default function ZipFlagChallenge({
  onComplete,
  challenge,
}: ChallengeProps) {
  const [flag, setFlag] = useState("");
  const [feedback, setFeedback] = useState<{
    correct: boolean;
    message: string;
  } | null>(null);

  const handleSubmit = () => {
    if (flag.trim() === CORRECT_FLAG) {
      setFeedback({
        correct: true,
        message: "Correct! You earned 400 points.",
      });
      onComplete(400);
    } else {
      setFeedback({ correct: false, message: "Incorrect flag. Try again." });
    }
  };

  return (
    <Card className="max-w-md mx-auto mt-10">
      <CardHeader>
        <CardTitle>{challenge.title}</CardTitle>
        <CardDescription>
          {challenge.instructions} <br /> ⚠️⚠️ Passwords in Lower Case ⚠️⚠️
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <span>Download the challenge file:</span>
          <a
            href={ZIP_FILE_URL}
            download
            className="text-primary hover:underline"
          >
            Download ZIP
          </a>
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="flag-input">Enter Flag</label>
          <Input
            id="flag-input"
            value={flag}
            onChange={(e) => setFlag(e.target.value)}
            placeholder="Enter flag here"
          />
        </div>

        <Button onClick={handleSubmit} className="mt-2">
          Submit
        </Button>

        {feedback && (
          <Alert
            variant={feedback.correct ? "default" : "destructive"}
            className="mt-4"
          >
            {feedback.correct ? (
              <Check className="h-4 w-4" />
            ) : (
              <X className="h-4 w-4" />
            )}
            <AlertTitle>
              {feedback.correct ? "Correct!" : "Incorrect"}
            </AlertTitle>
            <AlertDescription>{feedback.message}</AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
