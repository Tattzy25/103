import React from "react";
import { Users, UserPlus, User, GraduationCap } from "lucide-react";
import { NeumorphCard } from "../ui/neumorphism-card";

interface ModeSelectorProps {
  currentMode: "solo" | "host" | "join" | "coach";
  onModeChange: (mode: "solo" | "host" | "join" | "coach") => void;
}

export const ModeSelector: React.FC<ModeSelectorProps> = ({
  currentMode,
  onModeChange,
}) => {
  const modes = [
    { id: "host", label: "HOST", icon: Users },
    { id: "join", label: "JOIN", icon: UserPlus },
    { id: "solo", label: "SOLO", icon: User },
    { id: "coach", label: "COACH", icon: GraduationCap },
  ] as const;

  return (
    <div className="grid grid-cols-2 gap-6">
      {modes.map((mode) => {
        const IconComponent = mode.icon;
        return (
          <NeumorphCard
            key={mode.id}
            onClick={() => onModeChange(mode.id)}
            isActive={currentMode === mode.id}
            className="h-24"
          >
            <div className="flex flex-col items-center space-y-2">
              <IconComponent size={24} className="text-white" />
              <span className="text-white font-bold text-lg tracking-wider">
                {mode.label}
              </span>
            </div>
          </NeumorphCard>
        );
      })}
    </div>
  );
};
