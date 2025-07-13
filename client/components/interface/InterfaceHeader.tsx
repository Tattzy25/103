import React from "react";

export const InterfaceHeader: React.FC = () => {
  return (
    <header className="absolute top-0 left-0 w-full flex justify-center items-center p-4 md:p-6 z-20">
      {/* Logo without background - bigger and wider, mobile responsive */}
      <img
        src="https://i.imgur.com/QvIhund.png"
        alt="BRIDGIT-AI Header"
        className="w-full max-w-lg md:max-w-xl lg:max-w-2xl h-auto object-contain"
      />
    </header>
  );
};
