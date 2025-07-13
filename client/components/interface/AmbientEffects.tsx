import React from "react";

export const AmbientEffects: React.FC = () => {
  return (
    <>
      {/* Premium ambient effects */}
      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-[600px] h-40 bg-gradient-to-t from-primary/10 via-accent/5 to-transparent blur-3xl" />
      <div className="absolute top-1/2 left-0 w-40 h-[400px] bg-gradient-to-r from-primary/5 to-transparent blur-3xl" />
      <div className="absolute top-1/2 right-0 w-40 h-[400px] bg-gradient-to-l from-accent/5 to-transparent blur-3xl" />
    </>
  );
};
