import React, { useState } from "react";
import { BridgitInterface } from "@/components/ui/bridgit-interface";
import { MenuSystem } from "@/components/ui/menu-system";

type AppMode = "solo" | "host" | "join" | "coach";

const Index: React.FC = () => {
  const [currentMode, setCurrentMode] = useState<AppMode>("solo");
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleModeChange = (mode: AppMode) => {
    setCurrentMode(mode);
  };

  const handleMenuClick = () => {
    setIsMenuOpen(true);
  };

  const handleMenuClose = () => {
    setIsMenuOpen(false);
  };

  return (
    <div className="relative">
      {/* Main Bridgit Interface */}
      <BridgitInterface mode={currentMode} onMenuClick={handleMenuClick} />

      {/* Menu System Overlay */}
      <MenuSystem
        isOpen={isMenuOpen}
        onClose={handleMenuClose}
        currentMode={currentMode}
        onModeChange={handleModeChange}
      />
    </div>
  );
};

export default Index;
