import Leaderboard from "@/components/Leaderboard";

export default function Page() {
  return (
    <div className="flex flex-col items-center justify-center gap-20">
      <h1 className="text-4xl md:text-6xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-primary via-accent to-primary mt-20">
        Global Leaderboard
      </h1>
      <Leaderboard />
    </div>
  );
}
