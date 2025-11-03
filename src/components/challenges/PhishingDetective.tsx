
"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { ChallengeProps } from '@/lib/types';
import { Badge } from '../ui/badge';
import { Mail, CheckCircle, XCircle, ShieldCheck, ShieldAlert } from 'lucide-react';
import { PHISHING_EMAILS } from '@/lib/challenges-data';
import { ScrollArea } from '../ui/scroll-area';

type Feedback = {
    isCorrect: boolean;
    explanation: string;
    redFlags: string[];
};

export default function PhishingDetective({ onComplete, challenge }: ChallengeProps) {
    const [currentEmailIndex, setCurrentEmailIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [feedback, setFeedback] = useState<Feedback | null>(null);
    const [showIntro, setShowIntro] = useState(true);

    const handleChoice = (choice: 'scam' | 'safe') => {
        const email = PHISHING_EMAILS[currentEmailIndex];
        const isCorrect = email.type === choice;
        
        let newScore = score;
        if(isCorrect) {
            newScore += 10;
        } else {
            newScore -= 5;
        }
        setScore(Math.max(0, newScore));
        
        setFeedback({
            isCorrect,
            explanation: email.explanation,
            redFlags: email.redFlags,
        });
    };

    const handleNext = () => {
        setFeedback(null);
        if (currentEmailIndex < PHISHING_EMAILS.length - 1) {
            setCurrentEmailIndex(currentEmailIndex + 1);
        } else {
            onComplete(score);
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
             <Mail className="w-16 h-16 mx-auto text-primary mb-4" />
            <Button onClick={() => setShowIntro(false)} size="lg">Start Detective Work</Button>
          </CardContent>
        </Card>
      )
    }

    const email = PHISHING_EMAILS[currentEmailIndex];

    return (
        <Card className="w-full max-w-4xl mx-auto">
            <CardHeader>
                <div className="flex justify-between items-center">
                    <CardTitle>{challenge.title}</CardTitle>
                    <div className="text-right">
                        <div className="font-bold text-lg">Score: {score}</div>
                        <div className="text-sm text-muted-foreground">Email {currentEmailIndex + 1} of {PHISHING_EMAILS.length}</div>
                    </div>
                </div>
                <CardDescription>Is this email a scam or safe? Analyze it carefully.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid md:grid-cols-3 gap-6">
                    <div className="md:col-span-1">
                        <h3 className="font-semibold mb-2">Inbox</h3>
                        <ScrollArea className="h-96 pr-4">
                            <div className="space-y-2">
                            {PHISHING_EMAILS.map((e, index) => (
                                <button key={e.id} onClick={() => !feedback && setCurrentEmailIndex(index)}
                                    className={`w-full p-2 rounded-lg text-left transition-colors ${currentEmailIndex === index ? 'bg-primary/10' : 'hover:bg-muted'}`}
                                >
                                    <p className="font-bold text-sm">{e.sender}</p>
                                    <p className="text-sm truncate">{e.subject}</p>
                                    <p className="text-xs text-muted-foreground truncate">{e.snippet}</p>
                                </button>
                            ))}
                            </div>
                        </ScrollArea>
                    </div>

                    <div className="md:col-span-2">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={currentEmailIndex}
                                initial={{ opacity: 0, x: 50 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -50 }}
                            >
                                <Card className="h-full">
                                    <CardHeader>
                                        <CardTitle className="text-lg">{email.subject}</CardTitle>
                                        <CardDescription>From: &lt;{email.sender}&gt;</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="prose prose-sm dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: email.body }}></div>
                                        
                                        {!feedback && (
                                            <div className="flex gap-4 mt-6">
                                                <Button onClick={() => handleChoice('safe')} className="w-full bg-green-600 hover:bg-green-700">
                                                    <ShieldCheck className="mr-2 h-4 w-4"/> Safe
                                                </Button>
                                                <Button onClick={() => handleChoice('scam')} className="w-full" variant="destructive">
                                                    <ShieldAlert className="mr-2 h-4 w-4"/> Scam
                                                </Button>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>

                {feedback && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`mt-4 p-4 rounded-lg ${feedback.isCorrect ? 'bg-green-500/10 text-green-700 dark:text-green-400' : 'bg-destructive/10 text-destructive'}`}
                    >
                        <div className="flex items-center gap-2 font-bold text-lg mb-2">
                            {feedback.isCorrect ? <CheckCircle /> : <XCircle />}
                            {feedback.isCorrect ? 'Correct!' : 'Incorrect!'}
                        </div>
                        <p className="text-sm mb-2">{feedback.explanation}</p>
                        {feedback.redFlags.length > 0 && (
                            <>
                                <h4 className="font-semibold text-sm">Red Flags:</h4>
                                <div className="flex flex-wrap gap-2 mt-1">
                                    {feedback.redFlags.map(flag => <Badge key={flag} variant={feedback.isCorrect ? "default" : "destructive"}>{flag}</Badge>)}
                                </div>
                            </>
                        )}
                        <Button onClick={handleNext} className="w-full mt-4">
                            {currentEmailIndex === PHISHING_EMAILS.length - 1 ? 'Finish Challenge' : 'Next Email'}
                        </Button>
                    </motion.div>
                )}
            </CardContent>
        </Card>
    );
}
