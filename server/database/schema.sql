-- Core user data
CREATE TABLE users (
  user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_login_at TIMESTAMPTZ,
  preferences JSONB,
  subscription_status TEXT
);

-- Session tracking
CREATE TABLE sessions (
  session_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
  start_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  end_time TIMESTAMPTZ,
  ip_address TEXT,
  user_agent TEXT,
  device_type TEXT,
  channel_code TEXT
);

-- User behavior events
CREATE TABLE events (
  event_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES sessions(session_id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  event_details JSONB,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- STT transcriptions
CREATE TABLE stt_transcriptions (
  transcription_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES sessions(session_id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
  original_audio_url TEXT NOT NULL,
  transcribed_text TEXT NOT NULL,
  source_language TEXT NOT NULL,
  duration_ms INTEGER NOT NULL,
  processing_time_ms INTEGER NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Translations
CREATE TABLE translations (
  translation_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transcription_id UUID REFERENCES stt_transcriptions(transcription_id) ON DELETE CASCADE,
  session_id UUID REFERENCES sessions(session_id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
  source_text TEXT NOT NULL,
  translated_text TEXT NOT NULL,
  source_language TEXT NOT NULL,
  target_language TEXT NOT NULL,
  processing_time_ms INTEGER NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- TTS syntheses
CREATE TABLE tts_syntheses (
  synthesis_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  translation_id UUID REFERENCES translations(translation_id) ON DELETE CASCADE,
  session_id UUID REFERENCES sessions(session_id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
  text_to_synthesize TEXT NOT NULL,
  synthesized_audio_url TEXT NOT NULL,
  voice_model_used TEXT NOT NULL,
  target_language TEXT NOT NULL,
  processing_time_ms INTEGER NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Voice IDs
CREATE TABLE voice_ids (
  voice_id_record_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  synthesis_id UUID REFERENCES tts_syntheses(synthesis_id) ON DELETE CASCADE,
  session_id UUID REFERENCES sessions(session_id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
  generated_voice_id TEXT NOT NULL,
  audio_input_url TEXT NOT NULL,
  processing_time_ms INTEGER NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Ably messages
CREATE TABLE ably_messages (
  message_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES sessions(session_id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
  channel_name TEXT NOT NULL,
  event_type TEXT NOT NULL,
  message_payload JSONB NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Channel sessions (existing from previous implementation)
CREATE TABLE channel_sessions (
  channel_code TEXT PRIMARY KEY,
  user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
  session_id UUID REFERENCES sessions(session_id) ON DELETE CASCADE,
  permissions JSONB NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL
);

-- Create indexes for performance
CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_events_session_id ON events(session_id);
CREATE INDEX idx_events_user_id ON events(user_id);
CREATE INDEX idx_stt_transcriptions_session_id ON stt_transcriptions(session_id);
CREATE INDEX idx_translations_transcription_id ON translations(transcription_id);
CREATE INDEX idx_tts_syntheses_translation_id ON tts_syntheses(translation_id);
CREATE INDEX idx_voice_ids_synthesis_id ON voice_ids(synthesis_id);
CREATE INDEX idx_ably_messages_channel_name ON ably_messages(channel_name);
CREATE INDEX idx_channel_sessions_expires_at ON channel_sessions(expires_at);