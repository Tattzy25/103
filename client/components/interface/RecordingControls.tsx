import React from "react";
import { Mic, MicOff, Send, RotateCcw } from "lucide-react";

interface RecordingControlsProps {
  mode: "solo" | "host" | "join" | "coach";
  isRecording: boolean;
  hasRecording: boolean;
  isProcessing: boolean;
  audioVolume?: number;
  transcription?: string;
  translation?: string;
  onStartRecording: () => void;
  onStopRecording: () => void;
  onSendRecording: () => void;
  onReRecord: () => void;
}

export const RecordingControls: React.FC<RecordingControlsProps> = ({
  mode,
  isRecording,
  hasRecording,
  isProcessing,
  audioVolume = 0,
  transcription,
  translation,
  onStartRecording,
  onStopRecording,
  onSendRecording,
  onReRecord,
}) => {
  // For solo and coach modes - completely touchless after first tap
  if (mode === "solo" || mode === "coach") {
    return (
      <div className="flex flex-col items-center space-y-4">
        <button
          onClick={isRecording ? onStopRecording : onStartRecording}
          disabled={isProcessing}
          className={`
            relative w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300
            ${isRecording 
              ? "bg-red-500 hover:bg-red-600" 
              : "bg-primary hover:bg-primary/80"
            }
            ${isProcessing ? "opacity-50 cursor-not-allowed" : ""}
            shadow-luxury hover:shadow-luxury-lg
          `}
          style={{
            boxShadow: isRecording 
              ? `0 0 ${20 + (audioVolume * 30)}px rgba(239, 68, 68, 0.6), 0 0 ${40 + (audioVolume * 60)}px rgba(239, 68, 68, 0.3)`
              : undefined
          }}
        >
          {/* Pulsating ring for recording state */}
          {isRecording && (
            <div 
              className="absolute inset-0 rounded-full border-2 border-red-400 animate-ping"
              style={{
                transform: `scale(${1 + (audioVolume * 0.3)})`,
                opacity: 0.7 - (audioVolume * 0.3)
              }}
            />
          )}
          
          {/* Processing glow */}
          {isProcessing && (
            <div className="absolute inset-0 rounded-full bg-white/20 animate-pulse" />
          )}
          {isRecording ? (
            <MicOff size={32} className="text-white" />
          ) : (
            <Mic size={32} className="text-white" />
          )}
        </button>
        
        {isProcessing && (
          <div className="text-center">
            <div className="text-sm text-gray-400">Processing...</div>
            {transcription && (
              <div className="text-xs text-gray-500 mt-1 max-w-xs">
                "{transcription}"
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // For host and join modes - show Send/Re-record options
  return (
    <div className="flex flex-col items-center space-y-4">
      {/* Main recording button */}
      {!hasRecording && (
        <button
          onClick={isRecording ? onStopRecording : onStartRecording}
          disabled={isProcessing}
          className={`
            w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300
            ${isRecording 
              ? "bg-red-500 hover:bg-red-600 animate-pulse" 
              : "bg-primary hover:bg-primary/80"
            }
            ${isProcessing ? "opacity-50 cursor-not-allowed" : ""}
            shadow-luxury hover:shadow-luxury-lg
          `}
        >
          {isRecording ? (
            <MicOff size={32} className="text-white" />
          ) : (
            <Mic size={32} className="text-white" />
          )}
        </button>
      )}

      {/* Processing state */}
      {isProcessing && (
        <div className="text-center">
          <div className="text-sm text-gray-400">Processing...</div>
          {transcription && (
            <div className="text-xs text-gray-500 mt-1 max-w-xs">
              "{transcription}"
            </div>
          )}
        </div>
      )}

      {/* Send/Re-record controls */}
      {hasRecording && !isProcessing && (
        <div className="flex flex-col items-center space-y-4">
          {/* Preview */}
          <div className="text-center max-w-sm">
            {transcription && (
              <div className="text-sm text-white mb-2">
                <span className="text-gray-400">Original:</span> "{transcription}"
              </div>
            )}
            {translation && (
              <div className="text-sm text-primary">
                <span className="text-gray-400">Translation:</span> "{translation}"
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex space-x-4">
            <button
              onClick={onReRecord}
              className="flex items-center space-x-2 px-6 py-3 bg-gray-600 hover:bg-gray-700 rounded-xl text-white transition-all duration-300 shadow-luxury"
            >
              <RotateCcw size={20} />
              <span>Re-record</span>
            </button>
            
            <button
              onClick={onSendRecording}
              className="flex items-center space-x-2 px-6 py-3 bg-green-600 hover:bg-green-700 rounded-xl text-white transition-all duration-300 shadow-luxury"
            >
              <Send size={20} />
              <span>Send</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
