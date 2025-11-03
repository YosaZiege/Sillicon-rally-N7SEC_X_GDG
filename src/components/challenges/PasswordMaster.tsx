
"use client";

import { useState, useEffect, useCallback } from 'react';
import { useDebounce } from 'use-debounce';
import { motion } from 'framer-motion';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Progress } from '../ui/progress';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { ChallengeProps } from '@/lib/types';
import { Badge } from '../ui/badge';
import { Check, Info, Lightbulb, X } from 'lucide-react';

const commonPasswords = new Set(['123456', 'password', '123456789', 'qwerty', '111111']);

const checkPasswordStrength = (password: string) => {
    let score = 0;
    const feedback = [];

    if (password.length < 8) {
        feedback.push("Too short (aim for 8+ characters)");
    } else if (password.length >= 12) {
        score += 25;
    } else {
        score += 10;
    }

    if (/\d/.test(password)) {
        score += 20;
    } else {
        feedback.push("Add numbers");
    }

    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) {
        score += 25;
    } else {
        feedback.push("Use both uppercase and lowercase letters");
    }

    if (/[^A-Za-z0-9]/.test(password)) {
        score += 30;
    } else {
        feedback.push("Add symbols (e.g., !@#$%)");
    }

    if (commonPasswords.has(password.toLowerCase())) {
        score = 5;
        feedback.push("Avoid common passwords");
    }
    
    score = Math.min(100, score);

    return { score, feedback };
};


export default function PasswordMaster({ onComplete, challenge }: ChallengeProps) {
    const [password, setPassword] = useState('');
    const [debouncedPassword] = useDebounce(password, 300);
    const [strength, setStrength] = useState({ score: 0, feedback: [] as string[] });
    const [strongPasswords, setStrongPasswords] = useState<string[]>([]);
    const [timeLeft, setTimeLeft] = useState(60);
    const [isActive, setIsActive] = useState(false);

    useEffect(() => {
        const { score, feedback } = checkPasswordStrength(debouncedPassword);
        setStrength({ score, feedback });
    }, [debouncedPassword]);

    useEffect(() => {
        let interval: NodeJS.Timeout | null = null;
        if (isActive && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft((time) => time - 1);
            }, 1000);
        } else if (timeLeft === 0) {
            setIsActive(false);
            const finalScore = strongPasswords.length * 20;
            onComplete(finalScore);
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [isActive, timeLeft, strongPasswords, onComplete]);

    const addStrongPassword = () => {
        if (strength.score >= 80 && !strongPasswords.includes(password) && strongPasswords.length < 5) {
            setStrongPasswords([...strongPasswords, password]);
            setPassword('');
            if(strongPasswords.length + 1 === 5) {
              setIsActive(false);
              onComplete(100);
            }
        }
    };

    const getStrengthColor = (score: number) => {
        if (score < 40) return 'bg-destructive';
        if (score < 80) return 'bg-yellow-500';
        return 'bg-green-500';
    };

    const getEmoji = (score: number) => {
        if (score < 40) return '😱';
        if (score < 80) return '😊';
        return '🔥';
    };

    if (!isActive) {
      return (
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>{challenge.title}</CardTitle>
            <CardDescription>{challenge.instructions}</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button onClick={() => setIsActive(true)} size="lg">Start Challenge</Button>
          </CardContent>
        </Card>
      )
    }

    return (
        <Card className="w-full max-w-2xl mx-auto">
            <CardHeader>
                <div className='flex justify-between items-center'>
                    <CardTitle>{challenge.title}</CardTitle>
                    <Badge variant="secondary" className="text-lg">Time: {timeLeft}s</Badge>
                </div>
                <CardDescription>Create 5 strong passwords. Score {strongPasswords.length * 20} / 100.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-6">
                    <div>
                        <div className="flex gap-4 items-center">
                            <Input
                                type="text"
                                placeholder="Enter a password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="flex-grow"
                            />
                            <Button onClick={addStrongPassword} disabled={strength.score < 80 || password === ''}>
                                <Check className="mr-2 h-4 w-4" /> Add
                            </Button>
                        </div>
                        <div className="mt-4">
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-sm font-medium">Password Strength</span>
                                <span className="text-2xl">{getEmoji(strength.score)}</span>
                            </div>
                            <Progress value={strength.score} className={`w-full h-3 [&>*]:${getStrengthColor(strength.score)}`} />
                        </div>
                        <div className="mt-4 space-y-2">
                            {strength.feedback.map((msg, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="flex items-center text-sm text-destructive"
                                >
                                    <X className="w-4 h-4 mr-2" /> {msg}
                                </motion.div>
                            ))}
                            {strength.score >= 80 && password.length > 0 && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="flex items-center text-sm text-green-600"
                                >
                                    <Check className="w-4 h-4 mr-2" /> Excellent! This is a strong password.
                                </motion.div>
                            )}
                        </div>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <h3 className="font-semibold mb-2">Strong Passwords Created: ({strongPasswords.length}/5)</h3>
                            <div className="flex flex-wrap gap-2">
                                {strongPasswords.map((p, i) => <Badge key={i} variant="outline">{`Password ${i+1}`}</Badge>)}
                                {Array(5 - strongPasswords.length).fill(0).map((_, i) => <Badge key={i} variant="secondary">{`Slot ${strongPasswords.length + i + 1}`}</Badge>)}
                            </div>
                        </div>
                        <div className="p-4 bg-muted/50 rounded-lg">
                            <h4 className="flex items-center font-semibold mb-2"><Info className="w-4 h-4 mr-2" /> Common Mistakes</h4>
                            <div className="flex flex-wrap gap-2 text-sm">
                                {Array.from(commonPasswords).map(p => <Badge key={p} variant="destructive">{p}</Badge>)}
                            </div>
                        </div>
                         <div className="p-4 bg-muted/50 rounded-lg">
                            <h4 className="flex items-center font-semibold mb-2"><Lightbulb className="w-4 h-4 mr-2" /> Tip</h4>
                            <p className="text-sm text-muted-foreground">
                                Try using a memorable phrase, like <strong>Correct-Horse-Battery-Staple!</strong> It's long, complex, and easy to remember.
                            </p>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
