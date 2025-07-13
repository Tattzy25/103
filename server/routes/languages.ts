import express, { Request, Response } from "express";
import { deeplLanguageService } from "../services/deeplLanguages";

const router = express.Router();

// GET /languages - Get supported languages from DeepL
router.get("/languages", async (req: Request, res: Response) => {
  try {
    const languages = await deeplLanguageService.getSupportedLanguages();
    
    return res.json({
      success: true,
      data: languages,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error("Languages endpoint error:", error);
    return res.status(500).json({ 
      success: false,
      error: error.message || "Failed to fetch supported languages",
      timestamp: new Date().toISOString()
    });
  }
});

// GET /languages/validate - Validate language pair
router.get("/languages/validate", async (req: Request, res: Response) => {
  try {
    const { source, target } = req.query;
    
    if (!source || !target) {
      return res.status(400).json({
        success: false,
        error: "Both source and target language codes are required"
      });
    }
    
    const isValid = await deeplLanguageService.isValidLanguagePair(
      source as string, 
      target as string
    );
    
    return res.json({
      success: true,
      valid: isValid,
      source: source as string,
      target: target as string
    });
  } catch (error: any) {
    console.error("Language validation error:", error);
    return res.status(500).json({ 
      success: false,
      error: error.message || "Language validation failed"
    });
  }
});

export default router;
