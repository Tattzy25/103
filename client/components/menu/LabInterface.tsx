import React, { useState } from "react";
import { Settings, Mic, Languages } from "lucide-react";
import { NeumorphCard } from "../ui/neumorphism-card";
import { VoiceLab } from "./VoiceLab";

interface LabInterfaceProps {
  onBack: () => void;
}

export const LabInterface: React.FC<LabInterfaceProps> = ({ onBack }) => {
  const [activeView, setActiveView] = useState<'main' | 'voiceLab'>('main');

  if (activeView === 'voiceLab') {
    return <VoiceLab onBack={() => setActiveView('main')} />;
  }
  return (
    <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl">
      {/* Luxury background overlay */}
      <div className="absolute inset-0 luxury-dots opacity-15" />
      <div className="absolute inset-0 luxury-gradient-overlay opacity-20" />

      {/* Close overlay */}
      <div className="absolute inset-0" onClick={onBack} />

      {/* Scrollable Content */}
      <div className="relative z-10 h-full overflow-y-auto menu-scrollable">
        <div className="flex items-start justify-center min-h-full py-8">
          <div className="w-full max-w-6xl mx-6 animate-fade-in-up">
            <div className="bg-black/90 backdrop-blur-xl rounded-3xl p-8 shadow-luxury-lg space-y-8 border border-gray-800">
              {/* Back button */}
              <button
                onClick={onBack}
                className="absolute -top-16 left-0 text-primary hover:text-accent transition-colors font-luxury"
              >
                <span className="text-sm uppercase tracking-wider">BACK</span>
              </button>

              {/* Your Lab Header Image - Bigger Header */}
              <div className="w-full flex justify-center mb-8">
                <img
                  src="https://i.imgur.com/Mr33MAH.png"
                  alt="Your Lab"
                  className="w-[500px] sm:w-[600px] h-auto"
                />
              </div>

              {/* Lab Options Grid - Clean Buttons */}
              <div className="flex justify-center space-x-6">
                <button className="px-6 py-3 rounded-xl font-luxury transition-all glass-luxury-dark text-white hover:bg-luxury-purple/20">
                  <Settings className="inline mr-2" size={16} />
                  SETTINGS
                </button>
                
                <button 
                  onClick={() => setActiveView('voiceLab')}
                  className="px-6 py-3 rounded-xl font-luxury transition-all glass-luxury-dark text-white hover:bg-luxury-purple/20"
                >
                  <Mic className="inline mr-2" size={16} />
                  VOICE LAB
                </button>
                
                <button className="px-6 py-3 rounded-xl font-luxury transition-all glass-luxury-dark text-white hover:bg-luxury-purple/20">
                  <Languages className="inline mr-2" size={16} />
                  LANGUAGE LAB
                </button>
                
                <button className="px-6 py-3 rounded-xl font-luxury transition-all glass-luxury-dark text-white hover:bg-luxury-purple/20">
                  <Settings className="inline mr-2" size={16} />
                  COACH SETTINGS
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
