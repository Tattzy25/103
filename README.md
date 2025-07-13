# 🎙️ BRIDGIT-AI — Real-Time Voice Translation Platform

A production-ready voice translation platform that provides real-time speech-to-text, translation, text-to-speech, and voice ID generation through a complete message queue workflow.

## 🚀 Features

- **Real-time Voice Translation**: STT → Translation → TTS → Voice ID pipeline
- **Multiple Modes**: Solo, Host, Join, and Coach modes
- **Message Queue Architecture**: Scalable processing with Upstash QStash
- **Real-time Communication**: Ably integration for multi-user sessions
- **Voice Cloning**: ElevenLabs voice synthesis with custom voice IDs
- **Production Ready**: Deployed on Vercel with full error handling

## 🏗️ Architecture

### Voice Workflow Pipeline

```
Recording → STT (Groq) → Message Queue → DeepL Translation → Message Queue → 
ElevenLabs TTS → Message Queue → Voice ID Generation → Message Queue → 
Ably Publishing (Multi-user) / Direct Playback (Solo)
```

### Mode-Specific Behavior

- **Solo Mode**: Complete pipeline without Ably publishing
- **Host/Join Mode**: Full pipeline with Ably real-time communication
- **Coach Mode**: AI coaching integration (future implementation)

## 🔧 Environment Variables

Create a `.env` file with the following variables:

### Core Services
```env
# Groq STT API
GROQ_STT_GROQ_API_KEY=your_groq_api_key

# DeepL Translation API
DEEPL_API_KEY=your_deepl_api_key

# ElevenLabs TTS API
ELEVENLABS_API_KEY=your_elevenlabs_api_key

# Ably Real-time API
ABLY_API_KEY=your_ably_api_key

# Upstash QStash Message Queue
QSTASH_TOKEN=your_qstash_token
```

### Voice IDs (ElevenLabs)
```env
# Default Voice IDs
XI_VOICE_AVI_MALE_DEFAULT=your_male_voice_id
XI_VOICE_AVI_FEMALE_DEFAULT=your_female_voice_id
XI_VOICE_SPANISH_MALE=your_spanish_male_voice_id
XI_VOICE_FRENCH_MALE=your_french_male_voice_id
XI_VOICE_GERMAN_MALE=your_german_male_voice_id
```

### Application URLs
```env
# For local development
NEXT_PUBLIC_APP_URL=http://localhost:3000

# For production (Vercel sets this automatically)
VERCEL_URL=your_vercel_deployment_url
```

### Database (Neon PostgreSQL)
```env
DATABASE_URL=your_neon_database_url
```

## 📦 Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd bridgit-ai
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env
# Edit .env with your API keys
```

4. **Set up the database**
```bash
# Run the schema.sql file in your Neon database
```

5. **Configure Upstash QStash Queues**
```bash
# Create the required queues (see Queue Configuration section)
```

## 🔄 Queue Configuration

Set up the following queues in your Upstash QStash dashboard:

```bash
# Translation queue
curl -XPOST https://qstash.upstash.io/v2/queues/ \
  -H "Authorization: Bearer <QSTASH_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"queueName": "translation-queue", "parallelism": 5}'

# TTS queue
curl -XPOST https://qstash.upstash.io/v2/queues/ \
  -H "Authorization: Bearer <QSTASH_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"queueName": "tts-queue", "parallelism": 3}'

# Voice ID queue
curl -XPOST https://qstash.upstash.io/v2/queues/ \
  -H "Authorization: Bearer <QSTASH_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"queueName": "voice-id-queue", "parallelism": 2}'

# Ably queue
curl -XPOST https://qstash.upstash.io/v2/queues/ \
  -H "Authorization: Bearer <QSTASH_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"queueName": "ably-queue", "parallelism": 10}'
```

## 🚀 Development

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## 📡 API Endpoints

### Core Workflow
- `POST /api/stt` - Speech-to-text processing
- `POST /api/translate` - Text translation
- `POST /api/tts` - Text-to-speech synthesis

### Message Queue Callbacks
- `POST /api/callbacks/deepl-translate` - DeepL translation callback
- `POST /api/callbacks/elevenlabs-synthesize` - ElevenLabs TTS callback
- `POST /api/callbacks/voice-id-generate` - Voice ID generation callback
- `POST /api/callbacks/ably-publish` - Ably publishing callback

### Solo Mode
- `GET /api/solo-result/:sessionId` - Get solo mode processing result

### Access Management
- `POST /api/generate-access-code` - Generate channel access code
- `POST /api/join-channel` - Join channel with access code

## 🔧 Service Configurations

### Groq STT Configuration
- **Model**: `whisper-large-v3-turbo`
- **Endpoint**: `https://api.groq.com/openai/v1/audio/transcriptions`
- **Format**: `json`

### DeepL Translation Configuration
- **Endpoint**: `https://api.deepl.com/v2/translate`
- **Model**: `prefer_quality_optimized`
- **Formality**: `prefer_less`

### ElevenLabs TTS Configuration
- **Model**: `eleven_flash_v2_5`
- **Endpoint**: `https://api.elevenlabs.io/v1/text-to-speech/{voice_id}/stream`
- **Format**: `mp3`

## 🗄️ Database Schema

The application uses PostgreSQL with the following main tables:
- `users` - User management
- `sessions` - Session tracking
- `stt_transcriptions` - Speech-to-text results
- `translations` - Translation results
- `tts_syntheses` - Text-to-speech results
- `voice_ids` - Generated voice IDs
- `ably_messages` - Real-time messages

## 🔒 Security & Production Notes

- All API keys are stored securely in environment variables
- Message queue callbacks include session validation
- Database connections use SSL
- Rate limiting implemented for API endpoints
- Error handling with proper logging

## 🚨 Troubleshooting

### Common Issues

1. **Queue Processing Stuck**
   - Check Upstash QStash dashboard for failed jobs
   - Verify callback URLs are accessible
   - Check API key validity

2. **Audio Not Playing**
   - Verify browser audio permissions
   - Check audio format compatibility
   - Ensure HTTPS for production

3. **Translation Errors**
   - Verify DeepL API key and quota
   - Check language code format (uppercase)
   - Ensure text length limits

## 📈 Monitoring

- Queue status: Upstash QStash dashboard
- Real-time connections: Ably dashboard
- API usage: Service provider dashboards
- Application logs: Vercel function logs

## 🔄 Deployment

The application is configured for Vercel deployment:

```bash
# Deploy to Vercel
npm run deploy
```

Ensure all environment variables are set in your Vercel project settings.

## 📝 License

This project is proprietary and confidential. All rights reserved.

---

**⚡️ BRIDGIT-AI — Production-Ready Voice Translation Platform**
