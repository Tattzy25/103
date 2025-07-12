import React, { useState, useEffect } from "react";
import Ably from "ably";
import { BridgitInterface } from "@/components/ui/bridgit-interface";
import { MenuSystem } from "@/components/ui/menu-system";
import AblyChannelManager from "../src/components/AblyChannelManager";

type AppMode = "solo" | "host" | "join" | "coach";

const Index: React.FC = () => {
  const [ablyChannel, setAblyChannel] = useState<Ably.RealtimeChannel | null>(null);
  const [ablyClient, setAblyClient] = useState<Ably.Realtime | null>(null);

  const handleChannelJoined = (channelCode: string, token: string) => {
    const client = new Ably.Realtime({ token });
    client.connection.once('connected', () => {
      console.log('Ably connected!');
      const channel = client.channels.get(`${channelCode}_audio`);
      setAblyChannel(channel);
      setAblyClient(client);

      channel.subscribe('message', (message) => {
        console.log('Received message:', message.data);
        // Handle incoming audio data here
      });
    });

    client.connection.on('failed', (error) => {
      console.error('Ably connection failed:', error);
    });
  };

  useEffect(() => {
    return () => {
      if (ablyClient) {
        ablyClient.close();
      }
    };
  }, [ablyClient]);
  const [currentMode, setCurrentMode] = useState<AppMode>("solo");
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleModeChange = (mode: AppMode) => {
    setCurrentMode(mode);
  };

  const handleMenuClick = () => {
    setIsMenuOpen(true);
  };

  const handleMenuClose = () => {
    setIsMenuOpen(false);
  };

  return (
    <div className="relative">
      {/* Main Bridgit Interface */}
      <BridgitInterface mode={currentMode} onMenuClick={handleMenuClick} />

      {/* Menu System Overlay */}
      <MenuSystem
        isOpen={isMenuOpen}
        onClose={handleMenuClose}
        currentMode={currentMode}
        onModeChange={handleModeChange}
      />

      <div className="p-4">
        <AblyChannelManager onChannelJoined={handleChannelJoined} />
        {ablyChannel && (
          <p className="mt-2">Connected to Ably Channel: {ablyChannel.name}</p>
        )}
      </div>
    </div>
  );
};

export default Index;
