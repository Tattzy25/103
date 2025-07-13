import { Client } from "@upstash/qstash";

const QSTASH_TOKEN = process.env.QSTASH_TOKEN;
if (!QSTASH_TOKEN) {
  console.warn("⚠️  QSTASH_TOKEN not set - Message queue features will be disabled");
}

const client = QSTASH_TOKEN ? new Client({ token: QSTASH_TOKEN }) : null;

export interface TranslationResult {
  translatedText: string;
  sessionId: string;
  userId: string;
  targetLang: string;
  voiceId: string;
  originalText: string;
  mode?: string;
}

export async function enqueueTTS(translationResult: TranslationResult) {
  if (!client) {
    console.warn("⚠️  Message queue not available - TTS processing disabled");
    return { success: false, error: "Message queue not configured" };
  }

  const baseUrl = process.env.VERCEL_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001';
  
  return await client.queue({ queueName: "tts-queue" }).enqueueJSON({
    url: `${baseUrl}/api/callbacks/elevenlabs-synthesize`,
    body: {
      translatedText: translationResult.translatedText,
      sessionId: translationResult.sessionId,
      userId: translationResult.userId,
      targetLang: translationResult.targetLang,
      voiceId: translationResult.voiceId || "pNInz6obpgDQGcFmaJgB", // Default Adam voice
      originalText: translationResult.originalText,
      mode: translationResult.mode || "solo",
      timestamp: new Date().toISOString(),
    },
    headers: {
      "Upstash-Forward-Session-Id": translationResult.sessionId,
      "Upstash-Forward-User-Id": translationResult.userId,
      "Upstash-Forward-Voice-Model": "eleven_flash_v2_5",
      "Upstash-Forward-Target-Lang": translationResult.targetLang,
      "Upstash-Forward-Mode": translationResult.mode || "solo",
    },
    callback: `${baseUrl}/api/callbacks/tts-complete`,
    retries: 3,
  });
}
