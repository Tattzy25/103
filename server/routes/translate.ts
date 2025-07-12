import express, { Request, Response } from "express";
import { translateWithDeepL } from "../translation/translate";

const router = express.Router();

// POST /translate - Accepts text, sourceLang, targetLang, returns translation
router.post("/translate", async (req: Request, res: Response) => {
  try {
    const { text, sourceLang, targetLang } = req.body;
    if (!text || !sourceLang || !targetLang) {
      return res.status(400).json({ error: "Missing required fields." });
    }
    const result = await translateWithDeepL({ text, sourceLang, targetLang });
    return res.json(result);
  } catch (error: any) {
    return res.status(500).json({ error: error.message || "Translation failed." });
  }
});

export default router;