import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, Download } from 'lucide-react';
import { VoiceCard } from './voice-card';

interface VoicePlayerProps {
  audioUrl?: string;
  voiceName?: string;
  isDownloadable?: boolean;
  onDownload?: () => void;
  className?: string;
}

export const VoicePlayer: React.FC<VoicePlayerProps> = ({
  audioUrl,
  voiceName,
  isDownloadable = false,
  onDownload,
  className = ''
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const handleEnded = () => setIsPlaying(false);

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [audioUrl]);

  const togglePlay = async () => {
    if (!audioRef.current || !audioUrl) return;

    try {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        await audioRef.current.play();
        setIsPlaying(true);
      }
    } catch (error) {
      console.error('Error playing audio:', error);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!audioRef.current) return;
    const newTime = parseFloat(e.target.value);
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <VoiceCard className={`${className}`}>
      <div className="space-y-4">
        {/* Audio element */}
        {audioUrl && (
          <audio
            ref={audioRef}
            src={audioUrl}
            preload="metadata"
          />
        )}

        {/* Voice name */}
        <div className="text-center">
          <h4 className="text-black font-bold" style={{ fontFamily: 'Orbitron, monospace' }}>
            {voiceName}
          </h4>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center space-x-4">
          <VoiceCard variant="button" onClick={togglePlay} disabled={!audioUrl}>
            <div className="p-2">
              {isPlaying ? (
                <Pause size={20} color="#000000" />
              ) : (
                <Play size={20} color="#000000" />
              )}
            </div>
          </VoiceCard>

          {isDownloadable && onDownload && (
            <VoiceCard variant="button" onClick={onDownload}>
              <div className="p-2">
                <Download size={20} color="#000000" />
              </div>
            </VoiceCard>
          )}
        </div>

        {/* Progress bar */}
        {audioUrl && duration > 0 && (
          <div className="space-y-2">
            <div className="relative">
              <input
                type="range"
                min="0"
                max={duration}
                value={currentTime}
                onChange={handleSeek}
                className="w-full h-2 bg-black/20 rounded-full appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, #000000 0%, #000000 ${(currentTime / duration) * 100}%, #73ff00 ${(currentTime / duration) * 100}%, #73ff00 100%)`
                }}
              />
            </div>
            <div className="flex justify-between text-xs text-black" style={{ fontFamily: 'Orbitron, monospace' }}>
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>
        )}

        {/* Volume control */}
        <div className="flex items-center space-x-2">
          <Volume2 size={16} color="#000000" />
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={volume}
            onChange={handleVolumeChange}
            className="flex-1 h-1 bg-black/20 rounded-full appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, #000000 0%, #000000 ${volume * 100}%, #73ff00 ${volume * 100}%, #73ff00 100%)`
            }}
          />
        </div>
      </div>
    </VoiceCard>
  );
};
