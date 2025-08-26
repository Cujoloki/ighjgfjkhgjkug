import { useState, useEffect, useCallback, useRef } from 'react';
import type { VoiceCommand, VoiceCommandsHookProps, VoiceCommandsHookResult } from '../types/voiceCommands';

export function useVoiceCommands({ commands, onTranscript, onError }: VoiceCommandsHookProps): VoiceCommandsHookResult {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const commandsRef = useRef(commands); // Use ref to avoid dependency issues

  // Update commands ref when commands change
  useEffect(() => {
    commandsRef.current = commands;
  }, [commands]);

  useEffect(() => {
    // Check if speech recognition is supported
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      setIsSupported(true);
      recognitionRef.current = new SpeechRecognition();
      
      const recognition = recognitionRef.current;
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.onresult = (event) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        const fullTranscript = finalTranscript || interimTranscript;
        setTranscript(fullTranscript);
        onTranscript?.(fullTranscript);

        // Process commands when we have a final result
        if (finalTranscript) {
          processCommand(finalTranscript.toLowerCase().trim());
        }
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        onError?.(event.error);
        setIsListening(false);
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [onTranscript, onError]);

  const processCommand = useCallback((transcript: string) => {
    // Find matching command
    const matchedCommand = commandsRef.current.find(cmd => 
      transcript.includes(cmd.command.toLowerCase())
    );

    if (matchedCommand) {
      matchedCommand.action();
      setTranscript(''); // Clear transcript after successful command
      
      // Auto-stop listening after executing a command on mobile
      // This provides better UX for the floating mic button
      if (window.innerWidth <= 768) {
        setTimeout(() => {
          if (recognitionRef.current && isListening) {
            recognitionRef.current.stop();
          }
        }, 500);
      }
    }
  }, [isListening]);

  const startListening = useCallback(() => {
    if (recognitionRef.current && !isListening) {
      setTranscript('');
      try {
        recognitionRef.current.start();
      } catch (error) {
        console.error('Error starting speech recognition:', error);
        // If already started, stop and restart
        if (error instanceof DOMException && error.name === 'InvalidStateError') {
          recognitionRef.current.stop();
          setTimeout(() => {
            recognitionRef.current?.start();
          }, 100);
        }
      }
    }
  }, [isListening]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  }, [isListening]);

  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  return {
    isListening,
    isSupported,
    transcript,
    startListening,
    stopListening,
    toggleListening
  };
}