import React, { useState, useEffect, useCallback, useRef } from "react";
import Ably from "ably";
import { BridgitInterface } from "@/components/interface/BridgitInterface";
import { MenuSystem } from "@/components/menu/MenuSystem";
import { soloModeHandler } from "@/services/soloModeHandler";

type AppMode = "solo" | "host" | "join" | "coach";

const Index: React.FC = () => {
  const [ablyChannel, setAblyChannel] = useState<Ably.RealtimeChannel | null>(null);
  const [ablyClient, setAblyClient] = useState<Ably.Realtime | null>(null);
  const [currentMode, setCurrentMode] = useState<AppMode>("solo");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [audioVolume, setAudioVolume] = useState(0);
  const [hasRecording, setHasRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcription, setTranscription] = useState<string>("");
  const [translation, setTranslation] = useState<string>("");
  const [fromLanguage, setFromLanguage] = useState("EN");
  const [toLanguage, setToLanguage] = useState("ES");
  const [currentSessionId, setCurrentSessionId] = useState<string>("");
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);
  const animationFrameIdRef = useRef<number | null>(null);

  const processAudio = useCallback(() => {
    if (analyserRef.current && dataArrayRef.current) {
      analyserRef.current.getByteFrequencyData(dataArrayRef.current);
      const sum = dataArrayRef.current.reduce((a, b) => a + b, 0);
      const average = sum / dataArrayRef.current.length;
      setAudioVolume(average / 255); // Normalize to 0-1
    }
    animationFrameIdRef.current = requestAnimationFrame(processAudio);
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;
      dataArrayRef.current = new Uint8Array(analyserRef.current.frequencyBinCount);

      source.connect(analyserRef.current);

      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/wav" });
        const formData = new FormData();
        formData.append("audio", audioBlob, "audio.wav");
        
        // Generate session and user IDs for tracking
        const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const userId = `user_${Math.random().toString(36).substr(2, 9)}`;
        
        // Add session data to form
        formData.append("sessionId", sessionId);
        formData.append("userId", userId);
        formData.append("sourceLang", fromLanguage);
        formData.append("targetLang", toLanguage);
        formData.append("mode", currentMode);
        
        setCurrentSessionId(sessionId);
        setIsProcessing(true);

        try {
          const response = await fetch("/api/stt", {
            method: "POST",
            body: formData,
          });
          
          if (!response.ok) {
            const errorText = await response.text();
            console.error("STT API Error:", response.status, errorText);
            throw new Error(`STT API failed: ${response.status} - ${errorText}`);
          }
          
          const data = await response.json();
          
          if (data.success) {
            console.log("STT Transcription:", data.transcription);
            console.log("Session ID:", data.sessionId);
            console.log("Processing started - message queue workflow initiated");
            
            setTranscription(data.transcription);
            
            // For solo and coach modes - completely touchless
            if (currentMode === "solo" || currentMode === "coach") {
              console.log(`${currentMode} mode - starting polling for result`);
              
              try {
                const result = await soloModeHandler.pollForResult(data.sessionId);
                console.log(`${currentMode} mode result received:`, result);
                
                setTranslation(result.translatedText || "");
                
                if (result.audioUrl && result.processingComplete) {
                  // Play the translated audio automatically
                  const audio = new Audio(result.audioUrl);
                  audio.play().catch(error => {
                    console.error(`Error playing ${currentMode} mode audio:`, error);
                  });
                  console.log(`Playing translated audio: "${result.translatedText}"`);
                }
              } catch (pollError) {
                console.error(`${currentMode} mode polling error:`, pollError);
              } finally {
                setIsProcessing(false);
              }
            } else {
              // For host/join modes - show Send/Re-record options
              console.log(`${currentMode} mode - waiting for user to send or re-record`);
              
              // Start processing but don't send to Ably yet
              try {
                // We'll poll for the translation result but not the final audio
                const result = await soloModeHandler.pollForResult(data.sessionId);
                console.log(`${currentMode} mode translation ready:`, result);
                
                setTranslation(result.translatedText || "");
                setHasRecording(true);
                setIsProcessing(false);
                
                // Don't play audio yet - wait for user to send
              } catch (pollError) {
                console.error(`${currentMode} mode processing error:`, pollError);
                setIsProcessing(false);
              }
            }
          } else {
            console.error("STT Error:", data.error);
            setIsProcessing(false);
          }
        } catch (error) {
          console.error("Error sending audio to STT:", error);
          setIsProcessing(false);
        } finally {
          // Stop all tracks in the stream to release microphone
          stream.getTracks().forEach(track => track.stop());
          if (audioContextRef.current) {
            audioContextRef.current.close();
          }
          if (animationFrameIdRef.current) {
            cancelAnimationFrame(animationFrameIdRef.current);
          }
        }
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      animationFrameIdRef.current = requestAnimationFrame(processAudio);
      console.log("Recording started.");
    } catch (error) {
      console.error("Error accessing microphone:", error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      console.log("Recording stopped.");
    }
  };

  const handleChannelJoined = useCallback((channelCode: string, token: string) => {
    const client = new Ably.Realtime({ token });
    client.connection.once('connected', () => {
      console.log('Ably connected!');
      const channel = client.channels.get(`${channelCode}_audio`);
      setAblyChannel(channel);
      setAblyClient(client);

      channel.subscribe('translation_complete', (message) => {
        console.log('Received translation complete:', message.data);
        const { data } = message.data;
        
        if (data.audioUrl && data.processingComplete) {
          // Play the translated audio
          const audio = new Audio(data.audioUrl);
          audio.play().catch(error => {
            console.error('Error playing audio:', error);
          });
          console.log(`Playing translated audio: "${data.translatedText}"`);
        }
      });
    });

    client.connection.on('failed', (error) => {
      console.error('Ably connection failed:', error);
    });
  }, []);

  useEffect(() => {
    return () => {
      if (ablyClient) {
        ablyClient.close();
      }
      // Clean up solo mode polling
      soloModeHandler.clearAllPolling();
    };
  }, [ablyClient]);

  const handleModeChange = (mode: AppMode) => {
    setCurrentMode(mode);
  };

  const handleLanguageChange = (fromLang: string, toLang: string) => {
    setFromLanguage(fromLang);
    setToLanguage(toLang);
    console.log(`Language changed: ${fromLang} → ${toLang}`);
  };

  const handleMenuClick = () => {
    setIsMenuOpen(true);
  };

  const handleMenuClose = () => {
    setIsMenuOpen(false);
  };

  const handleReRecord = () => {
    setHasRecording(false);
    setTranscription("");
    setTranslation("");
    setCurrentSessionId("");
    // Clear any polling
    soloModeHandler.clearAllPolling();
  };

  const handleSendRecording = async () => {
    if (!currentSessionId) return;
    
    setIsProcessing(true);
    
    try {
      // For host/join modes, send to Ably channel
      if (currentMode === "host" || currentMode === "join") {
        // Continue with the message queue workflow to Ably
        console.log(`Sending recording to ${currentMode} mode channel`);
        // The workflow will continue automatically through the message queue
      }
      
      // Reset state
      setHasRecording(false);
      setTranscription("");
      setTranslation("");
      setCurrentSessionId("");
      
    } catch (error) {
      console.error("Error sending recording:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleHostGenerateCode = async (): Promise<string> => {
    console.log("Generating access code...");
    const response = await fetch('/api/generate-access-code');
    const data = await response.json();
    console.log("API response for generate-access-code:", data);
    const code = data.code;
    console.log("Generated code:", code);
    return code;
  };

  const handleJoinChannel = async (code: string): Promise<void> => {
    console.log("Joining channel with code:", code);
    const response = await fetch('/api/join-channel', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ code }),
    });
    const data = await response.json();
    handleChannelJoined(code, data.token);
  };

  return (
    <div className="relative">
      {/* Main Bridgit Interface */}
      <BridgitInterface
        mode={currentMode}
        onMenuClick={handleMenuClick}
        onStartRecording={startRecording}
        onStopRecording={stopRecording}
        isRecording={isRecording}
        audioVolume={audioVolume}
        hasRecording={hasRecording}
        isProcessing={isProcessing}
        transcription={transcription}
        translation={translation}
        onSendRecording={handleSendRecording}
        onReRecord={handleReRecord}
      />

      {/* Menu System Overlay */}
      <MenuSystem
        isOpen={isMenuOpen}
        onClose={handleMenuClose}
        currentMode={currentMode}
        onModeChange={handleModeChange}
        onHostGenerateCode={handleHostGenerateCode}
        onJoinChannel={handleJoinChannel}
        onLanguageChange={handleLanguageChange}
      />
    </div>
  );
};

export default Index;
