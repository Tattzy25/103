import express, { Request, Response } from "express";
import axios from "axios";

const router = express.Router();

const DEEPL_API_KEY = process.env.DEEPL_API_KEY;
const DEEPL_BASE_URL = process.env.DEEPL_API_URL || "https://api-free.deepl.com/v2";

// Middleware to check API key
const checkApiKey = (req: Request, res: Response, next: any) => {
  if (!DEEPL_API_KEY) {
    return res.status(500).json({ 
      error: "DeepL API key not configured",
      code: "MISSING_API_KEY"
    });
  }
  next();
};

// Error handling middleware for DeepL API
const handleDeepLError = (error: any, res: Response) => {
  console.error("DeepL API Error:", error.response?.data || error.message);
  
  if (error.response) {
    const status = error.response.status;
    const data = error.response.data;
    
    switch (status) {
      case 400:
        return res.status(400).json({
          error: "Bad request - Invalid parameters",
          details: data.message || "Check your request parameters",
          code: "BAD_REQUEST"
        });
      case 403:
        return res.status(403).json({
          error: "Authorization failed - Invalid API key",
          details: "Please check your DeepL API key",
          code: "INVALID_API_KEY"
        });
      case 413:
        return res.status(413).json({
          error: "Request entity too large",
          details: "Text too long for translation",
          code: "TEXT_TOO_LONG"
        });
      case 429:
        return res.status(429).json({
          error: "Too many requests",
          details: "Rate limit exceeded. Please try again later",
          code: "RATE_LIMIT_EXCEEDED"
        });
      case 456:
        return res.status(456).json({
          error: "Quota exceeded",
          details: "Translation quota has been exceeded",
          code: "QUOTA_EXCEEDED"
        });
      case 503:
        return res.status(503).json({
          error: "Service unavailable",
          details: "DeepL service is temporarily unavailable",
          code: "SERVICE_UNAVAILABLE"
        });
      default:
        return res.status(status).json({
          error: "DeepL API error",
          details: data.message || "Unknown error occurred",
          code: "API_ERROR"
        });
    }
  }
  
  return res.status(500).json({
    error: "Failed to communicate with DeepL API",
    details: error.message,
    code: "NETWORK_ERROR"
  });
};

// GET /languages/supported - Get all supported languages
router.get("/supported", checkApiKey, async (req: Request, res: Response) => {
  try {
    const { type = "target" } = req.query;
    
    const response = await axios.get(`${DEEPL_BASE_URL}/languages`, {
      headers: {
        "Authorization": `DeepL-Auth-Key ${DEEPL_API_KEY}`,
      },
      params: {
        type: type // "source" or "target"
      }
    });

    const languages = response.data.map((lang: any) => ({
      code: lang.language,
      name: lang.name,
      supports_formality: lang.supports_formality || false
    }));

    res.json({
      success: true,
      languages,
      total: languages.length,
      type: type
    });
  } catch (error: any) {
    handleDeepLError(error, res);
  }
});

// GET /languages/source - Get supported source languages
router.get("/source", checkApiKey, async (req: Request, res: Response) => {
  try {
    const response = await axios.get(`${DEEPL_BASE_URL}/languages`, {
      headers: {
        "Authorization": `DeepL-Auth-Key ${DEEPL_API_KEY}`,
      },
      params: {
        type: "source"
      }
    });

    const languages = response.data.map((lang: any) => ({
      code: lang.language,
      name: lang.name
    }));

    res.json({
      success: true,
      languages,
      total: languages.length
    });
  } catch (error: any) {
    handleDeepLError(error, res);
  }
});

// GET /languages/target - Get supported target languages
router.get("/target", checkApiKey, async (req: Request, res: Response) => {
  try {
    const response = await axios.get(`${DEEPL_BASE_URL}/languages`, {
      headers: {
        "Authorization": `DeepL-Auth-Key ${DEEPL_API_KEY}`,
      },
      params: {
        type: "target"
      }
    });

    const languages = response.data.map((lang: any) => ({
      code: lang.language,
      name: lang.name,
      supports_formality: lang.supports_formality || false
    }));

    res.json({
      success: true,
      languages,
      total: languages.length
    });
  } catch (error: any) {
    handleDeepLError(error, res);
  }
});

// POST /languages/detect - Detect language of text
router.post("/detect", checkApiKey, async (req: Request, res: Response) => {
  try {
    const { text } = req.body;
    
    if (!text || typeof text !== 'string') {
      return res.status(400).json({
        error: "Text is required for language detection",
        code: "MISSING_TEXT"
      });
    }

    if (text.length > 50000) {
      return res.status(413).json({
        error: "Text too long for language detection (max 50,000 characters)",
        code: "TEXT_TOO_LONG"
      });
    }

    // Use translate endpoint with empty target_lang to detect language
    const response = await axios.post(`${DEEPL_BASE_URL}/translate`, 
      new URLSearchParams({
        text: text,
        target_lang: 'EN' // We need a target language, but we only care about detection
      }),
      {
        headers: {
          "Authorization": `DeepL-Auth-Key ${DEEPL_API_KEY}`,
          "Content-Type": "application/x-www-form-urlencoded",
        }
      }
    );

    const detectedLanguage = response.data.translations[0].detected_source_language;

    res.json({
      success: true,
      detected_language: detectedLanguage,
      confidence: "high", // DeepL doesn't provide confidence scores
      text_length: text.length
    });
  } catch (error: any) {
    handleDeepLError(error, res);
  }
});

// POST /languages/translate - Translate text
router.post("/translate", checkApiKey, async (req: Request, res: Response) => {
  try {
    const { 
      text, 
      target_lang, 
      source_lang, 
      formality, 
      preserve_formatting = false,
      split_sentences = "1",
      tag_handling 
    } = req.body;
    
    if (!text || typeof text !== 'string') {
      return res.status(400).json({
        error: "Text is required for translation",
        code: "MISSING_TEXT"
      });
    }

    if (!target_lang) {
      return res.status(400).json({
        error: "Target language is required",
        code: "MISSING_TARGET_LANG"
      });
    }

    if (text.length > 130000) {
      return res.status(413).json({
        error: "Text too long for translation (max 130,000 characters)",
        code: "TEXT_TOO_LONG"
      });
    }

    const params: any = {
      text: text,
      target_lang: target_lang.toUpperCase()
    };

    if (source_lang) {
      params.source_lang = source_lang.toUpperCase();
    }

    if (formality && ['default', 'more', 'less', 'prefer_more', 'prefer_less'].includes(formality)) {
      params.formality = formality;
    }

    if (preserve_formatting) {
      params.preserve_formatting = "1";
    }

    if (split_sentences) {
      params.split_sentences = split_sentences;
    }

    if (tag_handling && ['xml', 'html'].includes(tag_handling)) {
      params.tag_handling = tag_handling;
    }

    const response = await axios.post(`${DEEPL_BASE_URL}/translate`, 
      new URLSearchParams(params),
      {
        headers: {
          "Authorization": `DeepL-Auth-Key ${DEEPL_API_KEY}`,
          "Content-Type": "application/x-www-form-urlencoded",
        }
      }
    );

    const translation = response.data.translations[0];

    res.json({
      success: true,
      translation: {
        text: translation.text,
        detected_source_language: translation.detected_source_language,
        target_language: target_lang.toUpperCase()
      },
      usage: {
        character_count: text.length,
        character_limit: 500000 // DeepL free tier limit
      }
    });
  } catch (error: any) {
    handleDeepLError(error, res);
  }
});

// GET /languages/usage - Get API usage information
router.get("/usage", checkApiKey, async (req: Request, res: Response) => {
  try {
    const response = await axios.get(`${DEEPL_BASE_URL}/usage`, {
      headers: {
        "Authorization": `DeepL-Auth-Key ${DEEPL_API_KEY}`,
      }
    });

    res.json({
      success: true,
      usage: {
        character_count: response.data.character_count,
        character_limit: response.data.character_limit,
        characters_remaining: response.data.character_limit - response.data.character_count,
        usage_percentage: Math.round((response.data.character_count / response.data.character_limit) * 100)
      }
    });
  } catch (error: any) {
    handleDeepLError(error, res);
  }
});

// POST /languages/glossary/create - Create a glossary
router.post("/glossary/create", checkApiKey, async (req: Request, res: Response) => {
  try {
    const { name, source_lang, target_lang, entries } = req.body;
    
    if (!name || !source_lang || !target_lang || !entries) {
      return res.status(400).json({
        error: "Name, source language, target language, and entries are required",
        code: "MISSING_REQUIRED_FIELDS"
      });
    }

    // Convert entries object to TSV format
    const entriesArray = Object.entries(entries);
    const entriesTsv = entriesArray.map(([source, target]) => `${source}\t${target}`).join('\n');

    const params = new URLSearchParams({
      name: name,
      source_lang: source_lang.toUpperCase(),
      target_lang: target_lang.toUpperCase(),
      entries: entriesTsv,
      entries_format: 'tsv'
    });

    const response = await axios.post(`${DEEPL_BASE_URL}/glossaries`, params, {
      headers: {
        "Authorization": `DeepL-Auth-Key ${DEEPL_API_KEY}`,
        "Content-Type": "application/x-www-form-urlencoded",
      }
    });

    res.json({
      success: true,
      glossary: {
        glossary_id: response.data.glossary_id,
        name: response.data.name,
        ready: response.data.ready,
        source_lang: response.data.source_lang,
        target_lang: response.data.target_lang,
        creation_time: response.data.creation_time,
        entry_count: response.data.entry_count
      }
    });
  } catch (error: any) {
    handleDeepLError(error, res);
  }
});

// GET /languages/glossary/list - List all glossaries
router.get("/glossary/list", checkApiKey, async (req: Request, res: Response) => {
  try {
    const response = await axios.get(`${DEEPL_BASE_URL}/glossaries`, {
      headers: {
        "Authorization": `DeepL-Auth-Key ${DEEPL_API_KEY}`,
      }
    });

    res.json({
      success: true,
      glossaries: response.data.glossaries,
      total: response.data.glossaries.length
    });
  } catch (error: any) {
    handleDeepLError(error, res);
  }
});

// GET /languages/glossary/:glossaryId - Get glossary information
router.get("/glossary/:glossaryId", checkApiKey, async (req: Request, res: Response) => {
  try {
    const { glossaryId } = req.params;

    const response = await axios.get(`${DEEPL_BASE_URL}/glossaries/${glossaryId}`, {
      headers: {
        "Authorization": `DeepL-Auth-Key ${DEEPL_API_KEY}`,
      }
    });

    res.json({
      success: true,
      glossary: response.data
    });
  } catch (error: any) {
    handleDeepLError(error, res);
  }
});

// DELETE /languages/glossary/:glossaryId - Delete a glossary
router.delete("/glossary/:glossaryId", checkApiKey, async (req: Request, res: Response) => {
  try {
    const { glossaryId } = req.params;

    await axios.delete(`${DEEPL_BASE_URL}/glossaries/${glossaryId}`, {
      headers: {
        "Authorization": `DeepL-Auth-Key ${DEEPL_API_KEY}`,
      }
    });

    res.json({
      success: true,
      message: "Glossary deleted successfully"
    });
  } catch (error: any) {
    handleDeepLError(error, res);
  }
});

// GET /languages/glossary/:glossaryId/entries - Get glossary entries
router.get("/glossary/:glossaryId/entries", checkApiKey, async (req: Request, res: Response) => {
  try {
    const { glossaryId } = req.params;

    const response = await axios.get(`${DEEPL_BASE_URL}/glossaries/${glossaryId}/entries`, {
      headers: {
        "Authorization": `DeepL-Auth-Key ${DEEPL_API_KEY}`,
      }
    });

    // Parse TSV format entries
    const entriesText = response.data;
    const entries: { [key: string]: string } = {};
    
    entriesText.split('\n').forEach((line: string) => {
      const [source, target] = line.split('\t');
      if (source && target) {
        entries[source] = target;
      }
    });

    res.json({
      success: true,
      entries,
      total: Object.keys(entries).length
    });
  } catch (error: any) {
    handleDeepLError(error, res);
  }
});

export default router;
