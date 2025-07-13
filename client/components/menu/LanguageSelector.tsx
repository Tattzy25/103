import React, { useState, useEffect } from "react";
import { ChevronDown, ArrowUpDown } from "lucide-react";
import { NeumorphCard } from "../ui/neumorphism-card";

interface DeepLLanguage {
  language: string;
  name: string;
  supports_formality?: boolean;
}

interface DeepLLanguagesResponse {
  source: DeepLLanguage[];
  target: DeepLLanguage[];
}

interface LanguageSelectorProps {
  onLanguageChange?: (fromLang: string, toLang: string) => void;
}

// Language code to flag mapping
const languageFlags: Record<string, string> = {
  "EN": "🇺🇸", "EN-US": "🇺🇸", "EN-GB": "🇬🇧",
  "ES": "🇪🇸", "FR": "🇫🇷", "DE": "🇩🇪", "IT": "🇮🇹",
  "PT": "🇵🇹", "PT-PT": "🇵🇹", "PT-BR": "🇧🇷",
  "RU": "🇷🇺", "JA": "🇯🇵", "KO": "🇰🇷",
  "ZH": "🇨🇳", "ZH-CN": "🇨🇳", "ZH-TW": "🇹🇼",
  "NL": "🇳🇱", "PL": "🇵🇱", "SV": "🇸🇪", "DA": "🇩🇰",
  "NO": "🇳🇴", "FI": "🇫🇮", "CS": "🇨🇿", "HU": "🇭🇺",
  "SK": "🇸🇰", "SL": "🇸🇮", "ET": "🇪🇪", "LV": "🇱🇻",
  "LT": "🇱🇹", "BG": "🇧🇬", "RO": "🇷🇴", "EL": "🇬🇷",
  "TR": "🇹🇷", "UK": "🇺🇦", "AR": "🇸🇦", "HI": "🇮🇳",
  "ID": "🇮🇩", "MS": "🇲🇾", "TH": "🇹🇭", "VI": "🇻🇳"
};

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({ onLanguageChange }) => {
  const [languages, setLanguages] = useState<DeepLLanguagesResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [fromLanguage, setFromLanguage] = useState("EN");
  const [toLanguage, setToLanguage] = useState("ES");
  const [showFromDropdown, setShowFromDropdown] = useState(false);
  const [showToDropdown, setShowToDropdown] = useState(false);

  useEffect(() => {
    const fetchLanguages = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/languages');
        const data = await response.json();
        
        if (data.success) {
          setLanguages(data.data);
          console.log('Loaded real DeepL languages:', data.data);
        } else {
          throw new Error(data.error || 'Failed to fetch languages');
        }
      } catch (err: any) {
        console.error('Error fetching languages, using fallback:', err);
        // Use fallback languages on error
        setLanguages({
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
        });
      } finally {
        setLoading(false);
      }
    };

    fetchLanguages();
  }, []);

  useEffect(() => {
    if (onLanguageChange) {
      onLanguageChange(fromLanguage, toLanguage);
    }
  }, [fromLanguage, toLanguage, onLanguageChange]);

  const swapLanguages = () => {
    const temp = fromLanguage;
    setFromLanguage(toLanguage);
    setToLanguage(temp);
  };

  const getLanguageDisplay = (langCode: string, isSource: boolean) => {
    const langList = isSource ? languages?.source : languages?.target;
    const lang = langList?.find(l => l.language === langCode);
    return {
      flag: languageFlags[langCode] || "🌐",
      code: langCode,
      name: lang?.name || langCode
    };
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-center">
          <div className="p-3 rounded-full btn-luxury shadow-luxury text-white opacity-50">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M8 3L4 7L8 11"/><path d="M4 7H20"/><path d="M16 21L20 17L16 13"/><path d="M20 17H4"/>
            </svg>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="w-full p-4 btn-luxury rounded-xl text-white font-brand shadow-luxury opacity-50">
            Loading...
          </div>
          <div className="w-full p-4 btn-luxury rounded-xl text-white font-brand shadow-luxury opacity-50">
            Loading...
          </div>
        </div>
      </div>
    );
  }

  if (!languages) {
    return (
      <div className="space-y-4">
        <div className="text-center text-red-400 text-sm">
          Error loading languages
        </div>
      </div>
    );
  }

  const fromDisplay = getLanguageDisplay(fromLanguage, true);
  const toDisplay = getLanguageDisplay(toLanguage, false);

  return (
    <div className="space-y-4">
      <div className="flex justify-center">
        <NeumorphCard className="w-16 h-16" onClick={swapLanguages}>
          <ArrowUpDown size={20} className="text-white" />
        </NeumorphCard>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        {/* From Language */}
        <div className="relative">
          <NeumorphCard 
            className="w-full h-16" 
            onClick={() => setShowFromDropdown(!showFromDropdown)}
          >
            <div className="flex items-center justify-between w-full px-2">
              <span className="flex items-center space-x-2">
                <span className="text-xl">{fromDisplay.flag}</span>
                <span className="text-sm font-bold text-white uppercase">{fromDisplay.code}</span>
              </span>
              <ChevronDown size={16} className="text-white" />
            </div>
          </NeumorphCard>

          {showFromDropdown && (
            <div className="absolute top-full mt-2 w-full glass-luxury-dark rounded-xl overflow-hidden z-20 shadow-luxury-lg max-h-60 overflow-y-auto">
              {languages.source.map((lang) => (
                <button
                  key={lang.language}
                  onClick={() => {
                    setFromLanguage(lang.language);
                    setShowFromDropdown(false);
                  }}
                  className="w-full p-3 flex items-center space-x-2 hover:bg-primary/20 text-left font-luxury"
                >
                  <span className="text-lg">{languageFlags[lang.language] || "🌐"}</span>
                  <div className="flex flex-col">
                    <span className="text-sm text-primary">{lang.language}</span>
                    <span className="text-xs text-gray-400">{lang.name}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* To Language */}
        <div className="relative">
          <NeumorphCard 
            className="w-full h-16" 
            onClick={() => setShowToDropdown(!showToDropdown)}
          >
            <div className="flex items-center justify-between w-full px-2">
              <span className="flex items-center space-x-2">
                <span className="text-xl">{toDisplay.flag}</span>
                <span className="text-sm font-bold text-white uppercase">{toDisplay.code}</span>
              </span>
              <ChevronDown size={16} className="text-white" />
            </div>
          </NeumorphCard>

          {showToDropdown && (
            <div className="absolute top-full mt-2 w-full glass-luxury-dark rounded-xl overflow-hidden z-20 shadow-luxury-lg max-h-60 overflow-y-auto">
              {languages.target.map((lang) => (
                <button
                  key={lang.language}
                  onClick={() => {
                    setToLanguage(lang.language);
                    setShowToDropdown(false);
                  }}
                  className="w-full p-3 flex items-center space-x-2 hover:bg-primary/20 text-left font-luxury"
                >
                  <span className="text-lg">{languageFlags[lang.language] || "🌐"}</span>
                  <div className="flex flex-col">
                    <span className="text-sm text-primary">{lang.language}</span>
                    <span className="text-xs text-gray-400">{lang.name}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
