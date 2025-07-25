import { Router } from "express";
import { nanoid } from "nanoid";
import { storeChannelSession } from "../services/channelService";

const router = Router();

router.post("/generate-code", async (req, res) => {
  try {
    const { userId, sessionId, permissions = ['subscribe'] } = req.body;
    
    if (!userId || !sessionId) {
      return res.status(400).json({ error: "userId and sessionId are required" });
    }

    const channelCode = nanoid(6); // Changed from 10 to 6 as per previous instruction
    const expiresAt = new Date(Date.now() + 2 * 60 * 60 * 1000); // 2h TTL

    await storeChannelSession({
      channelCode,
      userId,
      sessionId,
      permissions,
      expiresAt
    });

    res.status(200).json({ 
      channelCode,
      expiresAt,
      permissions
    });
  } catch (error) {
    console.error("Error generating channel code:", error);
    res.status(500).json({ error: "Failed to generate channel code" });
  }
});

export default router;