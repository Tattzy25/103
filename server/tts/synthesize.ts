import axios from "axios";

export interface TTSRequest {
  text: string;
  voiceId: string;
  modelId: string;
  language: string;
}

export async function synthesizeWithElevenLabs({ text, voiceId, modelId, language }: TTSRequest) {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) throw new Error("ELEVENLABS_API_KEY not set in environment");
  const response = await axios.post(
    `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/stream`,
    {
      text,
      model_id: modelId,
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.5
      },
      output_format: "mp3",
      language
    },
    {
      headers: {
        "xi-api-key": apiKey,
        "Content-Type": "application/json"
      },
      responseType: "arraybuffer"
    }
  );
  return response.data; // MP3 audio buffer
}