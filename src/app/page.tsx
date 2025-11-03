"use client";

import {
  Binary,
  Bot,
  CheckCircle,
  Footprints,
  KeyRound,
  Mail,
  Map,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { useAppState } from "@/components/providers/AppStateProvider";
import { AnimatePresence, motion } from "framer-motion";
import { useMemo, Suspense } from "react";
import Confetti from "react-confetti";
import { useWindowSize } from "react-use";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";

// Dynamically import challenge components
import PasswordMaster from "@/components/challenges/PasswordMaster";
import PhishingDetective from "@/components/challenges/PhishingDetective";
import SecretMessageDecoder from "@/components/challenges/SecretMessageDecoder";
import SpotTheScamQuiz from "@/components/challenges/SpotTheScamQuiz";
import DigitalFootprintSimulator from "@/components/challenges/DigitalFootprintSimulator";
import SocialEngineeringChallenge from "@/components/challenges/SocialEngineeringChallenge";
import CaptchaChallenge from "@/components/challenges/CaptchaChallenge";
import Certificate from "@/components/Certificate";
import { CHALLENGE_DATA } from "@/lib/challenges-data";
import Login from "./login/page";
import AdminDashboard from "./admin/dashboard/page";
import PacmanChallenge from "@/components/challenges/PacmanChallenge";
import ZipFlagChallenge from "@/components/challenges/ZipFlagChallenge";

const OsintGeoguessr = dynamic(
  () => import("@/components/challenges/OsintGeoguessr"),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-full">
        <p>Loading map...</p>
      </div>
    ),
  },
);

const challengeComponents = {
  "password-master": PasswordMaster,
  "phishing-detective": PhishingDetective,
  "secret-message-decoder": SecretMessageDecoder,
  "spot-the-scam": SpotTheScamQuiz,
  "digital-footprint": DigitalFootprintSimulator,
  "osint-geoguessr": OsintGeoguessr,
  "social-engineering": SocialEngineeringChallenge,
  "pacman-challenge": PacmanChallenge,
  "zip-lookup": ZipFlagChallenge,
};

const ChallengeIcon = ({
  id,
  className,
}: {
  id: string;
  className?: string;
}) => {
  const icons: { [key: string]: React.ElementType } = {
    "password-master": KeyRound,
    "phishing-detective": Mail,
    "secret-message-decoder": Binary,
    "spot-the-scam": Bot,
    "digital-footprint": Footprints,
    "osint-geoguessr": Map,
    "captcha-challenge": Bot,
    "social-engineering": Users,
  };
  const Icon = icons[id] || Bot;
  return <Icon className={className} />;
};

export default function Home() {
  const {
    state,
    selectChallenge,
    completeChallenge,
    resetGame,
    team,
    loading,
    logout,
  } = useAppState();

  const { width, height } = useWindowSize();
  const router = useRouter();

  const ActiveChallengeComponent = useMemo(() => {
    if (state.activeChallengeId) {
      return challengeComponents[
        state.activeChallengeId as keyof typeof challengeComponents
      ];
    }
    return null;
  }, [state.activeChallengeId]);

  const progress =
    (state.challengesCompleted.filter(Boolean).length / CHALLENGE_DATA.length) *
    100;

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  const renderContent = () => {
    if (loading) {
      return <div>Loading...</div>;
    }

    if (!team) {
      return <Login />;
    }

    if (team.isAdmin) {
      return <AdminDashboard />;
    }

    if (state.status === "finished") {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 ">
          {state.showConfetti && (
            <Confetti width={width} height={height} recycle={false} />
          )}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-4xl text-center"
          >
            <h1 className="text-4xl md:text-6xl font-black text-primary mb-4">
              Congratulations!
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              You've completed all challenges!
            </p>
            <div className="flex justify-center">
              <Certificate />
            </div>
          </motion.div>
        </div>
      );
    }

    if (ActiveChallengeComponent && state.activeChallengeId) {
      const challengeIndex = CHALLENGE_DATA.findIndex(
        (c) => c.id === state.activeChallengeId,
      );
      return (
        <AnimatePresence mode="wait">
          <motion.div
            key={state.activeChallengeId}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.3 }}
            className="w-full"
          >
            <Suspense fallback={<div>Loading Challenge...</div>}>
              <ActiveChallengeComponent
                onComplete={(score) =>
                  completeChallenge(state.activeChallengeId!, score)
                }
                challenge={CHALLENGE_DATA[challengeIndex]}
              />
            </Suspense>
          </motion.div>
        </AnimatePresence>
      );
    }

    return (
      <div className="flex flex-row flex-wrap justify-center items-center mt-12 gap-6">
        {CHALLENGE_DATA.map((challenge, index) => (
          <motion.div
            key={challenge.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.05 }}
          >
            <Card
              className={`h-[300px] flex flex-col group transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl w-[300px]
          ${
            state.challengesCompleted[index]
              ? "bg-green-500/20 border-green-500 hover:shadow-xl"
              : "bg-white dark:bg-zinc-900 hover:bg-green-500/10 hover:border-primary"
          }
        `}
            >
              <CardHeader>
                <div className="flex justify-between items-start">
                  <ChallengeIcon
                    id={challenge.id}
                    className="w-10 h-10 text-primary mb-4"
                  />
                  {state.challengesCompleted[index] && (
                    <CheckCircle className="w-6 h-6 text-green-500" />
                  )}
                </div>
                <CardTitle>{challenge.title}</CardTitle>
                <CardDescription>{challenge.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow flex flex-col justify-end">
                <Button
                  onClick={() => selectChallenge(challenge.id)}
                  className="w-full mt-4"
                  disabled={state.challengesCompleted[index]}
                >
                  {state.challengesCompleted[index]
                    ? "Completed"
                    : "Start Challenge"}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    );
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-4 md:p-8 relative">
      <div className="flex-grow w-full flex items-center justify-center pt-20">
        <AnimatePresence mode="wait">{renderContent()}</AnimatePresence>
      </div>
    </main>
  );
}
