import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { ModeSelector } from "./ModeSelector";
import { LanguageSelector } from "./LanguageSelector";
import { CodeManager } from "./CodeManager";
import { LabInterface } from "./LabInterface";
import { ArrowUpDown } from "lucide-react";

interface MenuSystemProps {
  isOpen: boolean;
  onClose: () => void;
  currentMode: "solo" | "host" | "join" | "coach";
  onModeChange: (mode: "solo" | "host" | "join" | "coach") => void;
  onHostGenerateCode: () => Promise<string>;
  onJoinChannel: (code: string) => Promise<void>;
  onLanguageChange?: (fromLang: string, toLang: string) => void;
}

export const MenuSystem: React.FC<MenuSystemProps> = ({
  isOpen,
  onClose,
  currentMode,
  onModeChange,
  onHostGenerateCode,
  onJoinChannel,
  onLanguageChange,
}) => {
  const [showYourLab, setShowYourLab] = useState(false);
  const [accessCode, setAccessCode] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');

  const handleGenerateCode = async () => {
    try {
      const code = await onHostGenerateCode();
      setGeneratedCode(code);
    } catch (error) {
      console.error('Error generating code:', error);
    }
  };

  const handleJoinChannel = async () => {
    if (accessCode.trim()) {
      try {
        await onJoinChannel(accessCode.trim());
        onClose();
      } catch (error) {
        console.error('Error joining channel:', error);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl">
      {/* Luxury background overlay */}
      <div className="absolute inset-0 luxury-dots opacity-15" />
      <div className="absolute inset-0 luxury-gradient-overlay opacity-20" />

      {/* Close overlay */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Scrollable Menu Content */}
      <div className="relative z-10 h-full overflow-y-auto menu-scrollable">
        <div className="flex items-start justify-center min-h-full py-8">
          <div className="w-full max-w-6xl mx-6 animate-fade-in-up">
            {!showYourLab ? (
              /* Main Menu - Full Page Overlay */
              <div className="bg-black/90 backdrop-blur-xl rounded-3xl p-8 shadow-luxury-lg space-y-8 border border-gray-800">
                {/* Back button */}
                <button
                  onClick={onClose}
                  className="absolute -top-16 left-0 text-primary hover:text-accent transition-colors font-luxury"
                >
                  <span className="text-sm uppercase tracking-wider">BACK</span>
                </button>

                {/* Your Vibes Header */}
                <div className="w-full flex justify-center mb-8">
                  <img
                    src="https://i.imgur.com/RiShPNK.png"
                    alt="Your Vibes"
                    className="w-[500px] sm:w-[600px] h-auto"
                  />
                </div>

                {/* Mode Selection */}
                <ModeSelector 
                  currentMode={currentMode} 
                  onModeChange={onModeChange} 
                />

                {/* Host/Join Code Management */}
                {(currentMode === 'host' || currentMode === 'join') && (
                  <div className="space-y-4">
                    {currentMode === 'host' && (
                      <div className="space-y-4">
                        <button
                          onClick={handleGenerateCode}
                          className="w-full px-6 py-3 rounded-xl font-luxury transition-all glass-luxury-dark text-white hover:bg-luxury-purple/20"
                        >
                          GET ACCESS CODE
                        </button>
                        {generatedCode && (
                          <div className="p-4 glass-luxury-dark rounded-xl border border-gray-700">
                            <div className="text-center">
                              <div className="text-sm text-gray-400 font-luxury mb-2">Your Access Code:</div>
                              <div className="text-2xl font-brand text-white tracking-wider">{generatedCode}</div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {currentMode === 'join' && (
                      <div className="space-y-4">
                        <input
                          type="text"
                          value={accessCode}
                          onChange={(e) => setAccessCode(e.target.value)}
                          placeholder="Enter Access Code"
                          className="w-full p-4 glass-luxury-dark text-white rounded-xl border border-gray-700 focus:border-primary focus:ring-2 focus:ring-primary/20 font-luxury text-center tracking-wider"
                        />
                        <button
                          onClick={handleJoinChannel}
                          disabled={!accessCode.trim()}
                          className="w-full px-6 py-3 rounded-xl font-luxury transition-all glass-luxury-dark text-white hover:bg-luxury-purple/20 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          JOIN CHANNEL
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Language Selection with Icon Swap */}
                <div className="space-y-4">
                  <div className="flex items-center justify-center space-x-4">
                    <select className="px-6 py-3 rounded-xl font-luxury transition-all glass-luxury-dark text-white border border-gray-700 focus:border-primary">
                      <option value="en">🇺🇸 EN</option>
                      <option value="es">🇪🇸 ES</option>
                      <option value="fr">🇫🇷 FR</option>
                      <option value="de">🇩🇪 DE</option>
                    </select>
                    
                    <ArrowUpDown size={20} className="text-white" />
                    
                    <select className="px-6 py-3 rounded-xl font-luxury transition-all glass-luxury-dark text-white border border-gray-700 focus:border-primary">
                      <option value="es">🇪🇸 ES</option>
                      <option value="en">🇺🇸 EN</option>
                      <option value="fr">🇫🇷 FR</option>
                      <option value="de">🇩🇪 DE</option>
                    </select>
                  </div>
                </div>

                {/* Enter Lab Button */}
                <button
                  onClick={() => setShowYourLab(true)}
                  className="w-full p-6 rounded-2xl text-white font-brand text-xl bg-luxury-gradient shadow-luxury-lg hover:scale-105 transition-all duration-300"
                >
                  ENTER LAB
                </button>
              </div>
            ) : (
              /* Your Lab Interface */
              <LabInterface onBack={() => setShowYourLab(false)} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
