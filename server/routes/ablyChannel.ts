import { Router } from "express";
import Ably from "ably";
import { getChannelSession } from "../services/channelService";

const router = Router();

router.post("/join", async (req, res) => {
  const { channelCode, clientId } = req.body;

  if (!channelCode) {
    return res.status(400).json({ error: "Channel code is required" });
  }

  const session = await getChannelSession(channelCode);
  if (!session) {
    return res.status(404).json({ error: "Invalid or expired channel code" });
  }

  const { permissions } = session;

  try {
    const apiKey = process.env.ABLY_API_KEY;
    if (!apiKey) throw new Error("ABLY_API_KEY not set in environment");

    const client = new Ably.Rest(apiKey);
    const tokenRequest = await client.auth.createTokenRequest({
      clientId: clientId || session.userId,
      capability: {
        [`${channelCode}_audio`]: permissions as Ably.CapabilityOp[],
        [`${channelCode}_control`]: ["publish", "subscribe"],
      },
    });

    res.status(200).json(tokenRequest);
  } catch (error) {
    console.error("Error joining Ably channel:", error);
    res.status(500).json({ error: "Failed to join Ably channel" });
  }
});

export default router;