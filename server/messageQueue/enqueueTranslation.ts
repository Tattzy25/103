import { Client } from "@upstash/qstash";

const QSTASH_TOKEN = process.env.QSTASH_TOKEN;
if (!QSTASH_TOKEN) {
  console.warn("⚠️  QSTASH_TOKEN not set - Message queue features will be disabled");
}

const client = QSTASH_TOKEN ? new Client({ token: QSTASH_TOKEN }) : null;

export interface STTResult {
  text: string;
  sessionId: string;
  userId: string;
  sourceLang: string;
  targetLang: string;
  mode?: string;
  audioUrl?: string; // Add audioUrl as optional
}

export async function enqueueTranslation(sttResult: STTResult) {
  if (!client) {
    console.warn("⚠️  Message queue not available - processing translation directly");
    // For development without message queue, we could call the translation directly
    // For now, just log and return a mock response
    return { success: false, error: "Message queue not configured" };
  }
  
  const baseUrl = process.env.VERCEL_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001';
  
  return await client.queue({ queueName: "translation-queue" }).enqueueJSON({
    url: `${baseUrl}/api/callbacks/deepl-translate`,
    body: {
      transcription: sttResult.text,
      sessionId: sttResult.sessionId,
      userId: sttResult.userId,
      sourceLang: sttResult.sourceLang,
      targetLang: sttResult.targetLang,
      mode: sttResult.mode || "solo",
      audioUrl: sttResult.audioUrl,
      timestamp: new Date().toISOString(),
    },
    headers: {
      "Upstash-Forward-Session-Id": sttResult.sessionId,
      "Upstash-Forward-User-Id": sttResult.userId,
      "Upstash-Forward-Source-Lang": sttResult.sourceLang,
      "Upstash-Forward-Target-Lang": sttResult.targetLang,
      "Upstash-Forward-Mode": sttResult.mode || "solo",
    },
    callback: `${baseUrl}/api/callbacks/deepl-complete`,
    retries: 3,
  });
}
