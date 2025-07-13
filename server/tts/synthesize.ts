import axios from "axios";

export interface TTSRequest {
  text: string;
  voiceId: string;
  modelId: string;
  language: string;
}

export async function synthesizeWithElevenLabs({ text, voiceId, modelId, language }: TTSRequest) {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    console.warn("⚠️  ELEVENLABS_API_KEY not set - TTS disabled");
    throw new Error("ELEVENLABS_API_KEY not set in environment");
  }

  try {
    // Use eleven_flash_v2_5 model as specified
    const model = modelId || "eleven_flash_v2_5";
    const voice = voiceId || "pNInz6obpgDQGcFmaJgB"; // Default Adam voice

    console.log(`🎵 Synthesizing with Eleven Labs:`, {
      text: text.substring(0, 50) + "...",
      voiceId: voice,
      modelId: model,
      language
    });

    const response = await axios.post(
      `https://api.elevenlabs.io/v1/text-to-speech/${voice}/stream`,
      {
        text,
        model_id: model,
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
          style: 0.0,
          use_speaker_boost: true
        },
        output_format: "mp3_44100_128",
        optimize_streaming_latency: 0,
        language_code: language
      },
      {
        headers: {
          "xi-api-key": apiKey,
          "Content-Type": "application/json",
          "Accept": "audio/mpeg"
        },
        responseType: "arraybuffer"
      }
    );

    console.log("✅ Eleven Labs TTS successful, audio size:", response.data.byteLength);
    return response.data; // MP3 audio buffer
  } catch (error: any) {
    console.error("❌ Eleven Labs TTS failed:", error.response?.data || error.message);
    throw new Error(`Eleven Labs TTS failed: ${error.response?.data?.detail?.message || error.message}`);
  }
}
