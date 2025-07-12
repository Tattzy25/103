import axios from "axios";

export interface VoiceIDRequest {
  audioUrl: string;
  audioBase64: string;
  sessionId: string;
  userId: string;
  language: string;
  duration: number;
}

export async function generateVoiceID({ audioUrl, audioBase64, sessionId, userId, language, duration }: VoiceIDRequest) {
  const apiKey = process.env.VOICEID_API_KEY;
  if (!apiKey) throw new Error("VOICEID_API_KEY not set in environment");
  const response = await axios.post(
    process.env.VOICEID_API_URL!,
    {
      audioUrl,
      audioBase64,
      sessionId,
      userId,
      language,
      duration
    },
    {
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      }
    }
  );
  return response.data;
}