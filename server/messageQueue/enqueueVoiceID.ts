import { Client } from "@upstash/qstash";

const client = new Client({ token: process.env.QSTASH_TOKEN! });

export interface TTSResult {
  audioUrl: string;
  audioBase64: string;
  sessionId: string;
  userId: string;
  language: string;
  duration: number;
}

export async function enqueueVoiceID(ttsResult: TTSResult) {
  return await client.queue({ queueName: "voice-id-queue" }).enqueueJSON({
    url: process.env.VOICEID_SERVICE_URL!,
    body: {
      audioUrl: ttsResult.audioUrl,
      audioBase64: ttsResult.audioBase64,
      sessionId: ttsResult.sessionId,
      userId: ttsResult.userId,
      language: ttsResult.language,
      duration: ttsResult.duration,
    },
    callback: process.env.VOICEID_CALLBACK_URL!,
    retries: 2,
  });
}