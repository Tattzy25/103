import React, { useState } from "react";
import {
  ChevronDown,
  Copy,
  Share2,
  Settings,
  Mic,
  Languages,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface MenuSystemProps {
  isOpen: boolean;
  onClose: () => void;
  currentMode: "solo" | "host" | "join" | "coach";
  onModeChange: (mode: "solo" | "host" | "join" | "coach") => void;
}

const languages = [
  { code: "en", name: "English", flag: "🇺🇸" },
  { code: "es", name: "Spanish", flag: "🇪🇸" },
  { code: "fr", name: "French", flag: "🇫🇷" },
  { code: "de", name: "German", flag: "🇩🇪" },
  { code: "it", name: "Italian", flag: "🇮🇹" },
  { code: "pt", name: "Portuguese", flag: "🇵🇹" },
  { code: "ru", name: "Russian", flag: "🇷🇺" },
  { code: "ja", name: "Japanese", flag: "🇯🇵" },
  { code: "ko", name: "Korean", flag: "🇰🇷" },
  { code: "zh", name: "Chinese", flag: "🇨🇳" },
];

export const MenuSystem: React.FC<MenuSystemProps> = ({
  isOpen,
  onClose,
  currentMode,
  onModeChange,
}) => {
  const [fromLanguage, setFromLanguage] = useState("en");
  const [toLanguage, setToLanguage] = useState("es");
  const [showFromDropdown, setShowFromDropdown] = useState(false);
  const [showToDropdown, setShowToDropdown] = useState(false);
  const [accessCode, setAccessCode] = useState("");
  const [generatedCode, setGeneratedCode] = useState("");
  const [showYourLab, setShowYourLab] = useState(false);

  const generateCode = () => {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    setGeneratedCode(code);
  };

  const copyCode = () => {
    navigator.clipboard.writeText(generatedCode);
  };

  const shareCode = () => {
    if (navigator.share) {
      navigator.share({
        title: "Bridgit AI Access Code",
        text: `Join my voice translation session with code: ${generatedCode}`,
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md">
      {/* Background halftone pattern */}
      <div className="absolute inset-0 halftone-dots opacity-10" />

      {/* Close overlay */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Menu Content */}
      <div className="relative z-10 w-full max-w-md mx-4">
        {!showYourLab ? (
          /* Main Menu */
          <div className="space-y-6">
            {/* Back button */}
            <button
              onClick={onClose}
              className="absolute -top-16 left-0 text-bridgit-purple hover:text-bridgit-blue transition-colors btn-gradient"
            >
              <span className="text-sm uppercase tracking-wider">BACK</span>
            </button>

            {/* Mode Selection */}
            <div className="grid grid-cols-2 gap-4">
              {/* Solo Mode */}
              <button
                onClick={() => onModeChange("solo")}
                className={cn(
                  "relative p-4 rounded-full border-2 transition-all duration-300 btn-gradient font-sans",
                  "bg-gradient-to-r from-bridgit-blue/20 to-bridgit-cyan/20",
                  "border-bridgit-blue/50 hover:border-bridgit-blue",
                  currentMode === "solo" && "border-bridgit-blue glow-blue",
                )}
              >
                <span className="text-bridgit-blue text-glow-blue font-semibold text-lg">SOLO</span>
                {currentMode === "solo" && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse" />
                )}
              </button>
              {/* Coach Mode */}
              <button
                onClick={() => onModeChange("coach")}
                className={cn(
                  "relative p-4 rounded-full border-2 transition-all duration-300 btn-gradient font-sans",
                  "bg-gradient-to-r from-bridgit-purple/20 to-bridgit-pink/20",
                  "border-bridgit-purple/50 hover:border-bridgit-purple",
                  currentMode === "coach" && "border-bridgit-purple glow-purple",
                )}
              >
                <span className="text-bridgit-purple text-glow-purple font-semibold text-lg">COACH</span>
                {currentMode === "coach" && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse" />
                )}
              </button>
              {/* Host Mode */}
              <button
                onClick={() => onModeChange("host")}
                className={cn(
                  "relative p-4 rounded-full border-2 transition-all duration-300 btn-gradient font-sans",
                  "bg-gradient-to-r from-bridgit-cyan/20 to-bridgit-blue/20",
                  "border-bridgit-cyan/50 hover:border-bridgit-cyan",
                  currentMode === "host" && "border-bridgit-cyan glow-cyan",
                )}
              >
                <span className="text-bridgit-cyan text-glow-cyan font-semibold text-lg">HOST</span>
                {currentMode === "host" && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse" />
                )}
              </button>
              {/* Join Mode */}
              <button
                onClick={() => onModeChange("join")}
                className={cn(
                  "relative p-4 rounded-full border-2 transition-all duration-300 btn-gradient font-sans",
                  "bg-gradient-to-r from-bridgit-pink/20 to-bridgit-purple/20",
                  "border-bridgit-pink/50 hover:border-bridgit-pink",
                  currentMode === "join" && "border-bridgit-pink glow-pink",
                )}
              >
                <span className="text-bridgit-pink text-glow-pink font-semibold text-lg">JOIN</span>
                {currentMode === "join" && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse" />
                )}
              </button>
            </div>

            {/* Code Generation/Input Section */}
            {currentMode === "host" && (
              <div className="space-y-3 glass-dark p-4 rounded-lg">
                <h3 className="text-bridgit-cyan text-sm uppercase tracking-wider">
                  CLICK TO GET ACCESS CODE
                </h3>
                <div className="flex space-x-2">
                  <button
                    onClick={generateCode}
                    className="flex-1 p-2 bg-bridgit-cyan/20 border border-bridgit-cyan/50 rounded text-bridgit-cyan btn-gradient"
                  >
                    {generatedCode || "Generate Code"}
                  </button>
                  <button
                    onClick={copyCode}
                    disabled={!generatedCode}
                    className="p-2 bg-bridgit-blue/20 border border-bridgit-blue/50 rounded text-bridgit-blue disabled:opacity-50 btn-gradient"
                    title="Copy access code"
                  >
                    <Copy size={16} />
                  </button>
                </div>
              </div>
            )}

            {currentMode === "join" && (
              <div className="space-y-3 glass-dark p-4 rounded-lg">
                <h3 className="text-bridgit-pink text-sm uppercase tracking-wider">
                  ENTER ACCESS CODE
                </h3>
                <input
                  type="text"
                  value={accessCode}
                  onChange={(e) => setAccessCode(e.target.value.toUpperCase())}
                  placeholder="XXXXXX"
                  className="w-full p-2 bg-black/50 border border-bridgit-pink/50 rounded text-bridgit-pink placeholder-bridgit-pink/50 text-center text-lg tracking-widest"
                  maxLength={6}
                />
              </div>
            )}

            {/* Language Selection */}
            <div className="grid grid-cols-2 gap-4">
              {/* From Language */}
              <div className="relative">
                {/* Language Dropdown Buttons */}
                <button
                  onClick={() => setShowFromDropdown(!showFromDropdown)}
                  className="w-full p-3 border border-bridgit-blue/50 rounded-full flex items-center justify-between text-bridgit-blue btn-gradient font-sans"
                >
                  <span className="flex items-center space-x-2">
                    <span className="text-xl">
                      {languages.find((l) => l.code === fromLanguage)?.flag}
                    </span>
                    <span className="text-sm uppercase">{fromLanguage}</span>
                  </span>
                  <ChevronDown size={16} />
                </button>

                {showFromDropdown && (
                  <div className="absolute top-full mt-2 w-full bg-black/90 border border-bridgit-blue/50 rounded-lg overflow-hidden z-20">
                    {languages.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => {
                          setFromLanguage(lang.code);
                          setShowFromDropdown(false);
                        }}
                        className="w-full p-2 flex items-center space-x-2 hover:bg-bridgit-blue/20 text-left btn-gradient font-sans"
                      >
                        <span className="text-lg">{lang.flag}</span>
                        <span className="text-sm text-bridgit-blue">{lang.code.toUpperCase()}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* To Language */}
              <div className="relative">
                <button
                  onClick={() => setShowToDropdown(!showToDropdown)}
                  className="w-full p-3 border border-bridgit-purple/50 rounded-full flex items-center justify-between text-bridgit-purple btn-gradient font-sans"
                >
                  <span className="flex items-center space-x-2">
                    <span className="text-xl">
                      {languages.find((l) => l.code === toLanguage)?.flag}
                    </span>
                    <span className="text-sm uppercase">{toLanguage}</span>
                  </span>
                  <ChevronDown size={16} />
                </button>

                {showToDropdown && (
                  <div className="absolute top-full mt-2 w-full bg-black/90 border border-bridgit-purple/50 rounded-lg overflow-hidden z-20">
                    {languages.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => {
                          setToLanguage(lang.code);
                          setShowToDropdown(false);
                        }}
                        className="w-full p-2 flex items-center space-x-2 hover:bg-bridgit-purple/20 text-left btn-gradient font-sans"
                      >
                        <span className="text-lg">{lang.flag}</span>
                        <span className="text-sm text-bridgit-purple">{lang.code.toUpperCase()}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Enter Lab Button */}
            <button
              onClick={() => setShowYourLab(true)}
              className="w-full p-4 rounded-full text-white font-semibold text-lg glow-purple hover:scale-105 transition-transform btn-gradient font-sans"
            >
              ENTER LAB
            </button>
          </div>
        ) : (
          /* Your Lab Interface */
          <div className="space-y-6">
            {/* Back button */}
            <button
              onClick={() => setShowYourLab(false)}
              className="absolute -top-16 left-0 text-bridgit-purple hover:text-bridgit-blue transition-colors btn-gradient font-sans"
            >
              <span className="text-sm uppercase tracking-wider">BACK</span>
            </button>

            {/* Your Lab Title */}
            <div className="text-center">
              <h2 className="text-4xl font-bold bg-gradient-to-r from-bridgit-purple to-bridgit-pink bg-clip-text text-transparent text-glow-purple">
                YOUR LAB
              </h2>
            </div>

            {/* Lab Options Grid */}
            <div className="grid grid-cols-3 gap-4">
              {/* Settings */}
              <button className="group relative w-24 h-24 rounded-full flex flex-col items-center justify-center hover:scale-110 transition-all duration-300 glow-purple btn-gradient font-sans">
                <Settings size={24} className="text-bridgit-purple mb-1" />
                <span className="text-xs text-bridgit-purple font-semibold">SETTINGS</span>
              </button>
              {/* Voice Lab */}
              <button className="group relative w-24 h-24 rounded-full flex flex-col items-center justify-center hover:scale-110 transition-all duration-300 glow-pink btn-gradient font-sans">
                <Mic size={24} className="text-bridgit-pink mb-1" />
                <span className="text-xs text-bridgit-pink font-semibold">VOICE LAB</span>
              </button>
              {/* Language Lab */}
              <button className="group relative w-24 h-24 rounded-full flex flex-col items-center justify-center hover:scale-110 transition-all duration-300 glow-cyan btn-gradient font-sans">
                <Languages size={24} className="text-bridgit-cyan mb-1" />
                <span className="text-xs text-bridgit-cyan font-semibold">LANGUAGE LAB</span>
              </button>
              {/* Additional Settings (Bottom Row) */}
              <button className="group relative w-24 h-24 rounded-full flex flex-col items-center justify-center hover:scale-110 transition-all duration-300 glow-blue btn-gradient font-sans">
                <Settings size={20} className="text-bridgit-blue mb-1" />
                <span className="text-xs text-bridgit-blue font-semibold">SETTINGS</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
