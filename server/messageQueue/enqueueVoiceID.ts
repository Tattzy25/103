import { Client } from "@upstash/qstash";

const QSTASH_TOKEN = process.env.QSTASH_TOKEN;
if (!QSTASH_TOKEN) {
  console.warn("⚠️  QSTASH_TOKEN not set - Message queue features will be disabled");
}

const client = QSTASH_TOKEN ? new Client({ token: QSTASH_TOKEN }) : null;

export interface TTSResult {
  audioUrl: string;
  audioBase64: string;
  sessionId: string;
  userId: string;
  language: string;
  duration: number;
  originalText?: string;
  translatedText?: string;
  mode?: string;
}

export async function enqueueVoiceID(ttsResult: TTSResult) {
  if (!client) {
    console.warn("⚠️  Message queue not available - Voice ID processing disabled");
    return { success: false, error: "Message queue not configured" };
  }

  const baseUrl = process.env.VERCEL_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001';
  
  return await client.queue({ queueName: "voice-id-queue" }).enqueueJSON({
    url: `${baseUrl}/api/callbacks/voice-id-generate`,
    body: {
      audioUrl: ttsResult.audioUrl,
      audioBase64: ttsResult.audioBase64,
      sessionId: ttsResult.sessionId,
      userId: ttsResult.userId,
      language: ttsResult.language,
      duration: ttsResult.duration,
      originalText: ttsResult.originalText,
      translatedText: ttsResult.translatedText,
      mode: ttsResult.mode || "solo",
      timestamp: new Date().toISOString(),
    },
    headers: {
      "Upstash-Forward-Session-Id": ttsResult.sessionId,
      "Upstash-Forward-User-Id": ttsResult.userId,
      "Upstash-Forward-Language": ttsResult.language,
      "Upstash-Forward-Mode": ttsResult.mode || "solo",
    },
    callback: `${baseUrl}/api/callbacks/voice-id-complete`,
    retries: 2,
  });
}
