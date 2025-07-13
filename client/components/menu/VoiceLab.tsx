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
  Copy
} from "lucide-react";
import { NeumorphCard } from "../ui/neumorphism-card";

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
  };
  is_premium?: boolean;
  is_cloned?: boolean;
}

interface VoiceLabProps {
  onBack: () => void;
}

export const VoiceLab: React.FC<VoiceLabProps> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<'premium' | 'clone' | 'saved'>('premium');
  const [voices, setVoices] = useState<Voice[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [playingVoice, setPlayingVoice] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [cloneName, setCloneName] = useState('');
  const [cloneDescription, setCloneDescription] = useState('');
  const [selectedVoice, setSelectedVoice] = useState<Voice | null>(null);
  
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
    }
  };

  const cloneVoice = async () => {
    if (!cloneName.trim()) {
      alert('Please enter a name for your cloned voice');
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
        alert('Voice cloned successfully!');
        setCloneName('');
        setCloneDescription('');
        setRecordingTime(0);
        audioChunksRef.current = [];
        fetchVoices(); // Refresh voices list
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error('Error cloning voice:', error);
      alert('Failed to clone voice');
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

  const filteredVoices = voices.filter(voice => {
    const matchesSearch = voice.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         voice.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    switch (activeTab) {
      case 'premium':
        return matchesSearch && voice.is_premium;
      case 'clone':
        return matchesSearch; // Show all for cloning reference
      case 'saved':
        return matchesSearch && voice.is_cloned;
      default:
        return matchesSearch;
    }
  });

  return (
    <div className="fixed inset-0 z-50" style={{ background: '#73ff00' }}>
      {/* Full overlay card */}
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

        {/* Scrollable Content */}
        <div className="relative z-10 h-full overflow-y-auto menu-scrollable">
          <div className="flex items-start justify-center min-h-full py-8">
            <div className="w-full max-w-6xl mx-6 animate-fade-in-up">
              <div className="p-8 space-y-8">
                {/* Back button */}
                <button
                  onClick={onBack}
                  className="absolute -top-16 left-0 transition-colors"
                  style={{ fontFamily: 'Orbitron, monospace', color: '#000000' }}
                >
                  <span className="text-sm uppercase tracking-wider font-bold">BACK</span>
                </button>

                {/* Tab Navigation - Green Button Cards */}
                <div className="flex justify-center space-x-6 mb-8">
                  <NeumorphCard
                    variant="green-button"
                    onClick={() => setActiveTab('premium')}
                    className={activeTab === 'premium' ? 'ring-2 ring-black' : ''}
                  >
                    <div className="flex flex-col items-center">
                      <Crown size={24} color="#000000" />
                      <span className="text-xs mt-1">PREMIUM</span>
                    </div>
                  </NeumorphCard>
                  
                  <NeumorphCard
                    variant="green-button"
                    onClick={() => setActiveTab('clone')}
                    className={activeTab === 'clone' ? 'ring-2 ring-black' : ''}
                  >
                    <div className="flex flex-col items-center">
                      <Copy size={24} color="#000000" />
                      <span className="text-xs mt-1">CLONE</span>
                    </div>
                  </NeumorphCard>
                  
                  <NeumorphCard
                    variant="green-button"
                    onClick={() => setActiveTab('saved')}
                    className={activeTab === 'saved' ? 'ring-2 ring-black' : ''}
                  >
                    <div className="flex flex-col items-center">
                      <Save size={24} color="#000000" />
                      <span className="text-xs mt-1">SAVED</span>
                    </div>
                  </NeumorphCard>
                </div>

              {/* Content based on active tab */}
              {activeTab === 'clone' ? (
                <div className="space-y-6">
                  {/* Voice Cloning Interface */}
                  <div className="glass-luxury-dark rounded-2xl p-6 border border-gray-700">
                    <h3 className="text-2xl font-luxury-display text-white mb-4 text-glow-luxury">Clone Your Voice</h3>
                    <p className="text-gray-400 mb-6 font-luxury">Record at least 1 minute of clear audio to create your voice clone</p>
                    
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-white font-luxury mb-2">Voice Name *</label>
                          <input
                            type="text"
                            value={cloneName}
                            onChange={(e) => setCloneName(e.target.value)}
                            className="w-full p-4 glass-luxury-dark text-white rounded-xl border border-gray-700 focus:border-primary focus:ring-2 focus:ring-primary/20 font-luxury"
                            placeholder="Enter voice name"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-white font-luxury mb-2">Description</label>
                          <textarea
                            value={cloneDescription}
                            onChange={(e) => setCloneDescription(e.target.value)}
                            className="w-full p-4 glass-luxury-dark text-white rounded-xl border border-gray-700 focus:border-primary focus:ring-2 focus:ring-primary/20 font-luxury"
                            placeholder="Describe your voice (optional)"
                            rows={3}
                          />
                        </div>
                      </div>

                      {/* Recording Controls */}
                      <div className="glass-luxury rounded-xl p-6 border border-gray-700">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-6">
                            <button
                              onClick={isRecording ? stopRecording : startRecording}
                              className={`p-4 rounded-full transition-all ${
                                isRecording 
                                  ? 'bg-red-500 hover:bg-red-600 shadow-luxury' 
                                  : 'bg-luxury-gradient hover:scale-105 shadow-luxury glow-luxury'
                              }`}
                            >
                              <Mic size={24} className="text-black" />
                            </button>
                            <div className="text-white">
                              <div className="text-2xl font-brand text-glow-luxury">{formatTime(recordingTime)}</div>
                              <div className="text-sm text-gray-400 font-luxury">
                                {recordingTime < 60 ? `${60 - recordingTime}s remaining` : 'Ready to clone'}
                              </div>
                            </div>
                          </div>
                          
                          <button
                            onClick={cloneVoice}
                            disabled={recordingTime < 60 || !cloneName.trim() || loading}
                            className="px-8 py-3 bg-luxury-gradient text-black font-luxury rounded-xl hover:scale-105 transition-all shadow-luxury glow-luxury disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                          >
                            {loading ? 'CLONING...' : 'CLONE VOICE'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Search */}
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 glass-luxury-dark text-white rounded-xl border border-gray-700 focus:border-primary focus:ring-2 focus:ring-primary/20 font-luxury"
                      placeholder="Search voices..."
                    />
                  </div>

                  {/* Voices Grid */}
                  {loading ? (
                    <div className="text-center py-12">
                      <div className="text-white font-luxury text-xl">Loading voices...</div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {filteredVoices.map((voice) => (
                        <div key={voice.voice_id} className="glass-luxury-dark rounded-xl p-6 border border-gray-700 hover:border-primary/50 transition-all">
                          <div className="space-y-4">
                            <div className="flex items-start justify-between">
                              <div>
                                <h4 className="font-luxury-display text-white flex items-center text-lg">
                                  {voice.name}
                                  {voice.is_premium && <Crown className="ml-2 text-accent" size={18} />}
                                </h4>
                                <p className="text-sm text-gray-400 capitalize font-luxury">{voice.category}</p>
                              </div>
                              
                              {voice.is_cloned && (
                                <button
                                  onClick={() => deleteVoice(voice.voice_id)}
                                  className="p-2 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg transition-all"
                                >
                                  <Trash2 size={16} />
                                </button>
                              )}
                            </div>

                            {voice.description && (
                              <p className="text-sm text-gray-300 font-luxury">{voice.description}</p>
                            )}

                            <div className="flex items-center justify-between">
                              <button
                                onClick={() => playVoice(voice)}
                                className="flex items-center space-x-2 px-4 py-2 bg-luxury-gradient text-black rounded-lg hover:scale-105 transition-all shadow-luxury"
                              >
                                {playingVoice === voice.voice_id ? (
                                  <Pause size={16} />
                                ) : (
                                  <Play size={16} />
                                )}
                                <span className="text-sm font-luxury">
                                  {playingVoice === voice.voice_id ? 'PAUSE' : 'PLAY'}
                                </span>
                              </button>

                              {voice.is_cloned && (
                                <button
                                  onClick={() => {
                                    // Download voice functionality
                                    alert('Download feature coming soon!');
                                  }}
                                  className="p-2 text-accent hover:text-accent/80 hover:bg-accent/10 rounded-lg transition-all"
                                >
                                  <Download size={16} />
                                </button>
                              )}
                            </div>

                            {/* Voice Settings Preview */}
                            {voice.settings && (
                              <div className="text-xs text-gray-400 space-y-1 font-luxury">
                                <div>Stability: {voice.settings.stability}</div>
                                <div>Similarity: {voice.settings.similarity_boost}</div>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {filteredVoices.length === 0 && !loading && (
                    <div className="text-center py-12">
                      <div className="text-gray-400 font-luxury text-lg">No voices found</div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
