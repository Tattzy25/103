import express, { Request, Response } from "express";
import axios from "axios";
import multer from "multer";
import fs from "fs";
import { SubscriptionService } from "../services/subscriptionService";
import { VoiceLibraryService } from "../services/voiceLibraryService";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

const XI_API_KEY = process.env.XI_API_KEY;

const ELEVENLABS_BASE_URL = "https://api.elevenlabs.io/v1";

// Middleware to check API key
const checkApiKey = (req: Request, res: Response, next: any) => {
  if (!XI_API_KEY) {
    return res.status(500).json({ error: "ElevenLabs API key not configured" });
  }
  next();
};


// Middleware to check subscription and tokens
const checkSubscription = async (req: Request, res: Response, next: any) => {
  const userId = req.headers['x-user-id'] as string;
  if (!userId) {
    return res.status(401).json({ error: "User ID required" });
  }

  const subscription = await SubscriptionService.getUserSubscription(userId);
  if (!subscription) {
    return res.status(404).json({ error: "User subscription not found" });
  }

  req.userSubscription = subscription;
  next();
};

// Middleware to check feature access
const requireFeature = (feature: string) => {
  return async (req: Request, res: Response, next: any) => {
    const userId = req.headers['x-user-id'] as string;
    const hasAccess = await SubscriptionService.hasFeatureAccess(userId, feature as any);
    
    if (!hasAccess) {
      return res.status(403).json({ 
        error: `Feature '${feature}' not available in your subscription tier`,
        upgrade_required: true 
      });
    }
    
    next();
  };
};

// GET /voice-lab/voices - Get all available voices
router.get("/voices", checkApiKey, async (req: Request, res: Response) => {
  try {
    const response = await axios.get(`${ELEVENLABS_BASE_URL}/voices`, {
      headers: {
        "xi-api-key": XI_API_KEY,
      },
    });


    const voices = response.data.voices.map((voice: any) => ({
      voice_id: voice.voice_id,
      name: voice.name,
      category: voice.category,
      description: voice.description,
      preview_url: voice.preview_url,
      available_for_tiers: voice.available_for_tiers,
      settings: voice.settings,
      sharing: voice.sharing,
      high_quality_base_model_ids: voice.high_quality_base_model_ids,
      safety_control: voice.safety_control,
      voice_verification: voice.voice_verification,
      permission_on_resource: voice.permission_on_resource
    }));

    res.json({
      success: true,
      voices,
      total: voices.length
    });
  } catch (error: any) {
    console.error("Error fetching voices:", error.response?.data || error.message);
    res.status(500).json({ 
      error: "Failed to fetch voices",
      details: error.response?.data || error.message 
    });
  }
});

// GET /voice-lab/voices/search - Search voices
router.get("/voices/search", checkApiKey, async (req: Request, res: Response) => {
  try {
    const { query, category, gender, age, accent, language, use_case } = req.query;
    
    const params = new URLSearchParams();
    if (query) params.append('query', query as string);
    if (category) params.append('category', category as string);
    if (gender) params.append('gender', gender as string);
    if (age) params.append('age', age as string);
    if (accent) params.append('accent', accent as string);
    if (language) params.append('language', language as string);
    if (use_case) params.append('use_case', use_case as string);

    const response = await axios.get(`${ELEVENLABS_BASE_URL}/voices/search?${params}`, {
      headers: {
        "xi-api-key": XI_API_KEY,
      },
    });


    res.json({
      success: true,
      voices: response.data.voices,
      total: response.data.voices.length
    });
  } catch (error: any) {
    console.error("Error searching voices:", error.response?.data || error.message);
    res.status(500).json({ 
      error: "Failed to search voices",
      details: error.response?.data || error.message 
    });
  }
});

// GET /voice-lab/voices/:voiceId - Get specific voice details
router.get("/voices/:voiceId", checkApiKey, async (req: Request, res: Response) => {
  try {
    const { voiceId } = req.params;
    const { with_settings = "true" } = req.query;

    const response = await axios.get(`${ELEVENLABS_BASE_URL}/voices/${voiceId}?with_settings=${with_settings}`, {
      headers: {
        "xi-api-key": XI_API_KEY,
      },
    });


    res.json({
      success: true,
      voice: response.data
    });
  } catch (error: any) {
    console.error("Error fetching voice:", error.response?.data || error.message);
    res.status(500).json({ 
      error: "Failed to fetch voice details",
      details: error.response?.data || error.message 
    });
  }
});

// POST /voice-lab/voices/clone - Instant Voice Cloning
router.post("/voices/clone", checkApiKey, upload.single("audio"), async (req: Request, res: Response) => {
  try {
    const { name, description, labels } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ error: "Audio file is required for voice cloning" });
    }

    if (!name) {
      return res.status(400).json({ error: "Voice name is required" });
    }

    // Check audio duration (should be at least 1 minute)
    const audioPath = req.file.path;
    const audioStats = fs.statSync(audioPath);
    
    // Rough estimate: 1 minute of audio should be at least 500KB
    if (audioStats.size < 500000) {
      fs.unlinkSync(audioPath); // Clean up
      return res.status(400).json({ 
        error: "Audio file too short. Please provide at least 1 minute of clear audio for voice cloning." 
      });
    }

    const formData = new FormData();
    const audioBuffer = fs.readFileSync(audioPath);
    const audioBlob = new Blob([audioBuffer], { type: 'audio/mpeg' });
    
    formData.append('files', audioBlob, req.file.originalname || 'audio.mp3');
    formData.append('name', name);
    if (description) formData.append('description', description);
    if (labels) formData.append('labels', JSON.stringify(labels));

    const response = await axios.post(`${ELEVENLABS_BASE_URL}/voices/add`, formData, {
      headers: {
        "xi-api-key": XI_API_KEY,
        "Content-Type": "multipart/form-data",
      },
    });


    // Clean up uploaded file
    fs.unlinkSync(audioPath);

    res.json({
      success: true,
      voice_id: response.data.voice_id,
      message: "Voice cloned successfully",
      voice: response.data
    });
  } catch (error: any) {
    // Clean up uploaded file on error
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    
    console.error("Error cloning voice:", error.response?.data || error.message);
    res.status(500).json({ 
      error: "Failed to clone voice",
      details: error.response?.data || error.message 
    });
  }
});

// POST /voice-lab/voices/instant-clone - Instant Voice Cloning (IVC)
router.post("/voices/instant-clone", checkApiKey, upload.single("audio"), async (req: Request, res: Response) => {
  try {
    const { text } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ error: "Audio file is required for instant voice cloning" });
    }

    if (!text) {
      return res.status(400).json({ error: "Text is required for instant voice cloning" });
    }

    const audioPath = req.file.path;
    const audioBuffer = fs.readFileSync(audioPath);

    const formData = new FormData();
    const audioBlob = new Blob([audioBuffer], { type: 'audio/mpeg' });
    
    formData.append('audio', audioBlob, req.file.originalname || 'audio.mp3');
    formData.append('text', text);

    const response = await axios.post(`${ELEVENLABS_BASE_URL}/voices/ivc`, formData, {
      headers: {
        "xi-api-key": XI_API_KEY,
        "Content-Type": "multipart/form-data",
      },
      responseType: 'arraybuffer'
    });


    // Clean up uploaded file
    fs.unlinkSync(audioPath);

    res.setHeader('Content-Type', 'audio/mpeg');
    res.send(response.data);
  } catch (error: any) {
    // Clean up uploaded file on error
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    
    console.error("Error with instant voice cloning:", error.response?.data || error.message);
    res.status(500).json({ 
      error: "Failed to perform instant voice cloning",
      details: error.response?.data || error.message 
    });
  }
});

// DELETE /voice-lab/voices/:voiceId - Delete a voice
router.delete("/voices/:voiceId", checkApiKey, async (req: Request, res: Response) => {
  try {
    const { voiceId } = req.params;

    await axios.delete(`${ELEVENLABS_BASE_URL}/voices/${voiceId}`, {
      headers: {
        "xi-api-key": XI_API_KEY,
      },
    });


    res.json({
      success: true,
      message: "Voice deleted successfully"
    });
  } catch (error: any) {
    console.error("Error deleting voice:", error.response?.data || error.message);
    res.status(500).json({ 
      error: "Failed to delete voice",
      details: error.response?.data || error.message 
    });
  }
});

// PUT /voice-lab/voices/:voiceId - Update voice settings
router.put("/voices/:voiceId", checkApiKey, async (req: Request, res: Response) => {
  try {
    const { voiceId } = req.params;
    const { name, description, labels } = req.body;

    const updateData: any = {};
    if (name) updateData.name = name;
    if (description) updateData.description = description;
    if (labels) updateData.labels = labels;

    const response = await axios.post(`${ELEVENLABS_BASE_URL}/voices/${voiceId}/edit`, updateData, {
      headers: {
        "xi-api-key": XI_API_KEY,
        "Content-Type": "application/json",
      },
    });


    res.json({
      success: true,
      message: "Voice updated successfully",
      voice: response.data
    });
  } catch (error: any) {
    console.error("Error updating voice:", error.response?.data || error.message);
    res.status(500).json({ 
      error: "Failed to update voice",
      details: error.response?.data || error.message 
    });
  }
});

// GET /voice-lab/voices/:voiceId/settings - Get voice settings
router.get("/voices/:voiceId/settings", checkApiKey, async (req: Request, res: Response) => {
  try {
    const { voiceId } = req.params;

    const response = await axios.get(`${ELEVENLABS_BASE_URL}/voices/${voiceId}/settings`, {
      headers: {
        "xi-api-key": XI_API_KEY,
      },
    });


    res.json({
      success: true,
      settings: response.data
    });
  } catch (error: any) {
    console.error("Error fetching voice settings:", error.response?.data || error.message);
    res.status(500).json({ 
      error: "Failed to fetch voice settings",
      details: error.response?.data || error.message 
    });
  }
});

// POST /voice-lab/voices/:voiceId/settings - Update voice settings
router.post("/voices/:voiceId/settings", checkApiKey, async (req: Request, res: Response) => {
  try {
    const { voiceId } = req.params;
    const { stability, similarity_boost, style, use_speaker_boost } = req.body;

    const settings = {
      stability: stability || 0.5,
      similarity_boost: similarity_boost || 0.75,
      style: style || 0.0,
      use_speaker_boost: use_speaker_boost || true
    };

    const response = await axios.post(`${ELEVENLABS_BASE_URL}/voices/${voiceId}/settings/edit`, settings, {
      headers: {
        "xi-api-key": XI_API_KEY,
        "Content-Type": "application/json",
      },
    });


    res.json({
      success: true,
      message: "Voice settings updated successfully",
      settings: response.data
    });
  } catch (error: any) {
    console.error("Error updating voice settings:", error.response?.data || error.message);
    res.status(500).json({ 
      error: "Failed to update voice settings",
      details: error.response?.data || error.message 
    });
  }
});

// GET /voice-lab/voices/:voiceId/similar - Find similar voices
router.get("/voices/:voiceId/similar", checkApiKey, async (req: Request, res: Response) => {
  try {
    const { voiceId } = req.params;

    const response = await axios.get(`${ELEVENLABS_BASE_URL}/voices/${voiceId}/similar`, {
      headers: {
        "xi-api-key": XI_API_KEY,
      },
    });


    res.json({
      success: true,
      similar_voices: response.data.voices
    });
  } catch (error: any) {
    console.error("Error finding similar voices:", error.response?.data || error.message);
    res.status(500).json({ 
      error: "Failed to find similar voices",
      details: error.response?.data || error.message 
    });
  }
});

// POST /voice-lab/voices/design - Design a voice
router.post("/voices/design", checkApiKey, async (req: Request, res: Response) => {
  try {
    const { 
      text, 
      voice_description, 
      gender, 
      age, 
      accent, 
      accent_strength = 1.0 
    } = req.body;

    if (!text) {
      return res.status(400).json({ error: "Text is required for voice design" });
    }

    if (!voice_description) {
      return res.status(400).json({ error: "Voice description is required for voice design" });
    }

    const designData = {
      text,
      voice_description,
      gender,
      age,
      accent,
      accent_strength
    };

    const response = await axios.post(`${ELEVENLABS_BASE_URL}/text-to-voice`, designData, {
      headers: {
        "xi-api-key": XI_API_KEY,
        "Content-Type": "application/json",
      },
      responseType: 'arraybuffer'
    });


    res.setHeader('Content-Type', 'audio/mpeg');
    res.send(response.data);
  } catch (error: any) {
    console.error("Error designing voice:", error.response?.data || error.message);
    res.status(500).json({ 
      error: "Failed to design voice",
      details: error.response?.data || error.message 
    });
  }
});

// POST /voice-lab/voices/create - Create a voice from design
router.post("/voices/create", checkApiKey, async (req: Request, res: Response) => {
  try {
    const { 
      voice_name,
      voice_description, 
      text,
      gender, 
      age, 
      accent, 
      accent_strength = 1.0,
      labels 
    } = req.body;

    if (!voice_name) {
      return res.status(400).json({ error: "Voice name is required" });
    }

    if (!voice_description) {
      return res.status(400).json({ error: "Voice description is required" });
    }

    if (!text) {
      return res.status(400).json({ error: "Text is required for voice creation" });
    }

    const createData = {
      voice_name,
      voice_description,
      text,
      gender,
      age,
      accent,
      accent_strength,
      labels
    };

    const response = await axios.post(`${ELEVENLABS_BASE_URL}/text-to-voice/create-voice`, createData, {
      headers: {
        "xi-api-key": XI_API_KEY,
        "Content-Type": "application/json",
      },
    });


    res.json({
      success: true,
      voice_id: response.data.voice_id,
      message: "Voice created successfully",
      voice: response.data
    });
  } catch (error: any) {
    console.error("Error creating voice:", error.response?.data || error.message);
    res.status(500).json({ 
      error: "Failed to create voice",
      details: error.response?.data || error.message 
    });
  }
});

// POST /voice-lab/audio/isolate - Voice Isolation
router.post("/audio/isolate", checkApiKey, upload.single("audio"), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Audio file is required for voice isolation" });
    }

    const audioPath = req.file.path;
    const audioBuffer = fs.readFileSync(audioPath);

    const formData = new FormData();
    const audioBlob = new Blob([audioBuffer], { type: 'audio/mpeg' });
    
    formData.append('audio', audioBlob, req.file.originalname || 'audio.mp3');

    const response = await axios.post(`${ELEVENLABS_BASE_URL}/audio-isolation`, formData, {
      headers: {
        "xi-api-key": XI_API_KEY,
        "Content-Type": "multipart/form-data",
      },
      responseType: 'arraybuffer'
    });


    // Clean up uploaded file
    fs.unlinkSync(audioPath);

    res.setHeader('Content-Type', 'audio/mpeg');
    res.send(response.data);
  } catch (error: any) {
    // Clean up uploaded file on error
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    
    console.error("Error isolating voice:", error.response?.data || error.message);
    res.status(500).json({ 
      error: "Failed to isolate voice",
      details: error.response?.data || error.message 
    });
  }
});

// POST /voice-lab/audio/isolate/stream - Stream Voice Isolation
router.post("/audio/isolate/stream", checkApiKey, upload.single("audio"), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Audio file is required for voice isolation streaming" });
    }

    const audioPath = req.file.path;
    const audioBuffer = fs.readFileSync(audioPath);

    const formData = new FormData();
    const audioBlob = new Blob([audioBuffer], { type: 'audio/mpeg' });
    
    formData.append('audio', audioBlob, req.file.originalname || 'audio.mp3');

    const response = await axios.post(`${ELEVENLABS_BASE_URL}/audio-isolation/stream`, formData, {
      headers: {
        "xi-api-key": XI_API_KEY,
        "Content-Type": "multipart/form-data",
      },
      responseType: 'stream'
    });


    // Clean up uploaded file
    fs.unlinkSync(audioPath);

    res.setHeader('Content-Type', 'audio/mpeg');
    response.data.pipe(res);
  } catch (error: any) {
    // Clean up uploaded file on error
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    
    console.error("Error streaming voice isolation:", error.response?.data || error.message);
    res.status(500).json({ 
      error: "Failed to stream voice isolation",
      details: error.response?.data || error.message 
    });
  }
});

// GET /voice-lab/models - Get available models
router.get("/models", checkApiKey, async (req: Request, res: Response) => {
  try {
    const response = await axios.get(`${ELEVENLABS_BASE_URL}/models`, {
      headers: {
        "xi-api-key": XI_API_KEY,
      },
    });


    res.json({
      success: true,
      models: response.data
    });
  } catch (error: any) {
    console.error("Error fetching models:", error.response?.data || error.message);
    res.status(500).json({ 
      error: "Failed to fetch models",
      details: error.response?.data || error.message 
    });
  }
});

// GET /voice-lab/default-settings - Get default voice settings
router.get("/default-settings", checkApiKey, async (req: Request, res: Response) => {
  try {
    const response = await axios.get(`${ELEVENLABS_BASE_URL}/voices/settings/default`, {
      headers: {
        "xi-api-key": XI_API_KEY,
      },
    });


    res.json({
      success: true,
      settings: response.data
    });
  } catch (error: any) {
    console.error("Error fetching default settings:", error.response?.data || error.message);
    res.status(500).json({ 
      error: "Failed to fetch default settings",
      details: error.response?.data || error.message 
    });
  }
});

export default router;
