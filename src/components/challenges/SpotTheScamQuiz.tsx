
"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { ChallengeProps } from '@/lib/types';
import { SCAM_QUIZ_QUESTIONS } from '@/lib/challenges-data';
import { Progress } from '../ui/progress';
import { Badge } from '../ui/badge';
import { Check, HelpCircle, X } from 'lucide-react';

type AnswerState = 'unanswered' | 'correct' | 'incorrect';

const getPersonality = (score: number) => {
    const percentage = (score / SCAM_QUIZ_QUESTIONS.length) * 100;
    if (percentage >= 90) return { title: "Security Expert", desc: "You have a sharp eye for scams!" };
    if (percentage >= 70) return { title: "Aware Professional", desc: "You're knowledgeable but stay vigilant." };
    if (percentage >= 40) return { title: "Cautious Guardian", desc: "Good start, but there's more to learn." };
    return { title: "Needs Training", desc: "This was a great learning experience. Keep practicing!" };
};

export default function SpotTheScamQuiz({ onComplete, challenge }: ChallengeProps) {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [answerState, setAnswerState] = useState<AnswerState>('unanswered');
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const [finished, setFinished] = useState(false);
    const [showIntro, setShowIntro] = useState(true);

    const question = SCAM_QUIZ_QUESTIONS[currentQuestionIndex];
    const pointsPerQuestion = Math.floor(100 / SCAM_QUIZ_QUESTIONS.length);

    const handleAnswer = (option: string) => {
        if (answerState !== 'unanswered') return;

        setSelectedOption(option);
        if (option === question.answer) {
            setScore(score + 1);
            setAnswerState('correct');
        } else {
            setAnswerState('incorrect');
        }
    };

    const handleNext = () => {
        if (currentQuestionIndex < SCAM_QUIZ_QUESTIONS.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
            setAnswerState('unanswered');
            setSelectedOption(null);
        } else {
            setFinished(true);
        }
    };

    const getButtonClass = (option: string) => {
        if (answerState === 'unanswered') return 'outline';
        if (option === question.answer) return 'default';
        if (option === selectedOption && answerState === 'incorrect') return 'destructive';
        return 'outline';
    };
    
    if (showIntro) {
      return (
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>{challenge.title}</CardTitle>
            <CardDescription>{challenge.instructions}</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
             <HelpCircle className="w-16 h-16 mx-auto text-primary mb-4" />
            <Button onClick={() => setShowIntro(false)} size="lg">Start Quiz</Button>
          </CardContent>
        </Card>
      )
    }

    if (finished) {
        const personality = getPersonality(score);
        const finalScore = score * pointsPerQuestion;
        return (
            <Card className="max-w-2xl mx-auto text-center">
                <CardHeader>
                    <CardTitle>Quiz Complete!</CardTitle>
                    <CardDescription>You answered {score} out of {SCAM_QUIZ_QUESTIONS.length} questions correctly.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-lg font-bold">Your security personality is:</p>
                    <h3 className="text-3xl font-bold text-primary my-2">{personality.title}</h3>
                    <p className="text-muted-foreground mb-6">{personality.desc}</p>
                    <div className="text-5xl font-bold">{finalScore}</div>
                    <p className="text-sm text-muted-foreground">Total Points</p>
                    <Button onClick={() => onComplete(finalScore)} className="mt-6 w-full">Claim Points</Button>
                </CardContent>
            </Card>
        );
    }
    

    return (
        <Card className="w-full max-w-2xl mx-auto">
            <CardHeader>
                <CardTitle>Question {currentQuestionIndex + 1}/{SCAM_QUIZ_QUESTIONS.length}</CardTitle>
                <Progress value={((currentQuestionIndex + 1) / SCAM_QUIZ_QUESTIONS.length) * 100} className="mt-2" />
            </CardHeader>
            <CardContent>
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentQuestionIndex}
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -50 }}
                        transition={{ duration: 0.3 }}
                    >
                        <p className="text-lg font-semibold mb-6">{question.question}</p>
                        <div className="space-y-3">
                            {question.options.map((option, index) => (
                                <Button
                                    key={index}
                                    variant={getButtonClass(option)}
                                    className="w-full h-auto text-wrap justify-start p-4"
                                    onClick={() => handleAnswer(option)}
                                    disabled={answerState !== 'unanswered'}
                                >
                                    <Badge variant="outline" className="mr-4">{String.fromCharCode(65 + index)}</Badge>
                                    {option}
                                </Button>
                            ))}
                        </div>

                        {answerState !== 'unanswered' && (
                             <motion.div 
                                initial={{opacity: 0, y: 10}}
                                animate={{opacity: 1, y: 0}}
                                className="mt-6"
                             >
                                <div className={`p-4 rounded-lg ${answerState === 'correct' ? 'bg-green-500/10' : 'bg-destructive/10'}`}>
                                    <h4 className={`font-bold flex items-center gap-2 ${answerState === 'correct' ? 'text-green-700 dark:text-green-400' : 'text-destructive'}`}>
                                        {answerState === 'correct' ? <Check /> : <X />}
                                        {answerState === 'correct' ? "Correct!" : "Not quite."}
                                    </h4>
                                    <p className="text-sm mt-2">{question.explanation}</p>
                                </div>
                                <Button onClick={handleNext} className="w-full mt-4">
                                    {currentQuestionIndex === SCAM_QUIZ_QUESTIONS.length - 1 ? "Finish Quiz" : "Next Question"}
                                </Button>
                             </motion.div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </CardContent>
        </Card>
    );
}
