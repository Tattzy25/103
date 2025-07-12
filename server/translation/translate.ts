import axios from "axios";

export interface TranslationRequest {
  text: string[];
  sourceLang: string;
  targetLang: string;
}

export async function translateWithDeepL({ text, sourceLang, targetLang }: TranslationRequest) {
  const apiKey = process.env.DEEPL_API_KEY;
  if (!apiKey) throw new Error("DEEPL_API_KEY not set in environment");
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
  return response.data;
}