import sql from '../database/neon';

export interface VoiceLibraryEntry {
  voice_library_id: string;
  user_id: string;
  elevenlabs_voice_id: string;
  voice_name: string;
  voice_description?: string;
  voice_category: 'basic' | 'premium' | 'cloned' | 'saved';
  is_cloned: boolean;
  is_downloadable: boolean;
  audio_file_url?: string;
  voice_settings?: any;
  usage_count: number;
  created_at: Date;
  updated_at: Date;
}

export class VoiceLibraryService {
  static async saveVoiceToLibrary(
    userId: string,
    elevenlabsVoiceId: string,
    voiceName: string,
    category: 'basic' | 'premium' | 'cloned' | 'saved',
    options: {
      description?: string;
      isCloned?: boolean;
      isDownloadable?: boolean;
      audioFileUrl?: string;
      voiceSettings?: any;
    } = {}
  ): Promise<VoiceLibraryEntry | null> {
    if (!sql) {
      console.warn("Database not available");
      return null;
    }

    try {
      const result = await sql`
        INSERT INTO voice_library (
          user_id, elevenlabs_voice_id, voice_name, voice_description,
          voice_category, is_cloned, is_downloadable, audio_file_url, voice_settings
        )
        VALUES (
          ${userId}, ${elevenlabsVoiceId}, ${voiceName}, ${options.description || null},
          ${category}, ${options.isCloned || false}, ${options.isDownloadable || false},
          ${options.audioFileUrl || null}, ${JSON.stringify(options.voiceSettings || {})}
        )
        RETURNING *
      `;

      return result[0] as VoiceLibraryEntry;
    } catch (error) {
      console.error('Error saving voice to library:', error);
      return null;
    }
  }

  static async getUserVoices(
    userId: string,
    category?: 'basic' | 'premium' | 'cloned' | 'saved'
  ): Promise<VoiceLibraryEntry[]> {
    if (!sql) {
      console.warn("Database not available");
      return [];
    }

    try {
      let query;
      if (category) {
        query = sql`
          SELECT * FROM voice_library 
          WHERE user_id = ${userId} AND voice_category = ${category}
          ORDER BY created_at DESC
        `;
      } else {
        query = sql`
          SELECT * FROM voice_library 
          WHERE user_id = ${userId}
          ORDER BY created_at DESC
        `;
      }

      const result = await query;
      return result as VoiceLibraryEntry[];
    } catch (error) {
      console.error('Error fetching user voices:', error);
      return [];
    }
  }

  static async getVoiceById(voiceLibraryId: string): Promise<VoiceLibraryEntry | null> {
    if (!sql) {
      console.warn("Database not available");
      return null;
    }

    try {
      const result = await sql`
        SELECT * FROM voice_library 
        WHERE voice_library_id = ${voiceLibraryId}
      `;

      return result[0] as VoiceLibraryEntry || null;
    } catch (error) {
      console.error('Error fetching voice by ID:', error);
      return null;
    }
  }

  static async deleteVoice(voiceLibraryId: string, userId: string): Promise<boolean> {
    if (!sql) {
      console.warn("Database not available");
      return false;
    }

    try {
      const result = await sql`
        DELETE FROM voice_library 
        WHERE voice_library_id = ${voiceLibraryId} AND user_id = ${userId}
      `;

      return result.length > 0;
    } catch (error) {
      console.error('Error deleting voice:', error);
      return false;
    }
  }

  static async incrementUsageCount(voiceLibraryId: string): Promise<void> {
    if (!sql) {
      console.warn("Database not available");
      return;
    }

    try {
      await sql`
        UPDATE voice_library 
        SET usage_count = usage_count + 1, updated_at = NOW()
        WHERE voice_library_id = ${voiceLibraryId}
      `;
    } catch (error) {
      console.error('Error incrementing usage count:', error);
    }
  }

  static async logVoiceUsage(
    userId: string,
    voiceLibraryId: string,
    sessionId: string,
    usageType: 'tts' | 'clone' | 'download' | 'preview',
    tokensConsumed: number = 0,
    processingTimeMs?: number,
    success: boolean = true,
    errorMessage?: string
  ): Promise<void> {
    if (!sql) {
      console.warn("Database not available");
      return;
    }

    try {
      await sql`
        INSERT INTO voice_usage_analytics (
          user_id, voice_library_id, session_id, usage_type,
          tokens_consumed, processing_time_ms, success, error_message
        )
        VALUES (
          ${userId}, ${voiceLibraryId}, ${sessionId}, ${usageType},
          ${tokensConsumed}, ${processingTimeMs || null}, ${success}, ${errorMessage || null}
        )
      `;
    } catch (error) {
      console.error('Error logging voice usage:', error);
    }
  }

  static async recordVoiceDownload(
    userId: string,
    voiceLibraryId: string,
    downloadUrl: string,
    fileSizeBytes?: number,
    downloadFormat: string = 'mp3'
  ): Promise<void> {
    if (!sql) {
      console.warn("Database not available");
      return;
    }

    try {
      await sql`
        INSERT INTO voice_downloads (
          user_id, voice_library_id, download_url, file_size_bytes, download_format
        )
        VALUES (
          ${userId}, ${voiceLibraryId}, ${downloadUrl}, ${fileSizeBytes || null}, ${downloadFormat}
        )
      `;
    } catch (error) {
      console.error('Error recording voice download:', error);
    }
  }

  static getBasicVoices(): Array<{voice_id: string, name: string, category: string}> {
    // These are the basic voices from environment variables
    const basicVoices = [
      { voice_id: "pNInz6obpgDQGcFmaJgB", name: "Adam", category: "basic" },
      { voice_id: "21m00Tcm4TlvDq8ikWAM", name: "Rachel", category: "basic" },
      { voice_id: "AZnzlk1XvdvUeBnXmlld", name: "Domi", category: "basic" },
      { voice_id: "EXAVITQu4vr4xnSDxMaL", name: "Bella", category: "basic" },
      { voice_id: "ErXwobaYiN019PkySvjV", name: "Antoni", category: "basic" },
      { voice_id: "MF3mGyEYCl7XYWbV9V6O", name: "Elli", category: "basic" },
      { voice_id: "TxGEqnHWrfWFTfGW9XjX", name: "Josh", category: "basic" },
      { voice_id: "VR6AewLTigWG4xSOukaG", name: "Arnold", category: "basic" },
    ];

    return basicVoices;
  }
}
