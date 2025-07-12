import React, { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface HalftoneDotInterfaceProps {
  isListening?: boolean;
  isSpeaking?: boolean;
  onClick?: () => void;
  className?: string;
}

export const HalftoneDotInterface: React.FC<HalftoneDotInterfaceProps> = ({
  isListening = false,
  isSpeaking = false,
  onClick,
  className,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const size = 400;
    canvas.width = size;
    canvas.height = size;

    // Placeholder for real-time voice analysis data
    // In a real implementation, this would be updated from a voice processing service
    const voiceData = {
      volume: 0.5, // Normalized 0-1
      tone: 0.5,   // Normalized 0-1
    };

    const draw = () => {
      ctx.clearRect(0, 0, size, size);

      const centerX = size / 2;
      const centerY = size / 2;
      const maxRadius = size / 2 - 15;

      const spacing = 12;
      for (let x = spacing; x < size - spacing; x += spacing) {
        for (let y = spacing; y < size - spacing; y += spacing) {
          const dx = x - centerX;
          const dy = y - centerY;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance > maxRadius) continue;

          const normalizedDistance = distance / maxRadius;
          
          const baseSize = (1 - normalizedDistance) * 3.5;
          let pulseMultiplier = 1;

          if (isListening || isSpeaking) {
            // Dynamic pulsing based on (placeholder) voice data
            const time = Date.now() / 1000;
            const volumeEffect = 1 + voiceData.volume * 0.5;
            const toneEffect = Math.sin(time * (3 + voiceData.tone * 4) + distance * 0.1);
            pulseMultiplier = volumeEffect + toneEffect * 0.1;
          }

          const dotSize = Math.max(0.5, baseSize * pulseMultiplier);

          // Gradient from Purple (center) to White (edge)
          const t = normalizedDistance;
          const r = 147 * (1 - t) + 255 * t; // Purple (R=147) to White (R=255)
          const g = 112 * (1 - t) + 255 * t; // Purple (G=112) to White (G=255)
          const b = 219 * (1 - t) + 255 * t; // Purple (B=219) to White (B=255)
          let alpha = 1 - t * 0.5;

          if (isListening || isSpeaking) {
            alpha = Math.min(1, alpha * 1.2);
            ctx.shadowColor = `rgba(147, 112, 219, 0.2)`; // Softer purple glow
            ctx.shadowBlur = 1; // Smaller glow
          } else {
            ctx.shadowBlur = 0;
          }

          ctx.fillStyle = `rgba(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)}, ${alpha})`;
          ctx.beginPath();
          ctx.arc(x, y, dotSize, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    };

    draw();

    if (isListening || isSpeaking) {
      const intervalId = setInterval(draw, 50); // Faster redraw for smoother animation
      return () => clearInterval(intervalId);
    }

  }, [isListening, isSpeaking]);

  const handleClick = () => {
    setIsActive(true);
    setTimeout(() => setIsActive(false), 200);
    onClick?.();
  };

  return (
    <div
      className={cn(
        "relative cursor-pointer transition-transform duration-200",
        "hover:scale-105 active:scale-95",
        isActive && "scale-95",
        className,
      )}
      onClick={handleClick}
    >


      {/* Main canvas container */}
      <div className="relative w-[400px] h-[400px] rounded-full overflow-hidden">
        {/* Canvas for halftone dots */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full"
          style={{ imageRendering: "pixelated" }}
        />


      </div>

      {/* Interactive feedback */}
      {(isListening || isSpeaking) && (
        <div className="absolute inset-0 rounded-full border-2 border-bridgit-purple/50 animate-ping" />
      )}
    </div>
  );
};
