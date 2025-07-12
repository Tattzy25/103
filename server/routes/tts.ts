import express, { Request, Response } from "express";
import { synthesizeWithElevenLabs } from "../tts/synthesize";

const router = express.Router();

// POST /tts - Accepts text, voiceId, modelId, language, returns MP3 audio
router.post("/tts", async (req: Request, res: Response) => {
  try {
    const { text, voiceId, modelId, language } = req.body;
    if (!text || !voiceId || !modelId || !language) {
      return res.status(400).json({ error: "Missing required fields." });
    }
    const audioBuffer = await synthesizeWithElevenLabs({ text, voiceId, modelId, language });
    res.setHeader("Content-Type", "audio/mpeg");
    return res.send(audioBuffer);
  } catch (error: any) {
    return res.status(500).json({ error: error.message || "TTS synthesis failed." });
  }
});

export default router;