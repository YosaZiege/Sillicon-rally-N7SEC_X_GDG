
"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { ChallengeProps } from '@/lib/types';
import { SOCIAL_ENGINEERING_SCENARIOS } from '@/lib/challenges-data';
import { Badge } from '../ui/badge';
import { Check, Shield, Users, X } from 'lucide-react';

type Feedback = {
  isCorrect: boolean;
  explanation: string;
};

export default function SocialEngineeringChallenge({ onComplete, challenge }: ChallengeProps) {
    const [currentScenarioIndex, setCurrentScenarioIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [feedback, setFeedback] = useState<Feedback | null>(null);
    const [showIntro, setShowIntro] = useState(true);

    const handleChoice = (isCorrect: boolean, explanation: string) => {
        setScore(prevScore => prevScore + (isCorrect ? 10 : 0));
        setFeedback({ isCorrect, explanation });
    };

    const handleNext = () => {
        setFeedback(null);
        if (currentScenarioIndex < SOCIAL_ENGINEERING_SCENARIOS.length - 1) {
            setCurrentScenarioIndex(currentScenarioIndex + 1);
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
             <Users className="w-16 h-16 mx-auto text-primary mb-4" />
            <Button onClick={() => setShowIntro(false)} size="lg">Start Challenge</Button>
          </CardContent>
        </Card>
      )
    }

    const scenario = SOCIAL_ENGINEERING_SCENARIOS[currentScenarioIndex];

    return (
        <Card className="w-full max-w-2xl mx-auto">
            <CardHeader>
                <div className="flex justify-between items-center">
                    <CardTitle>Scenario {currentScenarioIndex + 1}/{SOCIAL_ENGINEERING_SCENARIOS.length}</CardTitle>
                    <Badge variant="secondary" className="text-lg">Score: {score}</Badge>
                </div>
                <CardDescription>What would you do in this situation?</CardDescription>
            </CardHeader>
            <CardContent>
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentScenarioIndex}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.3 }}
                    >
                        <div className="p-4 bg-muted rounded-lg mb-6">
                            <p className="text-center font-semibold text-lg">{scenario.scenario}</p>
                            <div className="text-center mt-2">
                                <Badge variant="outline">{scenario.type}</Badge>
                            </div>
                        </div>

                        {!feedback ? (
                            <div className="space-y-3">
                                {scenario.options.map((option, index) => (
                                    <Button
                                        key={index}
                                        variant="outline"
                                        className="w-full h-auto text-wrap justify-start p-4"
                                        onClick={() => handleChoice(option.isCorrect, option.explanation)}
                                    >
                                        {option.text}
                                    </Button>
                                ))}
                            </div>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                            >
                                <div className={`p-4 rounded-lg text-center ${feedback.isCorrect ? 'bg-green-500/10 text-green-700 dark:text-green-400' : 'bg-destructive/10 text-destructive'}`}>
                                    <div className="font-bold text-xl mb-2 flex items-center justify-center gap-2">
                                        {feedback.isCorrect ? <Check /> : <X />}
                                        {feedback.isCorrect ? "Good Choice!" : "Risky Move!"}
                                    </div>
                                    <p>{feedback.explanation}</p>
                                </div>
                                <Button onClick={handleNext} className="w-full mt-4">
                                    {currentScenarioIndex === SOCIAL_ENGINEERING_SCENARIOS.length - 1 ? "Finish Challenge" : "Next Scenario"}
                                </Button>
                            </motion.div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </CardContent>
        </Card>
    );
}
