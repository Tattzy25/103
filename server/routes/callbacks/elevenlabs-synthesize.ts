import express, { Request, Response } from "express";
import { synthesizeWithElevenLabs } from "../../tts/synthesize";
import { enqueueVoiceID } from "../../messageQueue/enqueueVoiceID";
import { uploadAudioToS3 } from "../../services/s3UploadService";

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
      mode 
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
      language: targetLang
    });

    // Upload audio to S3
    const audioKey = `tts-audio/${sessionId}-${Date.now()}.mp3`;
    const audioUrl = await uploadAudioToS3(audioKey, Buffer.from(audioBuffer as ArrayBuffer), "audio/mpeg");
    

    
    // Calculate approximate duration (rough estimate: 150 words per minute)
    const wordCount = translatedText.split(' ').length;
    const estimatedDuration = (wordCount / 150) * 60; // seconds

    // Prepare data for Voice ID queue
    const voiceIdData = {
      audioUrl,
      sessionId,
      userId,
      language: targetLang.toLowerCase(),
      originalText,
      translatedText,
      mode,
    };

    // Enqueue for Voice ID processing
    await enqueueVoiceID({
      audioUrl: voiceIdData.audioUrl,
      duration: estimatedDuration,
      sessionId: voiceIdData.sessionId,
      userId: voiceIdData.userId,
      originalText: voiceIdData.originalText,
      translatedText: voiceIdData.translatedText,
      language: voiceIdData.language,
      mode: voiceIdData.mode
    });

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
