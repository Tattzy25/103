import { Client } from "@upstash/qstash";

const QSTASH_TOKEN = process.env.QSTASH_TOKEN;
if (!QSTASH_TOKEN) {
  console.warn("⚠️  QSTASH_TOKEN not set - Message queue features will be disabled");
}

const client = QSTASH_TOKEN ? new Client({ token: QSTASH_TOKEN }) : null;

export interface VoiceIDResult {
  audioUrl: string;
  voiceId: string;
  sessionId: string;
  userId: string;
  language: string;
  originalText: string;
  translatedText: string;
  processingComplete: boolean;
  mode?: string;
}

export async function enqueueAbly(voiceIdResult: VoiceIDResult) {
  if (!client) {
    console.warn("⚠️  Message queue not available - Ably publishing disabled");
    return { success: false, error: "Message queue not configured" };
  }

  const baseUrl = process.env.VERCEL_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001';
  
  return await client.queue({ queueName: "ably-queue" }).enqueueJSON({
    url: `${baseUrl}/api/callbacks/ably-publish`,
    body: {
      audioUrl: voiceIdResult.audioUrl,
      voiceId: voiceIdResult.voiceId,
      sessionId: voiceIdResult.sessionId,
      userId: voiceIdResult.userId,
      language: voiceIdResult.language,
      originalText: voiceIdResult.originalText,
      translatedText: voiceIdResult.translatedText,
      processingComplete: voiceIdResult.processingComplete,
      mode: voiceIdResult.mode || "host",
      timestamp: new Date().toISOString(),
    },
    headers: {
      "Upstash-Forward-Session-Id": voiceIdResult.sessionId,
      "Upstash-Forward-User-Id": voiceIdResult.userId,
      "Upstash-Forward-Channel": `${voiceIdResult.sessionId}_audio`,
      "Upstash-Forward-Event-Type": "translation_complete",
      "Upstash-Forward-Mode": voiceIdResult.mode || "host",
    },
    retries: 3,
  });
}
