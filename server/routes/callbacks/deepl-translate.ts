import express, { Request, Response } from "express";
import { translateWithDeepL } from "../../translation/translate";
import { enqueueTTS } from "../../messageQueue/enqueueTTS";

const router = express.Router();

// POST /callbacks/deepl-translate - Handles translation from message queue
router.post("/deepl-translate", async (req: Request, res: Response) => {
  try {
    const { transcription, sessionId, userId, sourceLang, targetLang, mode, timestamp, audioUrl } = req.body;
    
    if (!transcription || !sessionId || !userId || !sourceLang || !targetLang) {
      return res.status(400).json({ error: "Missing required fields for translation." });
    }

    console.log(`Processing translation for session ${sessionId}: "${transcription}"`);

    // Translate using DeepL
    const translationResult = await translateWithDeepL({
      text: [transcription],
      sourceLang: sourceLang.toUpperCase(),
      targetLang: targetLang.toUpperCase()
    });

    const translatedText = translationResult.translations[0].text;
    
    // Get default voice ID based on target language and gender
    const getDefaultVoiceId = (lang: string): string => {
      const voiceMap: { [key: string]: string } = {
        'ES': process.env.XI_VOICE_SPANISH_MALE || process.env.XI_VOICE_AVI_MALE_DEFAULT!,
        'FR': process.env.XI_VOICE_FRENCH_MALE || process.env.XI_VOICE_AVI_MALE_DEFAULT!,
        'DE': process.env.XI_VOICE_GERMAN_MALE || process.env.XI_VOICE_AVI_MALE_DEFAULT!,
        'IT': process.env.XI_VOICE_ITALIAN_MALE || process.env.XI_VOICE_AVI_MALE_DEFAULT!,
        'PT': process.env.XI_VOICE_PORTUGUESE_MALE || process.env.XI_VOICE_AVI_MALE_DEFAULT!,
        'EN': process.env.XI_VOICE_AVI_MALE_DEFAULT!,
      };
      return voiceMap[lang.toUpperCase()] || process.env.XI_VOICE_AVI_MALE_DEFAULT!;
    };

    const voiceId = getDefaultVoiceId(targetLang);

    // Prepare data for TTS queue
    const ttsData = {
      translatedText,
      sessionId,
      userId,
      targetLang,
      voiceId,
      originalText: transcription,
      mode,
      audioUrl: audioUrl // Pass the audioUrl from the previous step
    };

    // Enqueue for TTS processing
    await enqueueTTS(ttsData);

    console.log(`Translation completed for session ${sessionId}, queued for TTS`);

    return res.json({
      success: true,
      translatedText,
      sessionId,
      message: "Translation completed and queued for TTS processing"
    });

  } catch (error: any) {
    console.error("DeepL Translation Error:", error);
    return res.status(500).json({ 
      error: error.message || "Translation failed",
      sessionId: req.body.sessionId 
    });
  }
});

export default router;
