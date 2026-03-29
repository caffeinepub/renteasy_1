import { Button } from "@/components/ui/button";
import { Gamepad2, Timer, Trophy } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";

type GameState = "idle" | "playing" | "finished";

const GAME_DURATION = 30;

function getMotivation(score: number) {
  if (score < 10) return "Keep tapping! 👊";
  if (score < 30) return "Getting warm! 🌟";
  if (score < 50) return "On fire! 🔥";
  return "Tap Master! 🏆";
}

const TAP_COLORS = [
  "from-blue-500 to-indigo-600",
  "from-purple-500 to-pink-600",
  "from-orange-500 to-yellow-500",
  "from-green-500 to-teal-600",
  "from-red-500 to-rose-600",
];

export default function MiniGamePage() {
  const [gameState, setGameState] = useState<GameState>("idle");
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [tapScale, setTapScale] = useState(1);
  const [colorIndex, setColorIndex] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (gameState === "playing") {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(intervalRef.current!);
            setGameState("finished");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [gameState]);

  const startGame = () => {
    setScore(0);
    setTimeLeft(GAME_DURATION);
    setGameState("playing");
    setColorIndex(0);
  };

  const handleTap = () => {
    if (gameState !== "playing") return;
    setScore((s) => s + 1);
    setTapScale(0.9);
    setColorIndex((prev) => (prev + 1) % TAP_COLORS.length);
    setTimeout(() => setTapScale(1), 100);
  };

  const urgencyColor =
    timeLeft <= 5
      ? "text-red-500"
      : timeLeft <= 10
        ? "text-orange-500"
        : "text-foreground";

  return (
    <div
      className="container mx-auto px-4 py-8 max-w-lg"
      data-ocid="minigame.page"
    >
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Gamepad2 className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold">Tap Frenzy 🎮</h1>
        </div>
        <p className="text-muted-foreground">
          Tap as fast as you can in 30 seconds!
        </p>
      </div>

      {/* Stats bar */}
      {gameState !== "idle" && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-center gap-8 mb-8"
        >
          <div className="text-center">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">
              Score
            </p>
            <p className="text-4xl font-black text-primary">{score}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground uppercase tracking-wide flex items-center gap-1 justify-center">
              <Timer className="w-3 h-3" /> Time
            </p>
            <p className={`text-4xl font-black ${urgencyColor}`}>{timeLeft}s</p>
          </div>
        </motion.div>
      )}

      <AnimatePresence mode="wait">
        {gameState === "idle" && (
          <motion.div
            key="idle"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="text-center py-12"
          >
            <div className="text-6xl mb-6">🎯</div>
            <p className="text-muted-foreground mb-8">
              Tap the button as many times as you can before time runs out!
            </p>
            <Button
              size="lg"
              className="px-10 py-6 text-lg font-bold rounded-full shadow-lg"
              onClick={startGame}
              data-ocid="minigame.primary_button"
            >
              Start Game
            </Button>
          </motion.div>
        )}

        {gameState === "playing" && (
          <motion.div
            key="playing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-6"
          >
            <p className="text-sm text-muted-foreground">
              {getMotivation(score)}
            </p>

            {/* Big tap button */}
            <button
              type="button"
              onClick={handleTap}
              style={{
                transform: `scale(${tapScale})`,
                transition: "transform 0.08s ease",
              }}
              className={`w-48 h-48 rounded-full bg-gradient-to-br ${TAP_COLORS[colorIndex]} text-white font-black text-2xl shadow-2xl cursor-pointer select-none active:brightness-90 transition-all`}
              data-ocid="minigame.canvas_target"
            >
              TAP!
            </button>

            {/* Timer bar */}
            <div className="w-full max-w-xs bg-muted rounded-full h-3">
              <div
                className="h-3 rounded-full bg-primary transition-all duration-1000"
                style={{ width: `${(timeLeft / GAME_DURATION) * 100}%` }}
              />
            </div>
          </motion.div>
        )}

        {gameState === "finished" && (
          <motion.div
            key="finished"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="text-center py-8"
            data-ocid="minigame.success_state"
          >
            <Trophy className="mx-auto h-16 w-16 text-yellow-500 mb-4" />
            <h2 className="text-2xl font-bold mb-2">Time&apos;s Up!</h2>
            <p className="text-muted-foreground mb-2">Your final score:</p>
            <p className="text-6xl font-black text-primary mb-3">{score}</p>
            <p className="text-lg mb-2">{getMotivation(score)}</p>

            {score >= 50 && (
              <p className="text-sm text-yellow-600 font-semibold mb-6">
                🏆 Amazing! You are a true Tap Master!
              </p>
            )}
            {score >= 30 && score < 50 && (
              <p className="text-sm text-orange-600 font-semibold mb-6">
                🔥 Great effort! Almost there!
              </p>
            )}
            {score < 30 && (
              <p className="text-sm text-muted-foreground mb-6">
                Keep practicing to improve your score!
              </p>
            )}

            <Button
              size="lg"
              className="px-10 py-6 text-lg font-bold rounded-full"
              onClick={startGame}
              data-ocid="minigame.primary_button"
            >
              Play Again
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
