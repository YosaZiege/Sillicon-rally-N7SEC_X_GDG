
"use client";

import { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { ChallengeProps } from '@/lib/types';
import { CAPTCHA_CHALLENGES } from '@/lib/challenges-data';
import { Input } from '../ui/input';
import { Slider } from '../ui/slider';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { Bot, Check, Shield, X } from 'lucide-react';
import Image from 'next/image';
import { Badge } from '../ui/badge';

export default function CaptchaChallenge({ onComplete, challenge }: ChallengeProps) {
  const [currentChallengeIndex, setCurrentChallengeIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [inputValue, setInputValue] = useState('');
  const [gridSelection, setGridSelection] = useState<number[]>([]);
  const [sliderValue, setSliderValue] = useState(50);
  const [feedback, setFeedback] = useState<{ correct: boolean, message: string } | null>(null);
  const [showIntro, setShowIntro] = useState(true);

  const current = CAPTCHA_CHALLENGES[currentChallengeIndex];

  const handleGridSelect = (index: number) => {
    if (feedback) return;
    setGridSelection(prev => 
        prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
    );
  };

  const handleSubmit = () => {
    let isCorrect = false;
    let points = 0;
    switch (current.type) {
        case 'text':
            isCorrect = inputValue.toLowerCase() === (current.solution as string).toLowerCase();
            break;
        case 'grid':
            const solution = current.solutions as number[];
            isCorrect = gridSelection.length === solution.length && gridSelection.every(s => solution.includes(s));
            break;
        case 'slider':
            // Allow a tolerance for the slider
            isCorrect = Math.abs(sliderValue - (current.solution as number)) < 10;
            break;
    }

    if (isCorrect) {
        points = 25;
        setScore(s => s + points);
        setFeedback({ correct: true, message: `Correct! +${points} points.` });
    } else {
        setFeedback({ correct: false, message: `Incorrect. Try the next one.` });
    }
  };
  
  const handleNext = () => {
    setFeedback(null);
    setInputValue('');
    setGridSelection([]);
    setSliderValue(50);
    if (currentChallengeIndex < CAPTCHA_CHALLENGES.length - 1) {
        setCurrentChallengeIndex(i => i + 1);
    } else {
        onComplete(score);
    }
  };

  const renderCaptcha = () => {
    switch (current.type) {
      case 'text':
        return (
          <div className="flex flex-col items-center gap-4">
            <Image src={current.image} alt="Captcha image" width={200} height={70} className="border rounded-md" data-ai-hint="text captcha" />
            <Input value={inputValue} onChange={e => setInputValue(e.target.value)} placeholder="Enter text..." disabled={!!feedback} className="w-full" />
          </div>
        );
      case 'grid':
        return (
          <div className="relative w-[300px] h-[300px] mx-auto">
            <Image src={current.image} alt="Captcha grid" layout="fill" objectFit="cover" className="rounded-md" data-ai-hint="street view" />
            <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 gap-1">
              {Array.from({ length: 9 }).map((_, i) => (
                <div 
                    key={i}
                    onClick={() => handleGridSelect(i)}
                    className={`border-2 rounded-md transition-colors ${gridSelection.includes(i) ? 'bg-blue-500/50 border-blue-500' : 'border-transparent hover:bg-white/20 cursor-pointer'}`}
                ></div>
              ))}
            </div>
          </div>
        );
      case 'slider':
        return (
            <div className="w-full max-w-xs mx-auto flex flex-col items-center gap-4">
                <div className="relative h-20 w-full rounded-md overflow-hidden bg-gray-200">
                    <Image src={current.image} alt="Slider background" layout="fill" objectFit="cover" data-ai-hint="nature landscape" />
                    <div className="absolute top-1/2 -translate-y-1/2 h-16 w-16 bg-white/50 backdrop-blur-sm border-2 border-white" style={{left: `${sliderValue}px`}}>
                         {current.piece && <Image src={current.piece} alt="Slider piece" layout="fill" objectFit="contain" data-ai-hint="puzzle piece" />}
                    </div>
                </div>
                <Slider 
                    value={[sliderValue]} 
                    onValueChange={(v) => setSliderValue(v[0])}
                    max={250}
                    disabled={!!feedback}
                    className="w-full"
                />
            </div>
        );
      default:
        return null;
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
             <Bot className="w-16 h-16 mx-auto text-primary mb-4" />
            <Button onClick={() => setShowIntro(false)} size="lg">Start Challenge</Button>
          </CardContent>
        </Card>
      )
    }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <div className="flex justify-between items-center">
            <CardTitle>Are you a robot?</CardTitle>
            <Badge variant="secondary">Score: {score}</Badge>
        </div>
        <CardDescription>{current.prompt}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center min-h-[300px] mb-6">
            {renderCaptcha()}
        </div>
        
        {!feedback ? (
            <Button onClick={handleSubmit} className="w-full">Verify</Button>
        ) : (
            <div className="mt-6">
                <Alert variant={feedback.correct ? 'default' : 'destructive'}>
                    {feedback.correct ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
                    <AlertTitle>{feedback.correct ? "Human Verified!" : "Verification Failed"}</AlertTitle>
                    <AlertDescription>{feedback.message}</AlertDescription>
                </Alert>
                <Button onClick={handleNext} className="w-full mt-4">
                    {currentChallengeIndex === CAPTCHA_CHALLENGES.length - 1 ? "Finish" : "Next Captcha"}
                </Button>
            </div>
        )}
      </CardContent>
    </Card>
  );
}
