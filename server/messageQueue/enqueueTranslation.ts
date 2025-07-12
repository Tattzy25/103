import { Client } from "@upstash/qstash";

const client = new Client({ token: process.env.QSTASH_TOKEN! });

export interface STTResult {
  text: string;
  sessionId: string;
  userId: string;
  sourceLang: string;
  targetLang: string;
}

export async function enqueueTranslation(sttResult: STTResult) {
  return await client.queue({ queueName: "translation-queue" }).enqueueJSON({
    url: process.env.DEEPL_SERVICE_URL!,
    body: {
      transcription: sttResult.text,
      sessionId: sttResult.sessionId,
      userId: sttResult.userId,
      sourceLang: sttResult.sourceLang,
      targetLang: sttResult.targetLang,
      timestamp: new Date().toISOString(),
    },
    headers: {
      "Session-Id": sttResult.sessionId,
      "User-Id": sttResult.userId,
      "Source-Lang": sttResult.sourceLang,
      "Target-Lang": sttResult.targetLang,
    },
    callback: process.env.DEEPL_CALLBACK_URL!,
    retries: 3,
  });
}