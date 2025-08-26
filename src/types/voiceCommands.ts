/**
 * Type definitions for voice command functionality
 */

export interface VoiceCommand {
  command: string;
  action: () => void;
  description: string;
}

export interface VoiceCommandsHookProps {
  commands: VoiceCommand[];
  onTranscript?: (transcript: string) => void;
  onError?: (error: string) => void;
}

export interface VoiceCommandsHookResult {
  isListening: boolean;
  isSupported: boolean;
  transcript: string;
  startListening: () => void;
  stopListening: () => void;
  toggleListening: () => void;
}