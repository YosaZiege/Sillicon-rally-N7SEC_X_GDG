
"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { ChallengeProps } from '@/lib/types';
import { Progress } from '../ui/progress';
import { Footprints, Shield, Wifi, Share2, MapPin } from 'lucide-react';
import { Badge } from '../ui/badge';

const storyScenarios = [
  {
    text: "You just took a great photo on vacation. What do you do?",
    choices: [
      { text: "Post it on all social media with location tag.", privacy: -15, security: -5, data: ["Photo", "Location", "Timestamp"] },
      { text: "Post it on a private account for friends only.", privacy: 5, security: 0, data: ["Photo (limited audience)"] },
      { text: "Keep it for yourself.", privacy: 15, security: 5, data: [] },
    ],
  },
  {
    text: "You're at a coffee shop and need to get some work done. You see a free, open Wi-Fi network called 'CoffeeShop_Guest'.",
    choices: [
      { text: "Connect and start working on sensitive documents.", privacy: -20, security: -20, data: ["Network Traffic"] },
      { text: "Connect, but only browse news sites.", privacy: -10, security: -10, data: ["Browsing Habits"] },
      { text: "Use your phone's personal hotspot instead.", privacy: 10, security: 10, data: [] },
    ],
  },
  {
    text: "A new, trendy app asks for permission to access your contacts, location, and microphone.",
    choices: [
      { text: "Accept all permissions without reading.", privacy: -20, security: -15, data: ["Contacts", "Location History", "Audio Data"] },
      { text: "Deny all non-essential permissions.", privacy: 10, security: 10, data: [] },
      { text: "Don't install the app.", privacy: 15, security: 5, data: [] },
    ],
  },
  {
    text: "You receive a friend request on social media from someone you don't recognize.",
    choices: [
      { text: "Accept it. What's the harm?", privacy: -10, security: -5, data: ["Social Graph"] },
      { text: "Check for mutual friends before deciding.", privacy: 0, security: 0, data: [] },
      { text: "Ignore or delete the request.", privacy: 10, security: 5, data: [] },
    ]
  },
  {
    text: "A website offers you a 10% discount if you sign up for their newsletter with your primary email.",
    choices: [
        { text: "Sign up with your main email.", privacy: -5, security: 0, data: ["Email Address", "Shopping Interests"] },
        { text: "Use a separate, disposable email address.", privacy: 5, security: 5, data: [] },
        { text: "Skip the discount.", privacy: 10, security: 0, data: [] },
    ]
  }
];

export default function DigitalFootprintSimulator({ onComplete, challenge }: ChallengeProps) {
  const [step, setStep] = useState(0);
  const [privacy, setPrivacy] = useState(50);
  const [security, setSecurity] = useState(50);
  const [exposedData, setExposedData] = useState<string[]>([]);
  const [finished, setFinished] = useState(false);

  const handleChoice = (choice: { privacy: number; security: number; data: string[] }) => {
    setPrivacy(p => Math.max(0, Math.min(100, p + choice.privacy)));
    setSecurity(s => Math.max(0, Math.min(100, s + choice.security)));
    setExposedData(d => [...new Set([...d, ...choice.data])]);

    if (step < storyScenarios.length - 1) {
      setStep(s => s + 1);
    } else {
      setFinished(true);
    }
  };
  
  const calculateScore = () => {
    return Math.round(((privacy + security) / 200) * 100);
  }

  const getMeterColor = (value: number) => {
    if (value > 66) return "bg-green-500";
    if (value > 33) return "bg-yellow-500";
    return "bg-red-500";
  };
  
  if (finished) {
    const finalScore = calculateScore();
    return (
        <Card className="max-w-2xl mx-auto">
            <CardHeader>
                <CardTitle>Your Digital Footprint Report</CardTitle>
                <CardDescription>Based on your choices, here's what you've exposed.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                        <p className="font-semibold">Final Privacy Level</p>
                        <Progress value={privacy} className="mt-1" />
                    </div>
                    <div>
                        <p className="font-semibold">Final Security Score</p>
                        <Progress value={security} className="mt-1" />
                    </div>
                </div>
                
                <h3 className="font-semibold mb-2">Exposed Information:</h3>
                {exposedData.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                        {exposedData.map(data => <Badge key={data} variant="destructive">{data}</Badge>)}
                    </div>
                ) : (
                    <p className="text-green-600">Great job! You kept your data private.</p>
                )}

                 <div className="text-center mt-6">
                    <p className="text-lg">Your Final Score:</p>
                    <p className="text-5xl font-bold text-primary">{finalScore}</p>
                    <Button onClick={() => onComplete(finalScore)} className="mt-4 w-full">
                        Complete Challenge
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
  }


  const currentScenario = storyScenarios[step];

  return (
    <Card className="max-w-2xl mx-auto">
        <CardHeader>
            <div className="flex justify-between items-center mb-2">
                <CardTitle className="text-2xl">{challenge.title}</CardTitle>
                <span className="text-sm font-bold">{step + 1} / {storyScenarios.length}</span>
            </div>
            <div className="space-y-2">
                <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Privacy:</span>
                    <Progress value={privacy} />
                </div>
                <div className="flex items-center gap-2">
                    <Footprints className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Security:</span>
                    <Progress value={security} />
                </div>
            </div>
        </CardHeader>
        <CardContent>
            <AnimatePresence mode="wait">
                <motion.div
                    key={step}
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    transition={{ duration: 0.3 }}
                >
                    <p className="text-lg font-semibold mb-6 text-center">{currentScenario.text}</p>
                    <div className="space-y-4">
                        {currentScenario.choices.map((choice, index) => (
                            <Button
                                key={index}
                                variant="outline"
                                className="w-full h-auto text-wrap justify-start p-4"
                                onClick={() => handleChoice(choice)}
                            >
                                {choice.text}
                            </Button>
                        ))}
                    </div>
                </motion.div>
            </AnimatePresence>
        </CardContent>
    </Card>
  );
}
