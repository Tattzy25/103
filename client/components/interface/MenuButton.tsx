import React from "react";
import { cn } from "@/lib/utils";

interface MenuButtonProps {
  onClick?: () => void;
}

export const MenuButton: React.FC<MenuButtonProps> = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        "absolute top-8 right-8 z-20",
        "w-16 h-16 rounded-2xl",
        "flex items-center justify-center",
        "transition-all duration-300",
        "btn-luxury shadow-luxury",
        "hover:scale-110 hover:glow-luxury",
        "active:scale-95",
        "animate-elegant-float"
      )}
    >
      <img 
        src="https://i.imgur.com/GFn6kle.png" 
        alt="Menu" 
        className="w-full h-full object-contain opacity-90" 
      />
    </button>
  );
};
