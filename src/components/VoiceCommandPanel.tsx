import React, { useState } from 'react';
import { Mic, MicOff, Volume2, VolumeX, HelpCircle, X } from 'lucide-react';
import { useVoiceCommands } from '../hooks/useVoiceCommands';

interface VoiceCommand {
  command: string;
  action: () => void;
  description: string;
}

interface VoiceCommandPanelProps {
  commands: VoiceCommand[];
  onCommandExecuted?: (command: string) => void;
}

export function VoiceCommandPanel({ commands, onCommandExecuted }: VoiceCommandPanelProps) {
  const [showHelp, setShowHelp] = useState(false);
  const [feedback, setFeedback] = useState<string>('');
  const [feedbackType, setFeedbackType] = useState<'success' | 'error' | 'info'>('info');

  const showFeedback = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setFeedback(message);
    setFeedbackType(type);
    setTimeout(() => setFeedback(''), 3000);
  };

  const enhancedCommands = commands.map(cmd => ({
    ...cmd,
    action: () => {
      cmd.action();
      showFeedback(`Executed: ${cmd.description}`, 'success');
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
        showFeedback(`Listening: "${text}"`, 'info');
      }
    },
    onError: (error) => {
      showFeedback(`Voice recognition error: ${error}`, 'error');
    }
  });

  if (!isSupported) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-center gap-2 text-yellow-800">
          <VolumeX className="w-5 h-5" />
          <span className="text-sm">Voice commands are not supported in this browser</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <Volume2 className="w-5 h-5 text-gray-600" />
          <h3 className="font-medium text-gray-900">Voice Commands</h3>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowHelp(!showHelp)}
            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
            title="Show available commands"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Controls */}
      <div className="p-4">
        <div className="flex items-center gap-4">
          <button
            onClick={toggleListening}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
              isListening
                ? 'bg-red-100 text-red-700 hover:bg-red-200'
                : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
            }`}
          >
            {isListening ? (
              <>
                <MicOff className="w-4 h-4" />
                Stop Listening
              </>
            ) : (
              <>
                <Mic className="w-4 h-4" />
                Start Listening
              </>
            )}
          </button>

          {isListening && (
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              <span className="text-sm text-gray-600">Listening...</span>
            </div>
          )}
        </div>

        {/* Live Transcript */}
        {transcript && (
          <div className="mt-3 p-3 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-600 mb-1">You said:</div>
            <div className="text-gray-900 font-medium">"{transcript}"</div>
          </div>
        )}

        {/* Feedback */}
        {feedback && (
          <div className={`mt-3 p-3 rounded-lg ${
            feedbackType === 'success' ? 'bg-green-50 text-green-800' :
            feedbackType === 'error' ? 'bg-red-50 text-red-800' :
            'bg-blue-50 text-blue-800'
          }`}>
            <div className="text-sm">{feedback}</div>
          </div>
        )}
      </div>

      {/* Help Panel */}
      {showHelp && (
        <div className="border-t border-gray-200 bg-gray-50">
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-gray-900">Available Commands</h4>
              <button
                onClick={() => setShowHelp(false)}
                className="p-1 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-2">
              {commands.map((cmd, index) => (
                <div key={index} className="flex items-start gap-3 text-sm">
                  <code className="px-2 py-1 bg-white rounded text-blue-600 font-mono text-xs">
                    "{cmd.command}"
                  </code>
                  <span className="text-gray-600">{cmd.description}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <div className="text-xs text-blue-800">
                <strong>Tips:</strong>
                <ul className="mt-1 space-y-1 list-disc list-inside">
                  <li>Speak clearly and at normal pace</li>
                  <li>Wait for the microphone to activate before speaking</li>
                  <li>Commands are case-insensitive</li>
                  <li>You can say commands naturally in sentences</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}