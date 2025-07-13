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
  onHostGenerateCode: () => Promise<string>;
  onJoinChannel: (code: string) => Promise<void>;
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
  onHostGenerateCode,
  onJoinChannel,
}) => {
  const [fromLanguage, setFromLanguage] = useState("en");
  const [toLanguage, setToLanguage] = useState("es");
  const [showFromDropdown, setShowFromDropdown] = useState(false);
  const [showToDropdown, setShowToDropdown] = useState(false);
  const [accessCode, setAccessCode] = useState("");
  const [generatedCode, setGeneratedCode] = useState("");
  const [showYourLab, setShowYourLab] = useState(false);

  const handleGenerateCode = async () => {
    try {
      const code = await onHostGenerateCode();
      console.log("Generated code in MenuSystem:", code);
      setGeneratedCode(code);
    } catch (error) {
      console.error("Error generating code:", error);
    }
  };

  const handleCopyCode = () => {
    if (generatedCode) {
      navigator.clipboard.writeText(generatedCode);
    }
  };

  const handleShareCode = () => {
    if (navigator.share && generatedCode) {
      navigator.share({
        title: "Bridgit AI Access Code",
        text: `Join my voice translation session with code: ${generatedCode}`,
      });
    }
  };

  const handleJoinCode = async () => {
    if (accessCode) {
      try {
        await onJoinChannel(accessCode);
        onClose();
      } catch (error) {
        console.error("Error joining channel:", error);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-xl">
      {/* Luxury background overlay */}
      <div className="absolute inset-0 luxury-dots opacity-15" />
      <div className="absolute inset-0 luxury-gradient-overlay opacity-20" />

      {/* Close overlay */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Menu Content */}
      <div className="relative z-10 w-full max-w-lg mx-6 animate-fade-in-up">
        {!showYourLab ? (
          /* Main Menu */
          <div className="glass-luxury-dark rounded-3xl p-8 shadow-luxury-lg space-y-8">
            {/* Back button */}
            <button
              onClick={onClose}
              className="absolute -top-16 left-0 text-primary hover:text-accent transition-colors font-luxury"
            >
              <span className="text-sm uppercase tracking-wider">BACK</span>
            </button>

            {/* Mode Selection */}
            <div className="grid grid-cols-2 gap-6">
              {/* Solo Mode */}
              <button
                onClick={() => onModeChange("solo")}
                className={cn(
                  "relative p-6 rounded-2xl transition-all duration-300 btn-luxury shadow-luxury",
                  currentMode === 'solo' && 'glow-luxury bg-luxury-gradient'
                )}
              >
                <span className="text-white font-brand text-lg">SOLO</span>
              </button>
              
              {/* Coach Mode */}
              <button
                onClick={() => onModeChange("coach")}
                className={cn(
                  "relative p-6 rounded-2xl transition-all duration-300 btn-luxury shadow-luxury",
                  currentMode === 'coach' && 'glow-luxury bg-luxury-gradient'
                )}
              >
                <span className="text-white font-brand text-lg">COACH</span>
              </button>
              
              {/* Host Mode */}
              <button
                onClick={() => onModeChange("host")}
                className={cn(
                  "relative p-6 rounded-2xl transition-all duration-300 btn-luxury shadow-luxury",
                  currentMode === 'host' && 'glow-luxury bg-luxury-gradient'
                )}
              >
                <span className="text-white font-brand text-lg">HOST</span>
              </button>
              
              {/* Join Mode */}
              <button
                onClick={() => onModeChange("join")}
                className={cn(
                  "relative p-6 rounded-2xl transition-all duration-300 btn-luxury shadow-luxury",
                  currentMode === 'join' && 'glow-luxury bg-luxury-gradient'
                )}
              >
                <span className="text-white font-brand text-lg">JOIN</span>
              </button>
            </div>

            {/* Code Generation/Input Section */}
            {currentMode === "host" && (
              <div className="glass-luxury rounded-2xl p-6 shadow-luxury">
                <div className="flex space-x-3">
                  <button
                    onClick={handleGenerateCode}
                    className="flex-1 p-4 btn-luxury rounded-xl text-white text-center text-lg tracking-widest font-brand shadow-luxury"
                  >
                    {generatedCode ? <span className="font-luxury">{generatedCode}</span> : "GET ACCESS CODE"}
                  </button>
                  <button
                    onClick={handleCopyCode}
                    disabled={!generatedCode}
                    className="p-4 btn-luxury rounded-xl text-white disabled:opacity-50 shadow-luxury"
                    title="Copy access code"
                  >
                    <Copy size={20} />
                  </button>
                  <button
                    onClick={handleShareCode}
                    disabled={!generatedCode}
                    className="p-4 btn-luxury rounded-xl text-white disabled:opacity-50 shadow-luxury"
                    title="Share access code"
                  >
                    <Share2 size={20} />
                  </button>
                </div>
              </div>
            )}

            {currentMode === "join" && (
              <div className="glass-luxury rounded-2xl p-6 shadow-luxury space-y-4">
                <input
                  type="text"
                  value={accessCode}
                  onChange={(e) => setAccessCode(e.target.value.toUpperCase())}
                  placeholder="ENTER ACCESS CODE"
                  className="w-full p-4 bg-input rounded-xl text-white placeholder-muted-foreground text-center text-lg tracking-widest font-brand shadow-luxury focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  maxLength={6}
                />
                <button
                  onClick={handleJoinCode}
                  disabled={!accessCode}
                  className="w-full p-4 btn-luxury rounded-xl text-white font-brand disabled:opacity-50 shadow-luxury"
                >
                  ENTER ACCESS CODE
                </button>
              </div>
            )}

            {/* Language Selection */}
            <div className="space-y-4">
              <div className="flex justify-center">
                <button
                  onClick={() => {
                    const temp = fromLanguage;
                    setFromLanguage(toLanguage);
                    setToLanguage(temp);
                  }}
                  className="p-3 rounded-full btn-luxury shadow-luxury text-white hover:glow-luxury transition-all duration-300"
                  title="Swap Languages"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M8 3L4 7L8 11"/><path d="M4 7H20"/><path d="M16 21L20 17L16 13"/><path d="M20 17H4"/>
                  </svg>
                </button>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                {/* From Language */}
                <div className="relative">
                  <button
                    onClick={() => setShowFromDropdown(!showFromDropdown)}
                    className="w-full p-4 btn-luxury rounded-xl flex items-center justify-between text-white font-brand shadow-luxury"
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
                    <div className="absolute top-full mt-2 w-full glass-luxury-dark rounded-xl overflow-hidden z-20 shadow-luxury-lg">
                      {languages.map((lang) => (
                        <button
                          key={lang.code}
                          onClick={() => {
                            setFromLanguage(lang.code);
                            setShowFromDropdown(false);
                          }}
                          className="w-full p-3 flex items-center space-x-2 hover:bg-primary/20 text-left font-luxury"
                        >
                          <span className="text-lg">{lang.flag}</span>
                          <span className="text-sm text-primary">{lang.code.toUpperCase()}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* To Language */}
                <div className="relative">
                  <button
                    onClick={() => setShowToDropdown(!showToDropdown)}
                    className="w-full p-4 btn-luxury rounded-xl flex items-center justify-between text-white font-brand shadow-luxury"
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
                    <div className="absolute top-full mt-2 w-full glass-luxury-dark rounded-xl overflow-hidden z-20 shadow-luxury-lg">
                      {languages.map((lang) => (
                        <button
                          key={lang.code}
                          onClick={() => {
                            setToLanguage(lang.code);
                            setShowToDropdown(false);
                          }}
                          className="w-full p-3 flex items-center space-x-2 hover:bg-primary/20 text-left font-luxury"
                        >
                          <span className="text-lg">{lang.flag}</span>
                          <span className="text-sm text-primary">{lang.code.toUpperCase()}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Enter Lab Button */}
            <button
              onClick={() => setShowYourLab(true)}
              className="w-full p-6 rounded-2xl text-white font-brand text-xl bg-luxury-gradient shadow-luxury-lg hover:scale-105 transition-all duration-300 glow-luxury"
            >
              ENTER LAB
            </button>
          </div>
        ) : (
          /* Your Lab Interface */
          <div className="glass-luxury-dark rounded-3xl p-8 shadow-luxury-lg space-y-8">
            {/* Back button */}
            <button
              onClick={() => setShowYourLab(false)}
              className="absolute -top-16 left-0 text-primary hover:text-accent transition-colors font-luxury"
            >
              <span className="text-sm uppercase tracking-wider">BACK</span>
            </button>

            {/* Your Lab Header Image */}
            <div className="w-full flex justify-center mb-8">
              <div className="glass-luxury rounded-2xl p-4 shadow-luxury">
                <img
                  src="https://i.imgur.com/Mr33MAH.png"
                  alt="Your Lab"
                  className="w-full max-w-xs h-auto rounded-xl"
                />
              </div>
            </div>

            {/* Lab Features */}
            <div className="space-y-6">
              {/* Settings Section */}
              <div className="glass-luxury rounded-2xl p-6 shadow-luxury">
                <div className="flex items-center space-x-3 mb-4">
                  <Settings className="text-primary" size={24} />
                  <h3 className="text-white font-brand text-lg">SETTINGS</h3>
                </div>
                <div className="space-y-3">
                  <button className="w-full p-3 btn-luxury rounded-xl text-white font-luxury text-left">
                    Audio Settings
                  </button>
                  <button className="w-full p-3 btn-luxury rounded-xl text-white font-luxury text-left">
                    Voice Preferences
                  </button>
                  <button className="w-full p-3 btn-luxury rounded-xl text-white font-luxury text-left">
                    Translation Quality
                  </button>
                </div>
              </div>

              {/* Voice Training Section */}
              <div className="glass-luxury rounded-2xl p-6 shadow-luxury">
                <div className="flex items-center space-x-3 mb-4">
                  <Mic className="text-primary" size={24} />
                  <h3 className="text-white font-brand text-lg">VOICE TRAINING</h3>
                </div>
                <div className="space-y-3">
                  <button className="w-full p-3 btn-luxury rounded-xl text-white font-luxury text-left">
                    Record Voice Sample
                  </button>
                  <button className="w-full p-3 btn-luxury rounded-xl text-white font-luxury text-left">
                    Test Voice Clone
                  </button>
                  <button className="w-full p-3 btn-luxury rounded-xl text-white font-luxury text-left">
                    Voice Analytics
                  </button>
                </div>
              </div>

              {/* Language Lab Section */}
              <div className="glass-luxury rounded-2xl p-6 shadow-luxury">
                <div className="flex items-center space-x-3 mb-4">
                  <Languages className="text-primary" size={24} />
                  <h3 className="text-white font-brand text-lg">LANGUAGE LAB</h3>
                </div>
                <div className="space-y-3">
                  <button className="w-full p-3 btn-luxury rounded-xl text-white font-luxury text-left">
                    Custom Phrases
                  </button>
                  <button className="w-full p-3 btn-luxury rounded-xl text-white font-luxury text-left">
                    Pronunciation Guide
                  </button>
                  <button className="w-full p-3 btn-luxury rounded-xl text-white font-luxury text-left">
                    Language Progress
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
