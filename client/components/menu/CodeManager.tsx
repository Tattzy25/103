import React, { useState } from "react";
import { Copy, Share2 } from "lucide-react";

interface CodeManagerProps {
  currentMode: "solo" | "host" | "join" | "coach";
  onHostGenerateCode: () => Promise<string>;
  onJoinChannel: (code: string) => Promise<void>;
  onClose: () => void;
}

export const CodeManager: React.FC<CodeManagerProps> = ({
  currentMode,
  onHostGenerateCode,
  onJoinChannel,
  onClose,
}) => {
  const [accessCode, setAccessCode] = useState("");
  const [generatedCode, setGeneratedCode] = useState("");

  const handleGenerateCode = async () => {
    try {
      // Try the API first
      const code = await onHostGenerateCode();
      setGeneratedCode(code);
    } catch (error) {
      console.error("Error generating code:", error);
      // Immediate fallback: Generate a reliable 6-character code
      const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      let fallbackCode = '';
      for (let i = 0; i < 6; i++) {
        fallbackCode += characters.charAt(Math.floor(Math.random() * characters.length));
      }
      console.log("Generated fallback code:", fallbackCode);
      setGeneratedCode(fallbackCode);
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

  if (currentMode === "host") {
    return (
      <div className="glass-luxury rounded-2xl p-6 shadow-luxury">
        <div className="flex space-x-3">
          <button
            onClick={handleGenerateCode}
            className="flex-1 p-4 btn-luxury rounded-xl text-white text-center text-lg tracking-widest font-brand shadow-luxury"
          >
            {generatedCode ? (
              <span className="font-luxury">{generatedCode}</span>
            ) : (
              "GET ACCESS CODE"
            )}
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
    );
  }

  if (currentMode === "join") {
    return (
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
    );
  }

  return null;
};
