import React from "react";
import { cn } from "@/lib/utils";

type BridgitState =
  | "idle"
  | "listening"
  | "connecting"
  | "processing"
  | "speaking"
  | "error";

interface StatusDisplayProps {
  state: BridgitState;
  currentIntro: string;
  mode: "solo" | "host" | "join" | "coach";
}

const statusMessages = {
  idle: "Tap to start conversation",
  listening: "LISTENING",
  connecting: "CONNECTING",
  processing: "PROCESSING",
  speaking: "SPEAKING",
  error: "CONNECTION ERROR",
};

export const StatusDisplay: React.FC<StatusDisplayProps> = ({
  state,
  currentIntro,
  mode,
}) => {
  return (
    <div className="text-center space-y-6 max-w-2xl mx-auto px-6">
      {/* Current intro display */}
      {currentIntro && state === "speaking" && (
        <div className="glass-luxury-dark rounded-2xl p-6 shadow-luxury animate-fade-in-up">
          <p className="text-primary text-glow-luxury text-lg font-luxury">
            "{currentIntro}"
          </p>
        </div>
      )}

      {/* Clean Mode indicator - no background */}
      <div className="flex items-center justify-center space-x-3">
        <div
          className={cn(
            "w-2 h-2 rounded-full transition-all duration-300",
            mode === "solo" && "bg-primary/60",
            mode === "host" && "bg-accent/60",
            mode === "join" && "bg-primary/60",
            mode === "coach" && "bg-accent/60",
          )}
        />
        <span className="text-xs font-brand uppercase tracking-wider text-foreground/40">
          {mode}
        </span>
      </div>
    </div>
  );
};
