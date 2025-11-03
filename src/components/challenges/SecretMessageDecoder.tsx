
"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { ChallengeProps } from '@/lib/types';
import { Badge } from '../ui/badge';
import { Check, HelpCircle, Lightbulb, Lock, Unlock } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { DECODER_PUZZLES } from '@/lib/challenges-data';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';

export default function SecretMessageDecoder({ onComplete, challenge }: ChallengeProps) {
    const [currentPuzzleIndex, setCurrentPuzzleIndex] = useState(0);
    const [answers, setAnswers] = useState(Array(DECODER_PUZZLES.length).fill(''));
    const [solved, setSolved] = useState(Array(DECODER_PUZZLES.length).fill(false));
    const [score, setScore] = useState(0);
    const [hintsUsed, setHintsUsed] = useState(Array(DECODER_PUZZLES.length).fill(false));
    const [showIntro, setShowIntro] = useState(true);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newAnswers = [...answers];
        newAnswers[currentPuzzleIndex] = e.target.value;
        setAnswers(newAnswers);
    };

    const checkAnswer = () => {
        const puzzle = DECODER_PUZZLES[currentPuzzleIndex];
        if (answers[currentPuzzleIndex].toLowerCase().trim() === puzzle.solution.toLowerCase()) {
            const newSolved = [...solved];
            newSolved[currentPuzzleIndex] = true;
            setSolved(newSolved);
            
            let points = 20;
            if(hintsUsed[currentPuzzleIndex]) {
                points -= 5;
            }
            setScore(s => s + points);

            if (newSolved.every(s => s)) {
                onComplete(score + points);
            }
        }
    };

    const useHint = () => {
        if (!hintsUsed[currentPuzzleIndex]) {
            const newHintsUsed = [...hintsUsed];
            newHintsUsed[currentPuzzleIndex] = true;
            setHintsUsed(newHintsUsed);
            // No score deduction here, it happens on solve
        }
    };
    
    if (showIntro) {
      return (
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>{challenge.title}</CardTitle>
            <CardDescription>{challenge.instructions}</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
             <Lock className="w-16 h-16 mx-auto text-primary mb-4" />
            <Button onClick={() => setShowIntro(false)} size="lg">Start Decoding</Button>
          </CardContent>
        </Card>
      )
    }
    
    const allSolved = solved.every(s => s);

    return (
        <Card className="w-full max-w-3xl mx-auto">
            <CardHeader>
                <div className="flex justify-between items-center">
                    <CardTitle>{challenge.title}</CardTitle>
                    <Badge variant="secondary" className="text-lg">Score: {score}</Badge>
                </div>
                <CardDescription>Solve all {DECODER_PUZZLES.length} puzzles to complete the challenge.</CardDescription>
            </CardHeader>
            <CardContent>
                <Tabs value={String(currentPuzzleIndex)} onValueChange={(v) => setCurrentPuzzleIndex(Number(v))} className="w-full">
                    <TabsList className="grid w-full grid-cols-5">
                        {DECODER_PUZZLES.map((p, index) => (
                            <TabsTrigger key={p.id} value={String(index)} disabled={allSolved}>
                                {solved[index] ? <Unlock className="w-4 h-4 text-green-500" /> : <Lock className="w-4 h-4" />}
                                <span className="ml-2 hidden sm:inline">#{index + 1}</span>
                            </TabsTrigger>
                        ))}
                    </TabsList>
                    
                    {DECODER_PUZZLES.map((puzzle, index) => (
                        <TabsContent key={puzzle.id} value={String(index)}>
                            <div className="p-4 border rounded-lg mt-4">
                               <h3 className="font-bold text-lg mb-2">{puzzle.name}</h3>
                               <p className="text-sm text-muted-foreground mb-4">Encrypted Message:</p>
                               <div className="p-3 bg-muted rounded font-mono text-center text-lg tracking-widest break-words mb-4">
                                   {puzzle.encrypted}
                               </div>

                                {solved[index] ? (
                                    <Alert variant="default" className="bg-green-500/10 border-green-500/50">
                                        <Check className="h-4 w-4" />
                                        <AlertTitle className="text-green-700 dark:text-green-400">Solved!</AlertTitle>
                                        <AlertDescription>
                                            Correct answer: <strong>{puzzle.solution}</strong>
                                        </AlertDescription>
                                    </Alert>
                                ) : (
                                   <>
                                        <div className="flex gap-2">
                                            <Input
                                                placeholder="Your decoded message..."
                                                value={answers[index]}
                                                onChange={handleInputChange}
                                                onKeyDown={(e) => e.key === 'Enter' && checkAnswer()}
                                            />
                                            <Button onClick={checkAnswer}>Submit</Button>
                                        </div>
                                        <Button variant="outline" size="sm" onClick={useHint} className="mt-4">
                                            <HelpCircle className="w-4 h-4 mr-2" /> Get a Hint (-5 pts)
                                        </Button>
                                        
                                        <AnimatePresence>
                                        {hintsUsed[index] && (
                                            <motion.div initial={{opacity: 0, y: -10}} animate={{opacity: 1, y: 0}} className="mt-4">
                                                <Alert variant="destructive">
                                                    <Lightbulb className="h-4 w-4" />
                                                    <AlertTitle>Hint</AlertTitle>
                                                    <AlertDescription>{puzzle.hint}</AlertDescription>
                                                </Alert>
                                            </motion.div>
                                        )}
                                        </AnimatePresence>
                                   </>
                               )}
                            </div>
                        </TabsContent>
                    ))}
                </Tabs>
                {allSolved && (
                     <div className="text-center mt-6">
                        <h3 className="text-xl font-bold text-green-600">All puzzles solved!</h3>
                        <Button onClick={() => onComplete(score)} className="mt-2">Complete Challenge</Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
