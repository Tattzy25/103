import express, { Request, Response } from "express";
import { publishToAbly } from "../../ably/publish";

const router = express.Router();

// POST /callbacks/ably-publish - Handles Ably publishing from message queue
router.post("/ably-publish", async (req: Request, res: Response) => {
  try {
    const { 
      audioUrl, 
      voiceId, 
      sessionId, 
      userId, 
      language, 
      originalText, 
      translatedText, 
      processingComplete, 
      mode, 
      timestamp 
    } = req.body;
    
    if (!sessionId || !userId || !audioUrl) {
      return res.status(400).json({ error: "Missing required fields for Ably publishing." });
    }

    console.log(`Publishing to Ably for session ${sessionId}`);

    // Prepare message payload for Ably
    const messagePayload = {
      type: "translation_complete",
      data: {
        audioUrl,
        voiceId,
        sessionId,
        userId,
        language,
        originalText,
        translatedText,
        processingComplete,
        timestamp: timestamp || new Date().toISOString()
      }
    };

    // Determine channel name based on mode
    const channelName = mode === "host" ? `${sessionId}_audio` : `user_${userId}_audio`;

    // Publish to Ably
    await publishToAbly({
      channel: channelName,
      data: messagePayload
    });

    console.log(`Successfully published to Ably channel: ${channelName}`);

    return res.json({
      success: true,
      channelName,
      sessionId,
      message: "Successfully published to Ably"
    });

  } catch (error: any) {
    console.error("Ably Publishing Error:", error);
    return res.status(500).json({ 
      error: error.message || "Ably publishing failed",
      sessionId: req.body.sessionId 
    });
  }
});

export default router;
