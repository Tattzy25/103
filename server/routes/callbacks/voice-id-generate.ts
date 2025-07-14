import express, { Request, Response } from "express";
import { generateVoiceID } from "../../voiceId/generate";
import { enqueueAbly } from "../../messageQueue/enqueueAbly";
import axios from "axios";

const router = express.Router();

// POST /callbacks/voice-id-generate - Handles Voice ID generation from message queue
router.post("/voice-id-generate", async (req: Request, res: Response) => {
  try {
    const { 
      audioUrl,
      sessionId,
      userId,
      language,
      duration,
      originalText,
      translatedText,
      mode,
      timestamp 
    } = req.body;
    
    if (!audioUrl || !sessionId || !userId || !language) {
      return res.status(400).json({ error: "Missing required fields for Voice ID generation." });
    }

    console.log(`Processing Voice ID generation for session ${sessionId}`);

    // Generate Voice ID using the audio
    const voiceIdResult = await generateVoiceID({
      audioUrl,
      sessionId,
      userId,
      language,
      duration
    });

    // Prepare final result data
    const finalResult = {
      audioUrl,
      voiceId: voiceIdResult.voiceId,
      sessionId,
      userId,
      language,
      originalText: originalText || "",
      translatedText: translatedText || "",
      processingComplete: true,
      mode
    };

    if (mode === "solo") {
      // Store result for solo mode polling
      const baseUrl = process.env.VERCEL_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
      
      try {
        await axios.post(`${baseUrl}/api/solo-result/${sessionId}`, finalResult);
        console.log(`Voice ID generated for session ${sessionId} - solo result stored`);
      } catch (storeError) {
        console.error("Error storing solo result:", storeError);
      }
    } else {
      // Enqueue for Ably publishing
      await enqueueAbly(finalResult);
      console.log(`Voice ID generated for session ${sessionId}, queued for Ably publishing`);
    }

    return res.json({
      success: true,
      voiceId: voiceIdResult.voiceId,
      audioUrl,
      sessionId,
      mode,
      message: mode === "solo" 
        ? "Voice ID generated - processing complete (solo mode)" 
        : "Voice ID generated and queued for Ably publishing"
    });

  } catch (error: any) {
    console.error("Voice ID Generation Error:", error);
    return res.status(500).json({ 
      error: error.message || "Voice ID generation failed",
      sessionId: req.body.sessionId 
    });
  }
});

export default router;
