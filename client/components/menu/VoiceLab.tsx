import React, { useState, useEffect, useRef } from "react";
import { 
  Mic, 
  Download, 
  Play, 
  Pause, 
  Trash2, 
  Settings, 
  Upload, 
  Search,
  Star,
  Crown,
  Volume2,
  Save,
  Copy,
  AlertTriangle,
  ThumbsUp,
  Wand2
} from "lucide-react";
import { VoiceCard } from "../ui/voice-card";
import { VoicePlayer } from "../ui/voice-player";

interface Voice {
  voice_id: string;
  name: string;
  category: string;
  description?: string;
  preview_url?: string;
  available_for_tiers?: string[];
  settings?: {
    stability: number;
    similarity_boost: number;
    style: number;
    use_speaker_boost: boolean;
    gender?: string;
  };
  is_premium?: boolean;
  is_cloned?: boolean;
}

interface VoiceLabProps {
  onBack: () => void;
}

export const VoiceLab: React.FC<VoiceLabProps> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<'premium' | 'clone' | 'saved' | 'create'>('premium');
  const [voices, setVoices] = useState<Voice[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [playingVoice, setPlayingVoice] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [cloneName, setCloneName] = useState('');
  const [cloneDescription, setCloneDescription] = useState('');
  const [selectedVoice, setSelectedVoice] = useState<Voice | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  
  // Create Voice states
  const [createVoiceName, setCreateVoiceName] = useState('');
  const [createVoiceDescription, setCreateVoiceDescription] = useState('');
  const [createText, setCreateText] = useState('');
  const [createGender, setCreateGender] = useState('all');
  const [createAge, setCreateAge] = useState('all');
  const [createAccent, setCreateAccent] = useState('all');
  const [createLanguage, setCreateLanguage] = useState('all');
  const [createSoundType, setCreateSoundType] = useState('all');
  const [createIsFemale, setCreateIsFemale] = useState(true);
  const [createIsMale, setCreateIsMale] = useState(true);
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [createSuccess, setCreateSuccess] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Fetch voices on component mount
  useEffect(() => {
    fetchVoices();
  }, []);

  const fetchVoices = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/voice-lab/voices');
      const data = await response.json();
      
      if (data.success) {
        // Categorize voices
        const categorizedVoices = data.voices.map((voice: any) => ({
          ...voice,
          is_premium: voice.available_for_tiers?.includes('premium') || voice.category === 'premium',
          is_cloned: voice.category === 'cloned' || voice.sharing?.status === 'private'
        }));
        setVoices(categorizedVoices);
      }
    } catch (error) {
      console.error('Error fetching voices:', error);
    } finally {
      setLoading(false);
    }
  };

  const startRecording = async () => {
    try {
      // Start countdown
      setCountdown(3);
      const countdownInterval = setInterval(() => {
        setCountdown(prev => {
          if (prev === null || prev <= 1) {
            clearInterval(countdownInterval);
            // Actually start recording after countdown
            startActualRecording();
            return null;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (error) {
      console.error('Error starting recording:', error);
    }
  };

  const startActualRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setRecordingTime(0);

      // Start timer
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

    } catch (error) {
      console.error('Error starting recording:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }

      // Stop all tracks
      mediaRecorderRef.current.stream?.getTracks().forEach(track => track.stop());
      
      // Show preview section after recording stops
      setTimeout(() => {
        setShowPreview(true);
      }, 500);
    }
  };

  const saveAudio = async () => {
    if (!cloneName.trim()) {
      alert('Please enter a name for your voice');
      return;
    }

    if (recordingTime < 60) {
      alert('Please record at least 1 minute of audio for voice cloning');
      return;
    }

    const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
    const formData = new FormData();
    formData.append('audio', audioBlob, 'voice-sample.wav');
    formData.append('name', cloneName);
    formData.append('description', cloneDescription);

    setLoading(true);
    try {
      const response = await fetch('/api/voice-lab/voices/clone', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      
      if (data.success) {
        alert('Voice saved successfully!');
        setCloneName('');
        setCloneDescription('');
        setRecordingTime(0);
        setShowPreview(false);
        audioChunksRef.current = [];
        fetchVoices(); // Refresh voices list
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error('Error saving voice:', error);
      alert('Failed to save voice');
    } finally {
      setLoading(false);
    }
  };

  const playVoice = async (voice: Voice) => {
    if (playingVoice === voice.voice_id) {
      // Stop playing
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      setPlayingVoice(null);
      return;
    }

    if (voice.preview_url) {
      try {
        if (audioRef.current) {
          audioRef.current.pause();
        }
        
        audioRef.current = new Audio(voice.preview_url);
        audioRef.current.onended = () => setPlayingVoice(null);
        audioRef.current.onpause = () => setPlayingVoice(null);
        
        await audioRef.current.play();
        setPlayingVoice(voice.voice_id);
      } catch (error) {
        console.error('Error playing voice:', error);
      }
    }
  };

  const deleteVoice = async (voiceId: string) => {
    if (!confirm('Are you sure you want to delete this voice?')) return;

    try {
      const response = await fetch(`/api/voice-lab/voices/${voiceId}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      
      if (data.success) {
        alert('Voice deleted successfully');
        fetchVoices(); // Refresh voices list
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error('Error deleting voice:', error);
      alert('Failed to delete voice');
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // New state for category and gender filters
  const [voiceCategoryFilter, setVoiceCategoryFilter] = useState<string>('all');
  const [voiceGenderFilter, setVoiceGenderFilter] = useState<string>('all');

  // Filter voices based on search, category, and gender
  const filteredVoices = voices.filter(voice => {
    const matchesSearch = voice.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         voice.description?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = voiceCategoryFilter === 'all' || voice.category === voiceCategoryFilter;
    const matchesGender = voiceGenderFilter === 'all' || (voice.settings?.gender || 'unknown') === voiceGenderFilter;

    switch (activeTab) {
      case 'premium':
        return matchesSearch && voice.is_premium && matchesCategory && matchesGender;
      case 'clone':
        return matchesSearch && matchesCategory && matchesGender; // Show all for cloning reference
      case 'saved':
        return matchesSearch && voice.is_cloned && matchesCategory && matchesGender;
      default:
        return matchesSearch && matchesCategory && matchesGender;
    }
  });

  return (
    <><div className="voice-lab-container">
      <div className="fixed inset-0 z-50" style={{ background: '#73ff00' }}></div>
      <div className="fixed inset-0 z-50 flex items-center justify-center"></div>
      <div
        className="absolute inset-4"
        style={{
          borderRadius: '26px',
          background: '#73ff00',
          boxShadow: '29px 29px 59px #429100, -29px -29px 59px #a4ff00'
        }}
      >
        {/* Close overlay */}
        <div className="absolute inset-0" onClick={onBack} />
      </div>

      {/* Scrollable Content */}
      <div className="relative z-10 h-full overflow-y-auto menu-scrollable"></div>
      <div className="flex items-start justify-center min-h-full py-8">
      </div>
      <div className="w-full max-w-6xl mx-6 animate-fade-in-up">
      </div>
      <div className="p-8 space-y-8">
      </div>  {/* Back button */}
    </div><button
      onClick={onBack}
      className="absolute -top-16 left-0 transition-colors"
      style={{ fontFamily: 'Orbitron, monospace', color: '#000000' }}
    >
        <span className="text-sm uppercase tracking-wider font-bold">BACK</span>
      </button></>

      {/* Tab Navigation - Green Button Cards */};
      <div className="flex justify-center space-x-4 mb-8">
        <VoiceCard
          variant="button"
          onClick={() => setActiveTab('premium')}
          className={`${activeTab === 'premium' ? 'ring-2 ring-black' : ''} p-5`}
        >
          <div className="flex flex-col items-center">
            <Crown size={28} color="#000000" />
            <span className="text-xs mt-2 text-black font-bold" style={{ fontFamily: 'Orbitron, monospace' }}>PREMIUM VOICE</span>
          </div>
        </VoiceCard>

        <VoiceCard
          variant="button"
          onClick={() => setActiveTab('clone')}
          className={`${activeTab === 'clone' ? 'ring-4 ring-black shadow-inner' : ''} p-5`}
        >
          <div className="flex flex-col items-center">
            <Copy size={28} color="#000000" />
            <span className="text-xs mt-2 text-black font-bold" style={{ fontFamily: 'Orbitron, monospace' }}>CLONE VOICE</span>
          </div>
        </VoiceCard>


        <VoiceCard
          variant="button"
          onClick={() => setActiveTab('create')}
          className={`${activeTab === 'create' ? 'ring-2 ring-black' : ''} p-5`}
        >
          <div className="flex flex-col items-center">
            <Wand2 size={28} color="#000000" />
            <span className="text-xs mt-2 text-black font-bold" style={{ fontFamily: 'Orbitron, monospace' }}>CREATE VOICE</span>
          </div>
        </VoiceCard>

        <VoiceCard
          variant="button"
          onClick={() => setActiveTab('saved')}
          className={`${activeTab === 'saved' ? 'ring-2 ring-black' : ''} p-5`}
        >
          <div className="flex flex-col items-center">
            <Save size={28} color="#000000" />
            <span className="text-xs mt-2 text-black font-bold" style={{ fontFamily: 'Orbitron, monospace' }}>SAVED VOICES</span>
          </div>
        </VoiceCard>
      </div>

      {/* Content based on active tab */}
      {activeTab === 'clone' ? (
        <div className="space-y-6">
          {/* Voice Cloning Interface */}
          <VoiceCard>
            <h3 className="text-2xl text-black mb-4 font-bold" style={{ fontFamily: 'Orbitron, monospace' }}>Clone Your Voice</h3>
            <p className="text-black mb-6" style={{ fontFamily: 'Orbitron, monospace' }}>Record at least 1 minute of clear audio to create your voice clone</p>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Side - Information Cards */}
              <div className="space-y-4">
                <VoiceCard>
                  <div className="flex items-start space-x-3">
                    <AlertTriangle size={20} color="#000000" className="mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="text-black font-bold text-sm" style={{ fontFamily: 'Orbitron, monospace' }}>Avoid noisy environments</h4>
                      <p className="text-black text-xs mt-1" style={{ fontFamily: 'Orbitron, monospace' }}>Background sounds interfere with recording quality results</p>
                    </div>
                  </div>
                </VoiceCard>

                <VoiceCard>
                  <div className="flex items-start space-x-3">
                    <ThumbsUp size={20} color="#000000" className="mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="text-black font-bold text-sm" style={{ fontFamily: 'Orbitron, monospace' }}>Check microphone quality</h4>
                      <p className="text-black text-xs mt-1" style={{ fontFamily: 'Orbitron, monospace' }}>Try external units or headphone mics for better audio capture</p>
                    </div>
                  </div>
                </VoiceCard>

                <VoiceCard>
                  <div className="flex items-start space-x-3">
                    <Mic size={20} color="#000000" className="mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="text-black font-bold text-sm" style={{ fontFamily: 'Orbitron, monospace' }}>Use consistent equipment</h4>
                      <p className="text-black text-xs mt-1" style={{ fontFamily: 'Orbitron, monospace' }}>Don't change recording equipment between samples</p>
                    </div>
                  </div>
                </VoiceCard>
              </div>

              {/* Center - Recording Interface */}
              <div className="flex flex-col items-center justify-center space-y-6">
                {/* Countdown Display */}
                {countdown !== null && (
                  <div className="text-6xl font-bold text-black" style={{ fontFamily: 'Orbitron, monospace' }}>
                    {countdown}
                  </div>
                )}

                {/* Wave Animation / Recording Visualization */}
                <div
                  className="w-full h-32 flex items-center justify-center"
                  style={{
                    borderRadius: '26px',
                    background: isRecording ? 'linear-gradient(45deg, #73ff00, #a4ff00, #429100)' : '#73ff00',
                    boxShadow: '23px 23px 46px #429100, -23px -23px 46px #a4ff00',
                    padding: '16px'
                  }}
                >
                  {isRecording ? (
                    <div className="flex items-center space-x-1">
                      {[...Array(20)].map((_, i) => (
                        <div
                          key={i}
                          className="bg-black"
                          style={{
                            width: '4px',
                            height: `${20 + Math.sin(Date.now() * 0.01 + i) * 30}px`,
                            animation: 'pulse 0.5s ease-in-out infinite',
                            animationDelay: `${i * 0.05}s`
                          }} />
                      ))}
                    </div>
                  ) : (
                    <div className="text-black text-center" style={{ fontFamily: 'Orbitron, monospace' }}>
                      <p className="text-lg font-bold">Ready to Record</p>
                    </div>
                  )}
                </div>

                {/* Timer Display */}
                <div className="text-black text-center">
                  <div className="text-3xl font-bold" style={{ fontFamily: 'Orbitron, monospace' }}>{formatTime(recordingTime)}</div>
                  <div className="text-sm" style={{ fontFamily: 'Orbitron, monospace' }}>
                    {recordingTime < 60 ? `${60 - recordingTime}s remaining` : 'Ready to save'}
                  </div>
                </div>

                {/* Recording Controls */}
                <div className="flex flex-col items-center space-y-4">
                  <VoiceCard
                    variant="button"
                    onClick={isRecording ? stopRecording : startRecording}
                    className="px-8 py-4"
                  >
                    <span className="text-black font-bold text-lg" style={{ fontFamily: 'Orbitron, monospace' }}>
                      {isRecording ? 'STOP RECORDING' : 'START CLONING'}
                    </span>
                  </VoiceCard>

                  {/* Upload Button */}
                  <div className="relative">
                    <input
                      type="file"
                      accept="audio/*"
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file && file.size <= 10 * 1024 * 1024) { // 10MB limit
                          // Handle file upload
                          console.log('File selected:', file);
                        } else if (file) {
                          alert('File size must be under 10MB');
                        }
                      } } />
                    <VoiceCard variant="button" className="px-6 py-3">
                      <div className="flex items-center space-x-2">
                        <Upload size={20} color="#000000" />
                        <span className="text-black font-bold text-sm" style={{ fontFamily: 'Orbitron, monospace' }}>
                          UPLOAD AUDIO (10MB MAX)
                        </span>
                      </div>
                    </VoiceCard>
                  </div>
                </div>
              </div>

              {/* Right Side - AI Content Generator */}
              <div>
                <VoiceCard className="h-full">
                  <div className="text-center p-2">
                    <h4 className="text-black font-bold text-base mb-3" style={{ fontFamily: 'Orbitron, monospace' }}>AI CONTENT GENERATOR</h4>
                    <p className="text-black text-xs mb-4" style={{ fontFamily: 'Orbitron, monospace' }}>Need help with what to record? Generate content to read aloud.</p>
                    <VoiceCard variant="button" className="w-full" onClick={() => alert('Content generation coming soon!')}>
                      <span className="text-black font-bold text-sm" style={{ fontFamily: 'Orbitron, monospace' }}>CREATE NOW</span>
                    </VoiceCard>
                  </div>
                </VoiceCard>
              </div>
            </div>
          </VoiceCard>

          {/* Preview Section - Expands after recording */}
          {showPreview && audioChunksRef.current.length > 0 && (
            <VoiceCard>
              <div className="space-y-6">
                {/* Audio Player */}
                <div className="text-center">
                  <h4 className="text-black font-bold text-xl mb-4" style={{ fontFamily: 'Orbitron, monospace' }}>PREVIEW VOICE</h4>
                  <VoicePlayer
                    audioUrl={URL.createObjectURL(new Blob(audioChunksRef.current, { type: 'audio/wav' }))}
                    voiceName={cloneName || 'Your Voice'}
                    isDownloadable={false} />
                </div>

                {/* Voice Details and Actions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <VoiceCard variant="input">
                      <label className="block text-black mb-2 font-bold text-sm" style={{ fontFamily: 'Orbitron, monospace' }}>VOICE NAME</label>
                      <input
                        type="text"
                        value={cloneName}
                        onChange={(e) => setCloneName(e.target.value)}
                        className="w-full p-2 bg-transparent text-black border-none outline-none"
                        style={{ fontFamily: 'Orbitron, monospace' }}
                        placeholder="Enter voice name" />
                    </VoiceCard>

                    <VoiceCard variant="input">
                      <label className="block text-black mb-2 font-bold text-sm" style={{ fontFamily: 'Orbitron, monospace' }}>DESCRIPTION</label>
                      <input
                        type="text"
                        value={cloneDescription}
                        onChange={(e) => setCloneDescription(e.target.value)}
                        className="w-full p-2 bg-transparent text-black border-none outline-none"
                        style={{ fontFamily: 'Orbitron, monospace' }}
                        placeholder="Brief description" />
                    </VoiceCard>
                  </div>

                  <div className="flex flex-col justify-end space-y-4">
                    <VoiceCard variant="button" onClick={() => setShowPreview(false)}>
                      <span className="text-black font-bold" style={{ fontFamily: 'Orbitron, monospace' }}>BACK</span>
                    </VoiceCard>

                    <VoiceCard
                      variant="button"
                      onClick={saveAudio}
                      disabled={!cloneName.trim() || loading}
                    >
                      <span className="text-black font-bold" style={{ fontFamily: 'Orbitron, monospace' }}>
                        {loading ? 'SAVING...' : 'SAVE AUDIO'}
                      </span>
                    </VoiceCard>
                  </div>
                </div>

                {/* Disclaimer */}
                <div className="text-xs text-black" style={{ fontFamily: 'Orbitron, monospace' }}>
                  <p>I hereby confirm that I have all necessary rights or consents to upload and clone these voice samples and that I will not use the platform-generated content for any illegal, fraudulent, or harmful purpose. I confirm my obligation to abide by ElevenLabs' Terms of Service, Prohibited Content and Uses Policy and Privacy Policy.</p>
                </div>
              </div>
            </VoiceCard>
          )}
        </div>
      ) : (
        <>
          {activeTab === 'create' ? (
            <div className="space-y-6">
              <VoiceCard>
                <h3 className="text-2xl text-black mb-4 font-bold" style={{ fontFamily: 'Orbitron, monospace' }}>Create Voice</h3>

                {/* Voice Name */}
                <VoiceCard variant="input" className="mb-4">
                  <label className="block text-black mb-2 font-bold text-sm" style={{ fontFamily: 'Orbitron, monospace' }}>Voice Name</label>
                  <input
                    type="text"
                    value={createVoiceName}
                    onChange={(e) => setCreateVoiceName(e.target.value)}
                    className="w-full p-2 bg-transparent text-black border-none outline-none"
                    style={{ fontFamily: 'Orbitron, monospace' }}
                    placeholder="Enter voice name" />
                </VoiceCard>

                {/* Voice Description */}
                <VoiceCard variant="input" className="mb-4">
                  <label className="block text-black mb-2 font-bold text-sm" style={{ fontFamily: 'Orbitron, monospace' }}>Voice Description</label>
                  <textarea
                    value={createVoiceDescription}
                    onChange={(e) => setCreateVoiceDescription(e.target.value)}
                    className="w-full p-2 bg-transparent text-black border-none outline-none resize-none"
                    rows={3}
                    style={{ fontFamily: 'Orbitron, monospace' }}
                    placeholder="Describe your voice" />
                </VoiceCard>

                {/* Text to Speak */}
                <VoiceCard variant="input" className="mb-4">
                  <label className="block text-black mb-2 font-bold text-sm" style={{ fontFamily: 'Orbitron, monospace' }}>Text to Speak</label>
                  <textarea
                    value={createText}
                    onChange={(e) => setCreateText(e.target.value)}
                    className="w-full p-2 bg-transparent text-black border-none outline-none resize-none"
                    rows={4}
                    style={{ fontFamily: 'Orbitron, monospace' }}
                    placeholder="Enter text for voice synthesis" />
                </VoiceCard>

                {/* Gender Selection */}
                <VoiceCard variant="input" className="mb-4">
                  <label className="block text-black mb-2 font-bold text-sm" style={{ fontFamily: 'Orbitron, monospace' }}>Gender</label>
                  <div className="flex space-x-4">
                    <label className="inline-flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={createIsFemale}
                        onChange={() => setCreateIsFemale(!createIsFemale)} />
                      <span style={{ fontFamily: 'Orbitron, monospace' }}>Female</span>
                    </label>
                    <label className="inline-flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={createIsMale}
                        onChange={() => setCreateIsMale(!createIsMale)} />
                      <span style={{ fontFamily: 'Orbitron, monospace' }}>Male</span>
                    </label>
                  </div>
                </VoiceCard>

                {/* Language Selection */}
                <VoiceCard variant="input" className="mb-4">
                  <label className="block text-black mb-2 font-bold text-sm" style={{ fontFamily: 'Orbitron, monospace' }}>Language</label>
                  <select
                    value={createLanguage}
                    onChange={(e) => setCreateLanguage(e.target.value)}
                    className="w-full p-2 bg-transparent text-black border-none outline-none"
                    style={{ fontFamily: 'Orbitron, monospace' }}
                  >
                    <option value="all">All Languages</option>
                    <option value="en">English</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                    <option value="de">German</option>
                    <option value="zh">Chinese</option>
                    {/* Add more languages as needed */}
                  </select>
                </VoiceCard>

                {/* Age Selection */}
                <VoiceCard variant="input" className="mb-4">
                  <label className="block text-black mb-2 font-bold text-sm" style={{ fontFamily: 'Orbitron, monospace' }}>Age</label>
                  <select
                    value={createAge}
                    onChange={(e) => setCreateAge(e.target.value)}
                    className="w-full p-2 bg-transparent text-black border-none outline-none"
                    style={{ fontFamily: 'Orbitron, monospace' }}
                  >
                    <option value="all">All Ages</option>
                    <option value="child">Child</option>
                    <option value="teen">Teen</option>
                    <option value="adult">Adult</option>
                    <option value="senior">Senior</option>
                  </select>
                </VoiceCard>

                {/* Accent Selection */}
                <VoiceCard variant="input" className="mb-4">
                  <label className="block text-black mb-2 font-bold text-sm" style={{ fontFamily: 'Orbitron, monospace' }}>Accent</label>
                  <select
                    value={createAccent}
                    onChange={(e) => setCreateAccent(e.target.value)}
                    className="w-full p-2 bg-transparent text-black border-none outline-none"
                    style={{ fontFamily: 'Orbitron, monospace' }}
                  >
                    <option value="all">All Accents</option>
                    <option value="us">US</option>
                    <option value="uk">UK</option>
                    <option value="au">Australian</option>
                    <option value="ca">Canadian</option>
                    {/* Add more accents as needed */}
                  </select>
                </VoiceCard>

                {/* Sound Type Selection */}
                <VoiceCard variant="input" className="mb-4">
                  <label className="block text-black mb-2 font-bold text-sm" style={{ fontFamily: 'Orbitron, monospace' }}>Sound Type</label>
                  <select
                    value={createSoundType}
                    onChange={(e) => setCreateSoundType(e.target.value)}
                    className="w-full p-2 bg-transparent text-black border-none outline-none"
                    style={{ fontFamily: 'Orbitron, monospace' }}
                  >
                    <option value="all">All Types</option>
                    <option value="soft">Soft</option>
                    <option value="loud">Loud</option>
                    <option value="clear">Clear</option>
                    <option value="nasal">Nasal</option>
                    {/* Add more sound types as needed */}
                  </select>
                </VoiceCard>

                {/* Buttons */}
                <div className="flex space-x-4">
                  <VoiceCard
                    variant="button"
                    onClick={() => {
                      setCreateVoiceName('');
                      setCreateVoiceDescription('');
                      setCreateText('');
                      setCreateGender('all');
                      setCreateAge('all');
                      setCreateAccent('all');
                      setCreateLanguage('all');
                      setCreateSoundType('all');
                      setCreateIsFemale(true);
                      setCreateIsMale(true);
                      setCreateError(null);
                      setCreateSuccess(null);
                    } }
                  >
                    <span className="text-black font-bold" style={{ fontFamily: 'Orbitron, monospace' }}>Reset</span>
                  </VoiceCard>

                  <VoiceCard
                    variant="button"
                    onClick={async () => {
                      setCreateLoading(true);
                      setCreateError(null);
                      setCreateSuccess(null);
                      try {
                        // Validate required fields
                        if (!createVoiceName.trim()) {
                          setCreateError('Voice name is required');
                          setCreateLoading(false);
                          return;
                        }
                        if (!createVoiceDescription.trim()) {
                          setCreateError('Voice description is required');
                          setCreateLoading(false);
                          return;
                        }
                        if (!createText.trim()) {
                          setCreateError('Text to speak is required');
                          setCreateLoading(false);
                          return;
                        }
                        // Prepare labels based on filters
                        const labels = [];
                        if (createGender !== 'all') labels.push(createGender);
                        if (createAge !== 'all') labels.push(createAge);
                        if (createAccent !== 'all') labels.push(createAccent);
                        if (createLanguage !== 'all') labels.push(createLanguage);
                        if (createSoundType !== 'all') labels.push(createSoundType);
                        // Gender checkboxes
                        if (createIsFemale && !labels.includes('female')) labels.push('female');
                        if (createIsMale && !labels.includes('male')) labels.push('male');

                        const response = await fetch('/api/voice-lab/voices/create', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            voice_name: createVoiceName,
                            voice_description: createVoiceDescription,
                            text: createText,
                            gender: createGender !== 'all' ? createGender : undefined,
                            age: createAge !== 'all' ? createAge : undefined,
                            accent: createAccent !== 'all' ? createAccent : undefined,
                            language: createLanguage !== 'all' ? createLanguage : undefined,
                            sound_type: createSoundType !== 'all' ? createSoundType : undefined,
                            labels,
                          }),
                        });

                        const data = await response.json();
                        if (response.ok && data.success) {
                          setCreateSuccess('Voice created successfully!');
                          // Optionally reset form or keep values
                        } else {
                          setCreateError(data.error || 'Failed to create voice');
                        }
                      } catch (error) {
                        setCreateError('Network error or server unreachable');
                      } finally {
                        setCreateLoading(false);
                      }
                    } }
                    disabled={createLoading}
                  >
                    <span className="text-black font-bold">
                      {createLoading ? 'Creating...' : 'Create Voice'}
                    </span>
                  </VoiceCard>
                </div>

                {/* Error and Success Messages */}
                {createError && (
                  <div className="text-red-600 font-bold mt-4" style={{ fontFamily: 'Orbitron, monospace' }}>
                    {createError}
                  </div>
                )}
                {createSuccess && (
                  <div className="text-green-600 font-bold mt-4" style={{ fontFamily: 'Orbitron, monospace' }}>
                    {createSuccess}
                  </div>
                )}
              </VoiceCard>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2" color="#000000" size={20} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 glass-luxury-dark text-black rounded-xl border border-gray-700 focus:border-primary focus:ring-2 focus:ring-primary/20"
                  style={{ fontFamily: 'Orbitron, monospace' }}
                  placeholder="Search voices..." />
              </div>

              {/* Voices Grid */}
              {loading ? (
                <div className="text-center py-12">
                  <div className="text-black text-xl" style={{ fontFamily: 'Orbitron, monospace' }}>Loading voices...</div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredVoices.map((voice) => (
                    <VoiceCard key={voice.voice_id} className="hover:scale-105 transition-all">
                      <div className="space-y-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="text-black flex items-center text-lg font-bold" style={{ fontFamily: 'Orbitron, monospace' }}>
                              {voice.name}
                              {voice.is_premium && <Crown className="ml-2" color="#000000" size={18} />}
                            </h4>
                            <p className="text-sm text-black capitalize" style={{ fontFamily: 'Orbitron, monospace' }}>{voice.category}</p>
                          </div>

                          {voice.is_cloned && (
                            <VoiceCard variant="button" onClick={() => deleteVoice(voice.voice_id)} className="p-1">
                              <Trash2 size={16} color="#000000" />
                            </VoiceCard>
                          )}
                        </div>

                        {voice.description && (
                          <p className="text-sm text-black" style={{ fontFamily: 'Orbitron, monospace' }}>{voice.description}</p>
                        )}

                        {/* Voice Player Component */}
                        <VoicePlayer
                          audioUrl={voice.preview_url}
                          voiceName={voice.name}
                          isDownloadable={voice.is_cloned}
                          onDownload={() => {
                            alert('Download feature coming soon!');
                          } } />

                        {/* Voice Settings Preview */}
                        {voice.settings && (
                          <div className="text-xs text-black space-y-1" style={{ fontFamily: 'Orbitron, monospace' }}>
                            <div>Stability: {voice.settings.stability}</div>
                            <div>Similarity: {voice.settings.similarity_boost}</div>
                          </div>
                        )}
                      </div>
                    </VoiceCard>
                  ))}
                </div>
              )}

              {filteredVoices.length === 0 && !loading && (
                <div className="text-center py-12">
                  <div className="text-black text-lg" style={{ fontFamily: 'Orbitron, monospace' }}>No voices found</div>
                </div>
              )}
            </div>
          )}
        </>
        