import { Client } from "@upstash/qstash";

const client = new Client({ token: process.env.QSTASH_TOKEN! });

export interface VoiceIDResult {
  audioUrl: string;
  voiceId: string;
  sessionId: string;
  userId: string;
  language: string;
  originalText: string;
  translatedText: string;
  processingComplete: boolean;
}

export async function enqueueAbly(voiceIdResult: VoiceIDResult) {
  return await client.queue({ queueName: "ably-queue" }).enqueueJSON({
    url: process.env.ABLY_SERVICE_URL!,
    body: {
      audioUrl: voiceIdResult.audioUrl,
      voiceId: voiceIdResult.voiceId,
      sessionId: voiceIdResult.sessionId,
      userId: voiceIdResult.userId,
      language: voiceIdResult.language,
      originalText: voiceIdResult.originalText,
      translatedText: voiceIdResult.translatedText,
      processingComplete: voiceIdResult.processingComplete,
    },
    headers: {
      "Session-Id": voiceIdResult.sessionId,
      "Channel": `${voiceIdResult.userId}_audio`,
    },
    retries: 2,
  });
}