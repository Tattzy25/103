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
              "relative p-4 rounded-full border-2 transition-all duration-300 btn-gradient font-sans bg-black border-bridgit-purple hover:border-bridgit-purple",
              currentMode === 'solo' && 'border-bridgit-purple glow-bridgit-green'
            )}
          >
            <span className="text-white font-semibold text-lg font-orbitron">SOLO</span>

          </button>
          {/* Coach Mode */}
          <button
            onClick={() => onModeChange("coach")}
            className={cn(
              "relative p-4 rounded-full border-2 transition-all duration-300 btn-gradient font-sans bg-black border-bridgit-purple hover:border-bridgit-purple",
              currentMode === 'coach' && 'border-bridgit-purple glow-bridgit-green'
            )}
          >
            <span className="text-white font-semibold text-lg font-orbitron">COACH</span>

          </button>
          {/* Host Mode */}
          <button
            onClick={() => onModeChange("host")}
            className={cn(
              "relative p-4 rounded-full border-2 transition-all duration-300 btn-gradient font-sans bg-black border-bridgit-purple hover:border-bridgit-purple",
              currentMode === 'host' && 'border-bridgit-purple glow-bridgit-green'
            )}
          >
            <span className="text-white font-semibold text-lg font-orbitron">HOST</span>

          </button>
          {/* Join Mode */}
          <button
            onClick={() => onModeChange("join")}
            className={cn(
              "relative p-4 rounded-full border-2 transition-all duration-300 btn-gradient font-sans bg-black border-bridgit-purple hover:border-bridgit-purple",
              currentMode === 'join' && 'border-bridgit-purple glow-bridgit-green'
            )}
          >
            <span className="text-white font-semibold text-lg font-orbitron">JOIN</span>

          </button>
        </div>

        {/* Code Generation/Input Section */}
        {currentMode === "host" && (
          <div className="space-y-3 p-4 rounded-lg bg-black/50">
            <div className="flex space-x-2 rounded-lg border-2 border-bridgit-purple p-2 shadow-[0_0_20px_rgba(192,38,211,0.7)]">
              <button
                onClick={generateCode}
                className="flex-1 p-2 bg-black/50 border border-bridgit-purple rounded-xl text-white placeholder-white/50 text-center text-lg tracking-widest font-orbitron shadow-lg shadow-bridgit-purple/50"
              >
                {generatedCode ? <span className="font-roboto-condensed">{generatedCode}</span> : "GET ACCESS CODE"}
              </button>
              <button
                onClick={copyCode}
                disabled={!generatedCode}
                className="p-2 bg-black text-white disabled:opacity-50 btn-gradient"
                title="Copy access code"
              >
                <Copy size={20} />
              </button>
              <button
                onClick={shareCode}
                disabled={!generatedCode}
                className="p-2 bg-black text-white disabled:opacity-50 btn-gradient"
                title="Share access code"
              >
                <Share2 size={20} />
              </button>
            </div>
          </div>
        )}

        {currentMode === "join" && (
          <div className="space-y-3 p-4 rounded-lg bg-black/50">
            <div className="rounded-lg border-2 border-bridgit-purple p-2 shadow-[0_0_20px_rgba(192,38,211,0.7)]">
              <input
                type="text"
                value={accessCode}
                onChange={(e) => setAccessCode(e.target.value.toUpperCase())}
                placeholder="ENTER ACCESS CODE"
                className="w-full p-2 bg-black/50 rounded-xl text-white placeholder-white/50 text-center text-lg tracking-widest font-orbitron shadow-lg shadow-bridgit-purple/50 focus:outline-none focus:ring-2 focus:ring-bridgit-purple focus:border-transparent"
                maxLength={6}
              />
            </div>
          </div>
        )}

        {/* Language Selection */}
        <div className="grid grid-cols-2 gap-4 pt-4">
          <div className="col-span-2 flex justify-center -mt-2 mb-2">
            <button
              onClick={() => {
                const temp = fromLanguage;
                setFromLanguage(toLanguage);
                setToLanguage(temp);
              }}
              className="p-2 rounded-full bg-black border border-white text-white hover:bg-gray-800 transition-colors"
              title="Swap Languages"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-left-right"><path d="M8 3L4 7L8 11"/><path d="M4 7H20"/><path d="M16 21L20 17L16 13"/><path d="M20 17H4"/></svg>
            </button>
          </div>
          {/* From Language */}
          <div className="relative">
            {/* Language Dropdown Buttons */}
            <button
              onClick={() => setShowFromDropdown(!showFromDropdown)}
              className="w-full p-3 border border-bridgit-purple rounded-full flex items-center justify-between text-white btn-gradient font-orbitron"
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
              className="w-full p-3 border border-bridgit-purple rounded-full flex items-center justify-between text-white btn-gradient font-orbitron"
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
          className="w-full p-4 rounded-full text-white font-semibold text-lg glow-purple hover:scale-105 transition-transform btn-gradient font-sans mt-24"
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
           
  <div className="space-y-6"></div>
    <span className="text-sm uppercase tracking-wider">BACK</span>
    </button>

    {/* Your Lab Header Image */}
    <div className="w-full flex justify-center mb-6">
      <img
        src="https://i.imgur.com/Mr33MAH.png"
        alt="Your Lab"
        className="w-[240px] sm:w-[280px] md:w-[320px] h-auto"
      />
    </div>

    {/* Lab Options Grid - Responsive Centered */}
    <div className="flex flex-col items-center justify-center w-full space-y-6">
      {/* Top Row */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        {/* Settings */}
        <button
          className={cn(
            "group relative w-32 h-32 rounded-full flex flex-col items-center justify-center hover:scale-110 transition-all duration-300 glow-purple btn-gradient font-sans"
          )}
        >
          <Settings size={32} className="text-white mb-2" />
          <span className="text-sm text-white font-semibold text-center leading-tight">SETTINGS</span>
        </button>
        {/* Voice Lab */}
        <button
          className="group relative w-32 h-32 rounded-full flex flex-col items-center justify-center hover:scale-110 transition-all duration-300 glow-purple btn-gradient font-sans"
        >
          <Mic size={32} className="text-white mb-2" />
          <span className="text-sm text-white font-semibold text-center leading-tight">VOICE<br/>LAB</span>
        </button>
      </div>

      {/* Bottom Row */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        {/* Language Lab */}
        <button
          className="group relative w-32 h-32 rounded-full flex flex-col items-center justify-center hover:scale-110 transition-all duration-300 glow-purple btn-gradient font-sans"
        >
          <Languages size={32} className="text-white mb-2" />
          <span className="text-sm text-white font-semibold text-center leading-tight">LANGUAGE<br/>LAB</span>
        </button>
        {/* Coach Settings */}
        <button
          className="group relative w-32 h-32 rounded-full flex flex-col items-center justify-center hover:scale-110 transition-all duration-300 glow-purple btn-gradient font-sans"
        >
          <Settings size={32} className="text-white mb-2" />
          <span className="text-sm text-white font-semibold text-center leading-tight">
            COACH<br />SETTINGS
          </span>
        </button>
      </div>
    </div>
  </div>
        )}
      </div>
    </div>
  );
};
