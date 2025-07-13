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
  onStartRecording: () => void;
  onStopRecording: () => void;
  isRecording: boolean;
  audioVolume: number;
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
  onStartRecording,
  onStopRecording,
  isRecording,
  audioVolume,
}) => {
  const [state, setState] = useState<BridgitState>("idle");
  const [currentIntro, setCurrentIntro] = useState("");
  const [isFirstTime, setIsFirstTime] = useState(true);

  const getRandomIntro = () => {
    const randomIndex = Math.floor(Math.random() * dynamicIntros.length);
    return dynamicIntros[randomIndex];
  };

  const handleDotClick = () => {
    if (!isRecording) {
      onStartRecording();
      setState("listening");
    } else {
      onStopRecording();
      setState("idle");
    }
  };

  const handleMenuClick = () => {
    onMenuClick?.();
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center relative overflow-hidden">
      {/* Luxury background overlay */}
      <div className="absolute inset-0 luxury-gradient-overlay opacity-30" />
      <div className="absolute inset-0 luxury-dots opacity-20" />

      {/* Header */}
      <header className="absolute top-0 left-0 w-full flex justify-center items-center p-6 md:p-8 z-20">
        <div className="glass-luxury rounded-2xl p-4 shadow-luxury">
          <img
            src="https://i.imgur.com/mkTjkcj.png"
            alt="BRIDGIT-AI Header"
            className="w-full max-w-md md:max-w-lg h-auto object-contain"
          />
        </div>
      </header>

      {/* Premium Menu Button */}
      <button
        onClick={handleMenuClick}
        className={cn(
          "absolute top-8 right-8 z-20",
          "w-16 h-16 rounded-2xl",
          "flex items-center justify-center",
          "transition-all duration-300",
          "btn-luxury shadow-luxury",
          "hover:scale-110 hover:glow-luxury",
          "active:scale-95",
          "animate-elegant-float",
        )}
      >
        <img src="https://i.imgur.com/GFn6kle.png" alt="Menu" className="w-full h-full object-contain opacity-90" />
      </button>

      {/* Main Interface */}
      <div className="flex flex-col items-center justify-center space-y-12 z-10 pt-40 md:pt-56 animate-fade-in-up">
        {/* Central Interface Container */}
        <div className="relative">
          <HalftoneDotInterface
            isListening={isRecording}
            isSpeaking={state === "speaking"}
            onClick={handleDotClick}
            className="mx-auto"
            audioVolume={audioVolume}
            isRecording={isRecording}
          />

          {/* Elegant pulse rings for active states */}
          {(state === "listening" || state === "speaking") && (
            <>
              <div className="absolute inset-0 rounded-full border border-primary/20 animate-luxury-pulse" />
              <div
                className="absolute inset-0 rounded-full border border-accent/15 animate-luxury-pulse"
                style={{ animationDelay: "1s" }}
              />
            </>
          )}
        </div>

        {/* Status Text Section */}
        <div className="text-center space-y-6 max-w-2xl mx-auto px-6">
          <p
            className={cn(
              "text-2xl md:text-3xl font-luxury-display tracking-wide transition-all duration-500",
              state === "listening" && "text-primary text-glow-luxury animate-luxury-pulse",
              state === "speaking" && "text-primary text-glow-luxury",
              state === "processing" && "text-accent text-glow-gold",
              state === "connecting" && "text-primary text-glow-luxury",
              state === "error" && "text-destructive text-glow-luxury",
              state === "idle" && "text-muted-foreground",
            )}
          >
            {statusMessages[state]}
          </p>

          {/* Current intro display */}
          {currentIntro && state === "speaking" && (
            <div className="glass-luxury-dark rounded-2xl p-6 shadow-luxury animate-fade-in-up">
              <p className="text-primary text-glow-luxury text-lg font-luxury">
                "{currentIntro}"
              </p>
            </div>
          )}

          {/* Premium Mode indicator */}
          <div className="flex items-center justify-center space-x-3 glass-luxury rounded-full px-6 py-3 shadow-luxury">
            <div
              className={cn(
                "w-3 h-3 rounded-full transition-all duration-300",
                mode === "solo" && "bg-primary shadow-purple animate-luxury-pulse",
                mode === "host" && "bg-accent shadow-gold animate-luxury-pulse",
                mode === "join" && "bg-primary shadow-purple animate-luxury-pulse",
                mode === "coach" && "bg-accent shadow-gold animate-luxury-pulse",
              )}
            />
            <span className="text-sm font-brand uppercase tracking-wider text-foreground/80">
              {mode} MODE
            </span>
          </div>
        </div>
      </div>

      {/* Premium ambient effects */}
      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-[600px] h-40 bg-gradient-to-t from-primary/10 via-accent/5 to-transparent blur-3xl" />
      <div className="absolute top-1/2 left-0 w-40 h-[400px] bg-gradient-to-r from-primary/5 to-transparent blur-3xl" />
      <div className="absolute top-1/2 right-0 w-40 h-[400px] bg-gradient-to-l from-accent/5 to-transparent blur-3xl" />
    </div>
  );
};
