import express, { Request, Response } from "express";
import axios from "axios";
import fs from "fs";
import multer from "multer";
import path from "path";
import { nanoid } from "nanoid";
import { enqueueTranslation } from "../messageQueue/enqueueTranslation";
import { uploadAudioToS3 } from "../services/s3UploadService";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

// POST /stt - Accepts audio file, sends to Groq Whisper Large v3 Turbo, enqueues for translation
router.post("/stt", upload.single("audio"), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No audio file uploaded." });
    }

    const { sessionId, userId, sourceLang = "en", targetLang = "es", mode = "solo" } = req.body;
    
    if (!sessionId || !userId) {
      return res.status(400).json({ error: "sessionId and userId are required." });
    }

    const audioPath = req.file.path;
    const apiKey = process.env.GROQ_STT_GROQ_API_KEY;
    
    console.log("STT Route - Environment check:");
    console.log("- GROQ_STT_GROQ_API_KEY exists:", !!apiKey);
    console.log("- Request body:", req.body);
    console.log("- File uploaded:", !!req.file);
    
    if (!apiKey) {
      console.error("Missing GROQ_STT_GROQ_API_KEY environment variable");
      return res.status(500).json({ error: "GROQ_STT_GROQ_API_KEY not set in environment." });
    }

    // Create FormData for Groq STT API
    const FormData = require('form-data');
    const formData = new FormData();
    formData.append('file', fs.createReadStream(audioPath));
    formData.append('model', 'whisper-large-v3-turbo');
    formData.append('language', sourceLang);
    formData.append('response_format', 'json');

    const response = await axios.post(
      "https://api.groq.com/openai/v1/audio/transcriptions",
      formData,
      {
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          ...formData.getHeaders(),
        },
      }
    );

    const transcription = response.data.text;

    // Upload the audio file to S3
    const audioBuffer = fs.readFileSync(audioPath);
    const audioKey = `stt-audio/${sessionId}-${Date.now()}.webm`; // Assuming webm format from client
    const audioUrl = await uploadAudioToS3(audioKey, audioBuffer, req.file.mimetype || "audio/webm");

    // Clean up temp file
    fs.unlinkSync(audioPath);

    // For solo mode, skip Ably but still use message queue for processing
    const sttResult = {
      text: transcription,
      sessionId,
      userId,
      sourceLang,
      targetLang,
      mode
    };

    // Enqueue for translation processing
    await enqueueTranslation({
      ...sttResult,
      audioUrl // Pass the S3 URL to the next step
    });

    return res.json({ 
      success: true,
      transcription,
      sessionId,
      message: "Audio transcribed and queued for translation processing"
    });

  } catch (error: any) {
    console.error("STT Error:", error);
    return res.status(500).json({ error: error.message || "STT service failed." });
  }
});

export default router;
