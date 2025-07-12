import React, { useState } from 'react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { useToast } from '../../hooks/use-toast';

interface AblyChannelManagerProps {
  onChannelJoined: (channelCode: string, token: string) => void;
}

const AblyChannelManager: React.FC<AblyChannelManagerProps> = ({ onChannelJoined }) => {
  const [generatedCode, setGeneratedCode] = useState('');
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [joinCode, setJoinCode] = useState('');
  const [userId, setUserId] = useState('');
  const [sessionId, setSessionId] = useState('');
  const { toast } = useToast();

  const handleGenerateCode = async () => {
    if (!userId || !sessionId) {
      toast({
        title: 'Error',
        description: 'User ID and Session ID are required to generate a code.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const response = await fetch('/api/ably-access/generate-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, sessionId }),
      });
      const data = await response.json();
      if (response.ok) {
        setGeneratedCode(data.channelCode);
        setExpiresAt(new Date(data.expiresAt).toLocaleString());
        toast({
          title: 'Code Generated!',
          description: `Share this code: ${data.channelCode}. Expires: ${new Date(data.expiresAt).toLocaleString()}`,
        });
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to generate code.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error generating code:', error);
      toast({
        title: 'Error',
        description: 'Network error or server unreachable.',
        variant: 'destructive',
      });
    }
  };

  const handleJoinChannel = async () => {
    if (!joinCode) {
      toast({
        title: 'Error',
        description: 'Please enter a channel code to join.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const response = await fetch('/api/ably-channel/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ channelCode: joinCode }),
      });
      const data = await response.json();
      if (response.ok) {
        onChannelJoined(joinCode, data.token);
        toast({
          title: 'Channel Joined!',
          description: `Successfully joined channel: ${joinCode}`,
        });
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to join channel.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error joining channel:', error);
      toast({
        title: 'Error',
        description: 'Network error or server unreachable.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="user-id">User ID</Label>
        <Input
          id="user-id"
          type="text"
          placeholder="Enter your User ID"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          className="mt-1"
        />
      </div>
      <div>
        <Label htmlFor="session-id">Session ID</Label>
        <Input
          id="session-id"
          type="text"
          placeholder="Enter your Session ID"
          value={sessionId}
          onChange={(e) => setSessionId(e.target.value)}
          className="mt-1"
        />
      </div>
      <div>
        <Label htmlFor="generate-code">Generate New Channel Code</Label>
        <div className="flex space-x-2 mt-1">
          <Button onClick={handleGenerateCode}>Generate Code</Button>
          {generatedCode && (
            <Input id="generate-code" type="text" value={generatedCode} readOnly />
          )}
        </div>
        {expiresAt && (
          <p className="text-sm text-gray-500 mt-1">Expires: {expiresAt}</p>
        )}
        </div>

      <div>
        <Label htmlFor="join-code">Join Existing Channel</Label>
        <div className="flex space-x-2 mt-1">
          <Input
            id="join-code"
            type="text"
            placeholder="Enter channel code"
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value)}
          />

          <Button onClick={handleJoinChannel}>Join Channel</Button>
        </div>
      </div>
    </div>
  );


};

export default AblyChannelManager;