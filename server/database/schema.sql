-- Core user data
CREATE TABLE users (
  user_id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_login_at TIMESTAMPTZ,
  preferences JSONB,
  subscription_tier TEXT DEFAULT 'basic' CHECK (subscription_tier IN ('basic', 'pro', 'enterprise')),
  subscription_status TEXT DEFAULT 'active',
  tokens_remaining INTEGER DEFAULT 1000,
  tokens_used INTEGER DEFAULT 0,
  subscription_expires_at TIMESTAMPTZ
);
CREATE TABLE sessions (
  session_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT REFERENCES neon_auth.users_sync(id) ON DELETE CASCADE,
  start_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  end_time TIMESTAMPTZ,
  ip_address TEXT,
  user_agent TEXT,
  device_type TEXT,
  channel_code TEXT
);
CREATE TABLE events (
  event_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES sessions(session_id) ON DELETE CASCADE,
  user_id TEXT REFERENCES neon_auth.users_sync(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  event_details JSONB,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE stt_transcriptions (
  transcription_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES sessions(session_id) ON DELETE CASCADE,
  user_id TEXT REFERENCES neon_auth.users_sync(id) ON DELETE CASCADE,
  original_audio_url TEXT NOT NULL,
  transcribed_text TEXT NOT NULL,
  source_language TEXT NOT NULL,
  duration_ms INTEGER NOT NULL,
  processing_time_ms INTEGER NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE translations (
  translation_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transcription_id UUID REFERENCES stt_transcriptions(transcription_id) ON DELETE CASCADE,
  session_id UUID REFERENCES sessions(session_id) ON DELETE CASCADE,
  user_id TEXT REFERENCES neon_auth.users_sync(id) ON DELETE CASCADE,
  source_text TEXT NOT NULL,
  translated_text TEXT NOT NULL,
  source_language TEXT NOT NULL,
  target_language TEXT NOT NULL,
  processing_time_ms INTEGER NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE tts_syntheses (
  synthesis_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  translation_id UUID REFERENCES translations(translation_id) ON DELETE CASCADE,
  session_id UUID REFERENCES sessions(session_id) ON DELETE CASCADE,
  user_id TEXT REFERENCES neon_auth.users_sync(id) ON DELETE CASCADE,
  text_to_synthesize TEXT NOT NULL,
  synthesized_audio_url TEXT NOT NULL,
  voice_model_used TEXT NOT NULL,
  target_language TEXT NOT NULL,
  processing_time_ms INTEGER NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE voice_ids (
  voice_id_record_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  synthesis_id UUID REFERENCES tts_syntheses(synthesis_id) ON DELETE CASCADE,
  session_id UUID REFERENCES sessions(session_id) ON DELETE CASCADE,
  user_id TEXT REFERENCES neon_auth.users_sync(id) ON DELETE CASCADE,
  generated_voice_id TEXT NOT NULL,
  audio_input_url TEXT NOT NULL,
  processing_time_ms INTEGER NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE ably_messages (
  message_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES sessions(session_id) ON DELETE CASCADE,
  user_id TEXT REFERENCES neon_auth.users_sync(id) ON DELETE CASCADE,
  channel_name TEXT NOT NULL,
  event_type TEXT NOT NULL,
  message_payload JSONB NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE channel_sessions (
  channel_code TEXT PRIMARY KEY,
  user_id TEXT REFERENCES neon_auth.users_sync(id) ON DELETE CASCADE,
  session_id UUID REFERENCES sessions(session_id) ON DELETE CASCADE,
  permissions JSONB NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL
);
CREATE TABLE voice_library (
  voice_library_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT REFERENCES neon_auth.users_sync(id) ON DELETE CASCADE,
  elevenlabs_voice_id TEXT NOT NULL,
  voice_name TEXT NOT NULL,
  voice_description TEXT,
  voice_category TEXT NOT NULL CHECK (voice_category IN ('basic', 'premium', 'cloned', 'saved')),
  is_cloned BOOLEAN DEFAULT FALSE,
  is_downloadable BOOLEAN DEFAULT FALSE,
  audio_file_url TEXT,
  voice_settings JSONB,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE voice_downloads (
  download_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT REFERENCES neon_auth.users_sync(id) ON DELETE CASCADE,
  voice_library_id UUID REFERENCES voice_library(voice_library_id) ON DELETE CASCADE,
  download_url TEXT NOT NULL,
  downloaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  file_size_bytes INTEGER,
  download_format TEXT DEFAULT 'mp3'
);
CREATE TABLE voice_usage_analytics (
  usage_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT REFERENCES neon_auth.users_sync(id) ON DELETE CASCADE,
  voice_library_id UUID REFERENCES voice_library(voice_library_id) ON DELETE CASCADE,
  session_id UUID REFERENCES sessions(session_id) ON DELETE CASCADE,
  usage_type TEXT NOT NULL CHECK (usage_type IN ('tts', 'clone', 'download', 'preview')),
  tokens_consumed INTEGER DEFAULT 0,
  processing_time_ms INTEGER,
  success BOOLEAN DEFAULT TRUE,
  error_message TEXT,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE token_usage (
  token_usage_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT REFERENCES neon_auth.users_sync(id) ON DELETE CASCADE,
  session_id UUID REFERENCES sessions(session_id) ON DELETE CASCADE,
  operation_type TEXT NOT NULL CHECK (operation_type IN ('tts', 'stt', 'translate', 'voice_clone', 'voice_download')),
  tokens_consumed INTEGER NOT NULL,
  operation_details JSONB,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
