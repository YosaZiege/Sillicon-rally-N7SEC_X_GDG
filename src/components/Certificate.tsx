
"use client";

import { useRef, useState } from 'react';
import { toPng } from 'html-to-image';
import { useAppState } from '@/components/providers/AppStateProvider';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Award, Download, Star } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Certificate() {
  const { state, team } = useAppState();
  const [name, setName] = useState('');
  const certificateRef = useRef<HTMLDivElement>(null);
  
  // Use team name automatically if available
  const displayName = team?.teamName || name;

  const handleDownload = () => {
    if (certificateRef.current === null) {
      return;
    }

    toPng(certificateRef.current, { cacheBust: true, pixelRatio: 2 })
      .then((dataUrl) => {
        const link = document.createElement('a');
        link.download = 'Security_Challenge_Arena_Certificate.png';
        link.href = dataUrl;
        link.click();
      })
      .catch((err) => {
        // Certificate generation failed
      });
  };

  const isChampion = state.totalScore > 600;

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-center text-2xl">Generate Your Certificate</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <div
            ref={certificateRef}
            className="bg-background p-6 border-2 border-primary rounded-lg text-center aspect-[4/3] flex flex-col justify-between"
          >
            <div>
              <div className="flex justify-center items-center gap-2 mb-2">
                <Award className="w-8 h-8 text-yellow-500" />
                <h3 className="text-2xl font-bold text-primary">Certificate of Achievement</h3>
              </div>
              <p className="text-sm text-muted-foreground">This certificate is awarded to</p>
            </div>
            
            <p className={cn("text-3xl font-bold my-4 break-words", displayName ? 'text-foreground' : 'text-muted-foreground')}>
              {displayName || 'Your Name Here'}
            </p>

            <p className="text-sm">
              for successfully completing the <strong>Sillicon rally</strong>
              <br/>
              with a total score of
            </p>
            <p className="text-2xl font-bold text-accent my-2">{state.totalScore}</p>
            
            <div>
              {isChampion && (
                <div className="flex justify-center items-center gap-2 text-yellow-500 font-semibold mb-2">
                  <Star className="w-6 h-6" />
                  <span>SECURITY CHAMPION</span>
                  <Star className="w-6 h-6" />
                </div>
              )}
              <p className="text-xs text-muted-foreground">{new Date().toLocaleDateString()}</p>
            </div>
          </div>
        </div>
        {!team?.teamName && (
          <div className="space-y-2">
            <Label htmlFor="name">Enter Your Name</Label>
            <Input
              id="name"
              placeholder="e.g., Alex Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
        )}
      </CardContent>
      {/*
      <CardFooter>
        <Button onClick={handleDownload} disabled={!displayName} className="w-full">
          <Download className="mr-2 h-4 w-4" />
          Download Certificate
        </Button>
      </CardFooter>
    */}
    </Card>
  );
}
