import { Client } from "@upstash/qstash";

const client = new Client({ token: process.env.QSTASH_TOKEN! });

export interface TranslationResult {
  translatedText: string;
  sessionId: string;
  userId: string;
  targetLang: string;
  voiceId: string;
  originalText: string;
}

export async function enqueueTTS(translationResult: TranslationResult) {
  return await client.queue({ queueName: "tts-queue" }).enqueueJSON({
    url: process.env.ELEVENLABS_SERVICE_URL!,
    body: {
      translatedText: translationResult.translatedText,
      sessionId: translationResult.sessionId,
      userId: translationResult.userId,
      targetLang: translationResult.targetLang,
      voiceId: translationResult.voiceId,
      originalText: translationResult.originalText,
    },
    headers: {
      "Session-Id": translationResult.sessionId,
      "Voice-Model": "eleven_multilingual_v2",
    },
    callback: process.env.TTS_CALLBACK_URL!,
    retries: 3,
  });
}