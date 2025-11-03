"use client";
import { Award, LogOut, BarChart, LogIn } from "lucide-react";
import { useAppState } from "@/components/providers/AppStateProvider";
import { CHALLENGE_DATA } from "@/lib/challenges-data";
import Link from "next/link";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { ThemeToggle } from "@/components/ThemeToggle";
import Image from "next/image";
export const Navbar = () => {
  const { team, loading, state, backToMenu, logout } = useAppState();
  const progress =
    (state.challengesCompleted.filter(Boolean).length / CHALLENGE_DATA.length) *
    100;
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-b">
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        {/* Left section */}

        <div>
          <Link href="/" className="flex items-center gap-2 mr-20 pr-12">
            <Image alt="logo" src={"/logo.svg"} width={100} height={100} />
          </Link>
        </div>
        {/* Center section */}
        {/* <div className="flex items-center justify-center">
          <Link href="/leaderboard">
            <h1 className="text-md md:text-md font-black tracking-tighter bg-gradient-to-r from-primary via-accent to-primary text-white px-3 py-1 rounded-xl text-center">
              Global Leaderboard
            </h1>
          </Link>
        </div> */}

        {/* Right section */}
        <div className="flex items-center gap-4">
          {team &&
            state.status === "in-progress" &&
            state.activeChallengeId && (
              <Button variant="ghost" onClick={backToMenu}>
                Back to Challenges
              </Button>
            )}
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2">
              <Award className="h-7 w-7 text-primary" />
                 {!team?.isAdmin && (
              <span className="font-bold text-lg hidden sm:inline">
             
                  {team?.name ? team.name : "Team"}
                
              </span>
             ) }
            </Link>
          </div>

          {team && !team.isAdmin && (
            <>
              <div className="flex items-center gap-2">
                {/* <BarChart className="h-5 w-5" /> */}
                <span className="font-semibold">
                  Current score:
                  <span className="border p-2 ml-2 rounded-md transform transition-transform duration-200 hover:scale-110 hover:font-bold inline-block">
                    {state.totalScore}
                  </span>
                </span>
              </div>
              <div className="hidden md:block w-24">
                <Progress value={progress} className="h-2" />
              </div>
            </>
          )}

          {team && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              title="Logout"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          )}
          {!team && !loading && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push("/login")}
              title="Login"
            >
              <LogIn className="h-5 w-5" />
            </Button>
          )}
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
};

export default Navbar;
