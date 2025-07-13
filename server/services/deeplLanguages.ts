import axios from "axios";

export interface DeepLLanguage {
  language: string;
  name: string;
  supports_formality?: boolean;
}

export interface DeepLLanguagesResponse {
  source: DeepLLanguage[];
  target: DeepLLanguage[];
}

class DeepLLanguageService {
  private apiKey: string;
  private baseUrl = "https://api.deepl.com/v2";
  private cachedLanguages: DeepLLanguagesResponse | null = null;
  private cacheExpiry: number = 0;
  private cacheTimeout = 24 * 60 * 60 * 1000; // 24 hours

  constructor() {
    this.apiKey = process.env.DEEPL_AUTH_KEY || "";
    if (!this.apiKey) {
      console.warn("⚠️  DEEPL_AUTH_KEY not set - DeepL features will be disabled, using fallback languages");
    }
  }

  private async fetchLanguages(type: 'source' | 'target'): Promise<DeepLLanguage[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/languages`, {
        headers: {
          'Authorization': `DeepL-Auth-Key ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        params: {
          type: type
        }
      });

      return response.data;
    } catch (error: any) {
      console.error(`Error fetching ${type} languages from DeepL:`, error.response?.data || error.message);
      throw new Error(`Failed to fetch ${type} languages from DeepL`);
    }
  }

  async getSupportedLanguages(): Promise<DeepLLanguagesResponse> {
    // Check cache first
    if (this.cachedLanguages && Date.now() < this.cacheExpiry) {
      return this.cachedLanguages;
    }

    try {
      const [sourceLanguages, targetLanguages] = await Promise.all([
        this.fetchLanguages('source'),
        this.fetchLanguages('target')
      ]);

      this.cachedLanguages = {
        source: sourceLanguages,
        target: targetLanguages
      };
      
      this.cacheExpiry = Date.now() + this.cacheTimeout;
      
      console.log(`Fetched ${sourceLanguages.length} source and ${targetLanguages.length} target languages from DeepL`);
      
      return this.cachedLanguages;
    } catch (error) {
      // If API fails, return fallback languages
      console.warn("Using fallback languages due to API error");
      return this.getFallbackLanguages();
    }
  }

  private getFallbackLanguages(): DeepLLanguagesResponse {
    return {
      source: [
        { language: "EN", name: "English" },
        { language: "ES", name: "Spanish" },
        { language: "FR", name: "French" },
        { language: "DE", name: "German" },
        { language: "IT", name: "Italian" },
        { language: "PT", name: "Portuguese" },
        { language: "RU", name: "Russian" },
        { language: "JA", name: "Japanese" },
        { language: "ZH", name: "Chinese" },
        { language: "KO", name: "Korean" }
      ],
      target: [
        { language: "EN-US", name: "English (American)" },
        { language: "EN-GB", name: "English (British)" },
        { language: "ES", name: "Spanish" },
        { language: "FR", name: "French" },
        { language: "DE", name: "German" },
        { language: "IT", name: "Italian" },
        { language: "PT-PT", name: "Portuguese (European)" },
        { language: "PT-BR", name: "Portuguese (Brazilian)" },
        { language: "RU", name: "Russian" },
        { language: "JA", name: "Japanese" },
        { language: "ZH-CN", name: "Chinese (Simplified)" },
        { language: "ZH-TW", name: "Chinese (Traditional)" },
        { language: "KO", name: "Korean" }
      ]
    };
  }

  async isValidLanguagePair(sourceLang: string, targetLang: string): Promise<boolean> {
    try {
      const languages = await this.getSupportedLanguages();
      
      const validSource = languages.source.some(lang => lang.language === sourceLang);
      const validTarget = languages.target.some(lang => lang.language === targetLang);
      
      return validSource && validTarget;
    } catch (error) {
      console.error("Error validating language pair:", error);
      return false;
    }
  }
}

export const deeplLanguageService = new DeepLLanguageService();
