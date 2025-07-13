import { Request, Response } from 'express';
import Ably from 'ably';

export const joinChannel = async (req: Request, res: Response) => {
  const { code } = req.body;

  if (!code) {
    return res.status(400).json({ error: 'Channel code is required' });
  }

  // In a real application, you would validate the code against your database
  // to ensure it's a valid, active code and retrieve associated channel info.
  console.log(`Attempting to join channel with code: ${code}`);

  try {
    // For demonstration, we'll just create an Ably token directly.
    // In a production app, you'd likely use Ably's token authentication
    // to generate a token for the specific channel and client ID.
    const ably = new Ably.Realtime({ key: process.env.ABLY_API_KEY });
    const tokenRequest = await ably.auth.createTokenRequest({
      clientId: 'client-' + Math.random().toString(36).substr(2, 9),
      capability: {
        [`${code}_audio`]: ['subscribe', 'publish'],
      },
    });

    res.json({ token: tokenRequest.token });
  } catch (error) {
    console.error('Error joining channel or generating token:', error);
    res.status(500).json({ error: 'Failed to join channel' });
  }
};