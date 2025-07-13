import React, { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface HalftoneDotInterfaceProps {
  isListening?: boolean;
  isSpeaking?: boolean;
  isRecording: boolean;
  onClick?: () => void;
  className?: string;
  audioVolume: number;
}

export const HalftoneDotInterface: React.FC<HalftoneDotInterfaceProps> = ({
  isRecording,
  isSpeaking,
  audioVolume,
  onClick,
  className,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const [isActive, setIsActive] = useState(false);
  const timeRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const size = 400;
    canvas.width = size;
    canvas.height = size;

    const draw = () => {
      ctx.clearRect(0, 0, size, size);
      timeRef.current += 0.02;

      const centerX = size / 2;
      const centerY = size / 2;
      const maxRadius = size / 2 - 10;

      const spacing = 12;
      for (let x = spacing; x < size - spacing; x += spacing) {
        for (let y = spacing; y < size - spacing; y += spacing) {
          const dx = x - centerX;
          const dy = y - centerY;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance > maxRadius) continue;

          const normalizedDistance = distance / maxRadius;
          
          // Calm breathing animation when idle, dynamic when speaking
          let pulseIntensity = 1;
          
          if (isRecording || isSpeaking) {
            // Dynamic response to voice - natural speech-like movement
            const voiceResponse = audioVolume * 1.2; // Direct response to voice volume
            const speechRhythm = isSpeaking ? Math.sin(timeRef.current * 2.5) * 0.15 + 0.85 : 0;
            pulseIntensity = 0.95 + voiceResponse + speechRhythm;
          } else {
            // Gentle breathing when idle - very subtle
            const breathingCycle = Math.sin(timeRef.current * 0.8) * 0.05 + 0.98;
            pulseIntensity = breathingCycle;
          }
          
          // Three-color system: White (largest), Pink/Purple, Turquoise
          const t = normalizedDistance;
          
          // Create alternating pattern based on position
          const patternX = Math.floor(x / 8) % 3;
          const patternY = Math.floor(y / 8) % 3;
          const patternIndex = (patternX + patternY) % 3;
          
          let color;
          let baseSizeMultiplier = 1;
          let alpha = 0.8;
          
          if (patternIndex === 0) {
            // White dots - largest, 10% opacity
            color = '#FFFFFF';
            baseSizeMultiplier = 1.3; // Larger than others
            alpha = 0.1; // 10% transparency
          } else if (patternIndex === 1) {
            // Pink/Purple dots
            color = '#FF1493'; // Deep pink
            alpha = 0.8;
          } else {
            // Turquoise dots
            color = '#40E0D0';
            alpha = 0.8;
          }
          
          const baseSize = (1 - normalizedDistance) * 3.5 * baseSizeMultiplier;
          const dotSize = Math.max(0.5, baseSize * pulseIntensity);
          
          // Apply fade towards edges
          const finalAlpha = alpha * (1 - t * 0.3);

          // No glow effects - clean dots only
          ctx.shadowColor = 'transparent';
          ctx.shadowBlur = 0;
          ctx.globalAlpha = finalAlpha;

          ctx.fillStyle = color;
          ctx.beginPath();
          ctx.arc(x, y, dotSize, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    };

    const animate = () => {
      draw();
      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isRecording, isSpeaking, audioVolume]);

  const handleClick = () => {
    setIsActive(true);
    setTimeout(() => setIsActive(false), 300);
    onClick?.();
  };

  return (
    <div
      className={cn(
        "relative cursor-pointer transition-all duration-300",
        "hover:scale-105 active:scale-95",
        isActive && "scale-95",
        className,
      )}
      onClick={handleClick}
    >
      {/* Clean container without borders - pure halftone effect */}
      <div className="relative w-[400px] h-[400px] rounded-full overflow-hidden">
        {/* Canvas for luxury dot pattern */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full"
          style={{ imageRendering: "auto" }}
        />
      </div>

    </div>
  );
};
