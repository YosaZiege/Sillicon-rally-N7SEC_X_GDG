"use client";

import { useState } from "react";
import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { ChallengeProps } from "@/lib/types";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { Download, CheckCircle, XCircle, Flag } from "lucide-react";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

// Target coordinates (rounded to three decimals)
const TARGET_COORDS = {
  lat: parseFloat(process.env.TARGET_LAT || '-33.717'),
  lng: parseFloat(process.env.TARGET_LNG || '150.98'),
};const CLOSE_ENOUGH_DISTANCE = 5; // km - distance within which flag is revealed

const OsintGeoguessr = ({ onComplete, challenge }: ChallengeProps) => {
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [result, setResult] = useState<{
    distance: number;
    score: number;
    isClose: boolean;
  } | null>(null);
  const [showFlag, setShowFlag] = useState(false);
  const [attempts, setAttempts] = useState(0);

  const haversineDistance = (
    coords1: { lat: number; lng: number },
    coords2: { lat: number; lng: number },
  ) => {
    const R = 6371; // Radius of the Earth in km
    const dLat = ((coords2.lat - coords1.lat) * Math.PI) / 180;
    const dLon = ((coords2.lng - coords1.lng) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((coords1.lat * Math.PI) / 180) *
        Math.cos((coords2.lat * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
  };

  const handleGuess = () => {
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);

    if (isNaN(lat) || isNaN(lng)) {
      alert("Please enter valid coordinates");
      return;
    }

    if (lat < -90 || lat > 90) {
      alert("Latitude must be between -90 and 90");
      return;
    }

    if (lng < -180 || lng > 180) {
      alert("Longitude must be between -180 and 180");
      return;
    }

    const userCoords = { lat, lng };
    const distance = haversineDistance(userCoords, TARGET_COORDS);
    const isClose = distance <= CLOSE_ENOUGH_DISTANCE;
    const score = Math.max(0, Math.round(5000 - distance * 10));

    setResult({ distance, score, isClose });
    setAttempts((prev) => prev + 1);

    // Show flag if close enough
    if (isClose) {
      setShowFlag(true);
    }
  };

  const handleReset = () => {
    setResult(null);
    setLatitude("");
    setLongitude("");
    setShowFlag(false);
  };

  const handleComplete = () => {
    onComplete(400);
  };

  const downloadImage = () => {
    const link = document.createElement("a");
    link.href = "/osint.jpg";
    link.download = "osint-challenge.jpg";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>{challenge.title}</CardTitle>
          <div className="text-right">
            <div className="font-bold text-lg">Attempts: {attempts}</div>
            {result && (
              <div className="text-sm text-muted-foreground">
                Score: {result.score}
              </div>
            )}
          </div>
        </div>
        <CardDescription>
          Analyze the image and submit the coordinates. Get within{" "}
          {CLOSE_ENOUGH_DISTANCE}km to reveal the flag!
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Image Section */}
          <div className="text-center">
            <div className="relative aspect-video rounded-lg overflow-hidden border max-w-2xl mx-auto mb-4">
              <img
                src="/osint.jpg"
                alt="OSINT Challenge Location"
                className="w-full h-full object-cover"
              />
            </div>
            <Button onClick={downloadImage} variant="outline" className="gap-2">
              <Download className="w-4 h-4" />
              Download Image for Analysis
            </Button>
          </div>

          {/* Coordinate Input Section */}
          <div className="grid md:grid-cols-2 gap-4 max-w-md mx-auto">
            <div className="space-y-2">
              <Label htmlFor="latitude">Latitude</Label>
              <Input
                id="latitude"
                type="number"
                step="any"
                placeholder=""
                value={latitude}
                onChange={(e) => setLatitude(e.target.value)}
                disabled={!!result}
              />
              <p className="text-sm text-muted-foreground">
                Between -90 and 90
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="longitude">Longitude</Label>
              <Input
                id="longitude"
                type="number"
                step="any"
                placeholder=""
                value={longitude}
                onChange={(e) => setLongitude(e.target.value)}
                disabled={!!result}
              />
              <p className="text-sm text-muted-foreground">
                Between -180 and 180
              </p>
            </div>
          </div>

          {/* Instructions */}
          <div className="text-center text-sm text-muted-foreground max-w-2xl mx-auto">
            <p>
              Use OSINT techniques to analyze the image and determine its exact
              geographic location.
            </p>
            <p>Submit coordinates with up to 3 decimal places for precision.</p>
          </div>
        </div>

        {/* Results */}
        {showFlag && (
          <Alert className="mt-6 bg-green-50 border-green-200">
            <Flag className="h-4 w-4" />
            <AlertTitle>Flag Found!</AlertTitle>
            <AlertDescription>
              <strong>Congratulations!</strong> You found the location within{" "}
              {CLOSE_ENOUGH_DISTANCE}km.
              <br />
              <code className="mt-2 px-3 py-2 bg-black text-white rounded text-lg font-mono block w-fit">
                FLAG: {TARGET_COORDS.lat.toFixed(3)},
                {TARGET_COORDS.lng.toFixed(3)}
              </code>
            </AlertDescription>
          </Alert>
        )}

        {result && !showFlag && (
          <Alert
            variant={result.distance <= 50 ? "default" : "destructive"}
            className="mt-6"
          >
            {result.distance <= 50 ? (
              <CheckCircle className="h-4 w-4" />
            ) : (
              <XCircle className="h-4 w-4" />
            )}
            <AlertTitle>
              {result.distance <= 50 ? "Getting Close!" : "Too Far!"}
            </AlertTitle>
            <AlertDescription>
              Your guess was {Math.round(result.distance)} km away. You need to
              be within {CLOSE_ENOUGH_DISTANCE}km to get the flag. Keep trying!
            </AlertDescription>
          </Alert>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 mt-6 justify-center">
          {!result ? (
            <Button
              onClick={handleGuess}
              disabled={!latitude || !longitude}
              size="lg"
            >
              Submit Coordinates
            </Button>
          ) : (
            <>
              <Button onClick={handleReset} variant="outline">
                Try Again
              </Button>
              <Button onClick={handleComplete}>Complete Challenge</Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default OsintGeoguessr;
