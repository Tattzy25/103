import express, { Request, Response } from "express";
import axios from "axios";
import fs from "fs";
import multer from "multer";
import path from "path";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

// POST /stt - Accepts audio file, sends to Groq Whisper Large v3 Turbo, returns transcription
router.post("/stt", upload.single("audio"), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No audio file uploaded." });
    }
    const audioPath = req.file.path;
    const apiKey = process.env.GROQ_STT_GROQ_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "GROQ_STT_GROQ_API_KEY not set in environment." });
    }
    const audioData = fs.readFileSync(audioPath);
    const response = await axios.post(
      "https://api.groq.com/v1/speech-to-text/whisper-large-v3-turbo",
      audioData,
      {
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "audio/wav",
        },
        responseType: "json",
      }
    );
    fs.unlinkSync(audioPath); // Clean up temp file
    return res.json({ transcription: response.data.transcription });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || "STT service failed." });
  }
});

export default router;