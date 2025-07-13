import axios from "axios";

export interface TranslationRequest {
  text: string[];
  sourceLang: string;
  targetLang: string;
}

export async function translateWithDeepL({ text, sourceLang, targetLang }: TranslationRequest) {
  const apiKey = process.env.DEEPL_AUTH_KEY;
  if (!apiKey) {
    console.warn("⚠️  DEEPL_AUTH_KEY not set - translation disabled");
    throw new Error("DEEPL_AUTH_KEY not set in environment");
  }

  try {
    const response = await axios.post(
      "https://api.deepl.com/v2/translate",
      {
        split_sentences: "1",
        preserve_formatting: false,
        formality: "prefer_less",
        outline_detection: true,
        text,
        target_lang: targetLang,
        source_lang: sourceLang,
        model_type: "prefer_quality_optimized"
      },
      {
        headers: {
          "Authorization": `DeepL-Auth-Key ${apiKey}`,
          "Content-Type": "application/json"
        }
      }
    );

    console.log("✅ DeepL Translation successful:", response.data);
    return response.data;
  } catch (error: any) {
    console.error("❌ DeepL Translation failed:", error.response?.data || error.message);
    throw new Error(`DeepL translation failed: ${error.response?.data?.message || error.message}`);
  }
}
