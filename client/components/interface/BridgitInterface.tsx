import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { InterfaceHeader } from "./InterfaceHeader";
import { MenuButton } from "./MenuButton";
import { MainInterface } from "./MainInterface";
import { StatusDisplay } from "./StatusDisplay";
import { RecordingControls } from "./RecordingControls";

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
  hasRecording?: boolean;
  isProcessing?: boolean;
  transcription?: string;
  translation?: string;
  onSendRecording?: () => void;
  onReRecord?: () => void;
}

export const BridgitInterface: React.FC<BridgitInterfaceProps> = ({
  mode = "solo",
  onMenuClick,
  onStartRecording,
  onStopRecording,
  isRecording,
  audioVolume,
  hasRecording = false,
  isProcessing = false,
  transcription,
  translation,
  onSendRecording,
  onReRecord,
}) => {
  const [state, setState] = useState<BridgitState>("idle");
  const [currentIntro, setCurrentIntro] = useState("");

  const handleDotClick = () => {
    if (!isRecording) {
      onStartRecording();
      setState("listening");
    } else {
      onStopRecording();
      setState("idle");
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center relative overflow-hidden">

      <InterfaceHeader />
      
      {/* Menu button positioned at top right corner */}
      <div className="absolute top-6 right-6 z-50">
        <MenuButton onClick={onMenuClick} />
      </div>

      {/* Main Interface - Clean and Simple */}
      <div className="flex flex-col items-center justify-center space-y-12 z-10 animate-fade-in-up mt-20">
        {/* Halftone Dots Interface */}
        <MainInterface
          state={isProcessing ? "processing" : isRecording ? "listening" : "idle"}
          isRecording={isRecording}
          audioVolume={audioVolume}
          onDotClick={handleDotClick}
        />

        <StatusDisplay
          state={isProcessing ? "processing" : isRecording ? "listening" : "idle"}
          currentIntro={currentIntro}
          mode={mode}
        />
      </div>
    </div>
  );
};
