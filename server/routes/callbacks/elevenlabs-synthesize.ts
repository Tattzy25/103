import express, { Request, Response } from "express";
import { synthesizeWithElevenLabs } from "../../tts/synthesize";
import { enqueueVoiceID } from "../../messageQueue/enqueueVoiceID";

const router = express.Router();

// POST /callbacks/elevenlabs-synthesize - Handles TTS synthesis from message queue
router.post("/elevenlabs-synthesize", async (req: Request, res: Response) => {
  try {
    const { 
      translatedText, 
      sessionId, 
      userId, 
      targetLang, 
      voiceId, 
      originalText, 
      mode, 
      timestamp 
    } = req.body;
    
    if (!translatedText || !sessionId || !userId || !targetLang || !voiceId) {
      return res.status(400).json({ error: "Missing required fields for TTS synthesis." });
    }

    console.log(`Processing TTS synthesis for session ${sessionId}: "${translatedText}"`);

    // Synthesize audio using ElevenLabs
    const audioBuffer = await synthesizeWithElevenLabs({
      text: translatedText,
      voiceId,
      modelId: "eleven_flash_v2_5",
      language: targetLang.toLowerCase()
    });

    // Convert buffer to base64 for storage/transmission
    const audioBase64 = Buffer.from(audioBuffer as ArrayBuffer).toString('base64');
    
    // For now, we'll create a temporary URL - in production, you'd upload to cloud storage
    const audioUrl = `data:audio/mpeg;base64,${audioBase64}`;
    
    // Calculate approximate duration (rough estimate: 150 words per minute)
    const wordCount = translatedText.split(' ').length;
    const estimatedDuration = (wordCount / 150) * 60; // seconds

    // Prepare data for Voice ID queue
    const voiceIdData = {
      audioUrl,
      audioBase64,
      sessionId,
      userId,
      language: targetLang.toLowerCase(),
      duration: estimatedDuration,
      originalText,
      translatedText,
      mode
    };

    // Enqueue for Voice ID processing
    await enqueueVoiceID(voiceIdData);

    console.log(`TTS synthesis completed for session ${sessionId}, queued for Voice ID processing`);

    return res.json({
      success: true,
      audioUrl,
      sessionId,
      duration: estimatedDuration,
      message: "TTS synthesis completed and queued for Voice ID processing"
    });

  } catch (error: any) {
    console.error("ElevenLabs TTS Error:", error);
    return res.status(500).json({ 
      error: error.message || "TTS synthesis failed",
      sessionId: req.body.sessionId 
    });
  }
});

export default router;
