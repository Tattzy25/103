import React, { useState, useEffect } from "react";
import { HalftoneDotInterface } from "./halftone-dot-interface";
import { cn } from "@/lib/utils";

type BridgitState =
  | "idle"
  | "listening"
  | "connecting"
  | "processing"
  | "speaking"
  | "error";

interface BridgitInterfaceProps {
  mode?: "solo" | "host" | "join" | "coach";
  onMenuClick?: () => void;
}

const statusMessages = {
  idle: "Tap to start conversation",
  listening: "BRIDGIT IS LISTENING...",
  connecting: "BRIDGIT CONNECTING...",
  processing: "BRIDGIT PROCESSING...",
  speaking: "BRIDGIT SPEAKING...",
  error: "CONNECTION ERROR",
};

const dynamicIntros = [
  "Hi this is Bridgit! How's it going today?",
  "Hello! Bridgit here, ready to help you communicate!",
  "Hey there! Bridgit at your service, what's on your mind?",
  "Greetings! I'm Bridgit, your voice translation companion!",
  "Hi! Bridgit here, excited to break down language barriers with you!",
];

export const BridgitInterface: React.FC<BridgitInterfaceProps> = ({
  mode = "solo",
  onMenuClick,
}) => {
  const [state, setState] = useState<BridgitState>("idle");
  const [currentIntro, setCurrentIntro] = useState("");
  const [isFirstTime, setIsFirstTime] = useState(true);

  const getRandomIntro = () => {
    const randomIndex = Math.floor(Math.random() * dynamicIntros.length);
    return dynamicIntros[randomIndex];
  };

  const handleDotClick = () => {
    if (state === "idle") {
      // First tap - show intro and start listening
      if (isFirstTime) {
        setCurrentIntro(getRandomIntro());
        setState("speaking");
        setIsFirstTime(false);

        // Simulate speaking duration then switch to listening
        setTimeout(() => {
          setState("listening");
        }, 3000);
      } else {
        // Subsequent interactions - go straight to listening
        setState("listening");
      }
    }
  };

  const handleMenuClick = () => {
    onMenuClick?.();
  };

  useEffect(() => {
    // Simulate voice activity detection for demo
    if (state === "listening") {
      const timeout = setTimeout(() => {
        setState("processing");
        setTimeout(() => {
          setState("speaking");
          setTimeout(() => {
            setState("listening");
          }, 2000);
        }, 1500);
      }, 5000);

      return () => clearTimeout(timeout);
    }
  }, [state]);

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center relative overflow-hidden">


      {/* Header */}
      <header className="absolute top-0 left-0 w-full flex justify-center items-center p-4 md:p-6 z-20">
        <img
          src="https://i.imgur.com/mkTjkcj.png"
          alt="BRIDGIT-AI Header"
          className="w-full max-w-md md:max-w-lg h-auto object-contain"
        />
      </header>

      {/* 3D Menu Button */}
      <button
        onClick={handleMenuClick}
        className={cn(
          "absolute top-8 right-8 z-20",
          "w-16 h-16 rounded-xl",
          "flex items-center justify-center",
          "text-2xl font-bold text-white",
          "transition-all duration-200",
          "hover:scale-110 hover:glow-purple",
          "active:scale-95",
          "btn-3d animate-float",
        )}
      >
        <img src="https://i.imgur.com/GFn6kle.png" alt="Menu" className="w-full h-full object-contain" />
      </button>

      {/* Main Interface */}
      <div className="flex flex-col items-center justify-center space-y-8 z-10 pt-32 md:pt-48">
        {/* Central Halftone Dot Interface */}
        <div className="relative">
          <HalftoneDotInterface
            isListening={state === "listening"}
            isSpeaking={state === "speaking"}
            onClick={handleDotClick}
            className="mx-auto"
          />

          {/* Pulse rings for active states */}
          {(state === "listening" || state === "speaking") && (
            <>
              <div className="absolute inset-0 rounded-full border-2 border-bridgit-purple/30 animate-ping" />
              <div
                className="absolute inset-0 rounded-full border border-bridgit-blue/20 animate-ping"
                style={{ animationDelay: "0.5s" }}
              />
            </>
          )}
        </div>

        {/* Status Text */}
        <div className="text-center space-y-4">
          <p
            className={cn(
              "text-xl md:text-2xl font-medium tracking-wide transition-all duration-300",
              state === "listening" &&
                "text-bridgit-blue text-glow-blue animate-pulse",
              state === "speaking" && "text-bridgit-purple text-glow-purple",
              state === "processing" && "text-bridgit-cyan text-glow-cyan",
              state === "connecting" && "text-bridgit-pink text-glow-pink",
              state === "error" && "text-red-400 text-glow-pink",
              state === "idle" && "text-gray-400",
            )}
          >
            {statusMessages[state]}
          </p>

          {/* Current intro display */}
          {currentIntro && state === "speaking" && (
            <div className="max-w-md mx-auto p-4 rounded-lg glass-dark">
              <p className="text-bridgit-purple text-glow-purple text-lg">
                "{currentIntro}"
              </p>
            </div>
          )}

          {/* Mode indicator */}
          <div className="flex items-center justify-center space-x-2">
            <div
              className={cn(
                "w-2 h-2 rounded-full",
                mode === "solo" && "bg-bridgit-purple animate-pulse",
                mode === "host" && "bg-bridgit-blue animate-pulse",
                mode === "join" && "bg-bridgit-cyan animate-pulse",
                mode === "coach" && "bg-bridgit-pink animate-pulse",
              )}
            />
            <span className="text-sm uppercase tracking-wider text-gray-400">
              {mode} MODE
            </span>
          </div>
        </div>
      </div>

      {/* Bottom ambient glow */}
      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-96 h-32 bg-gradient-to-t from-bridgit-purple/20 to-transparent blur-3xl" />
    </div>
  );
};
