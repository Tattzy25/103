import React from "react";
import { HalftoneDotInterface } from "../ui/halftone-dot-interface";

type BridgitState =
  | "idle"
  | "listening"
  | "connecting"
  | "processing"
  | "speaking"
  | "error";

interface MainInterfaceProps {
  state: BridgitState;
  isRecording: boolean;
  audioVolume: number;
  onDotClick: () => void;
}

export const MainInterface: React.FC<MainInterfaceProps> = ({
  state,
  isRecording,
  audioVolume,
  onDotClick,
}) => {
  return (
    <div className="relative">
      <HalftoneDotInterface
        isListening={isRecording}
        isSpeaking={state === "speaking"}
        onClick={onDotClick}
        className="mx-auto"
        audioVolume={audioVolume}
        isRecording={isRecording}
      />
    </div>
  );
};
