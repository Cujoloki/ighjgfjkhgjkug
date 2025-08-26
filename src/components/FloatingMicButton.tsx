import React, { useState, useEffect } from 'react';
import { Mic, MicOff } from 'lucide-react';
import { useVoiceCommands } from '../hooks/useVoiceCommands';
import type { VoiceCommand } from '../types/voiceCommands';

interface FloatingMicButtonProps {
  commands: VoiceCommand[];
  onCommandExecuted?: (command: string) => void;
}

export function FloatingMicButton({ commands, onCommandExecuted }: FloatingMicButtonProps) {
  const [feedback, setFeedback] = useState<string>('');
  const [feedbackType, setFeedbackType] = useState<'success' | 'error' | 'info'>('info');
  const [showFeedback, setShowFeedback] = useState(false);

  const displayFeedback = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setFeedback(message);
    setFeedbackType(type);
    setShowFeedback(true);
    
    // Hide feedback after 3 seconds
    setTimeout(() => {
      setShowFeedback(false);
    }, 3000);
  };

  const enhancedCommands = commands.map(cmd => ({
    ...cmd,
    action: () => {
      cmd.action();
      displayFeedback(`Executed: ${cmd.description}`, 'success');
      onCommandExecuted?.(cmd.command);
    }
  }));

  const {
    isListening,
    isSupported,
    transcript,
    toggleListening
  } = useVoiceCommands({
    commands: enhancedCommands,
    onTranscript: (text) => {
      // Show what's being heard
      if (text && !commands.some(cmd => text.toLowerCase().includes(cmd.command.toLowerCase()))) {
        displayFeedback(`Listening: "${text}"`, 'info');
      }
    },
    onError: (error) => {
      displayFeedback(`Voice recognition error: ${error}`, 'error');
    }
  });

  // Check if device is mobile
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  if (!isSupported) {
    return null; // Don't show button if voice commands aren't supported
  }

  // Only show on mobile devices
  if (!isMobile) {
    return null;
  }

  return (
    <>
      <button
        onClick={toggleListening}
        className={`floating-mic-button ${isListening ? 'listening' : ''}`}
        aria-label={isListening ? 'Stop listening' : 'Start voice command'}
      >
        {isListening ? (
          <MicOff className="w-6 h-6" />
        ) : (
          <Mic className="w-6 h-6" />
        )}
      </button>
      
      {/* Voice feedback overlay */}
      {showFeedback && (
        <div className={`voice-feedback-overlay ${
          feedbackType === 'success' ? 'border-green-500' : 
          feedbackType === 'error' ? 'border-red-500' : 
          'border-blue-500'
        }`}>
          <div className="text-sm font-medium">{feedback}</div>
        </div>
      )}
      
      {/* Transcript overlay - only show when actively listening */}
      {isListening && transcript && (
        <div className="voice-feedback-overlay border-purple-500">
          <div className="text-xs text-gray-500 mb-1">I heard:</div>
          <div className="text-sm font-medium">"{transcript}"</div>
        </div>
      )}
    </>
  );
}