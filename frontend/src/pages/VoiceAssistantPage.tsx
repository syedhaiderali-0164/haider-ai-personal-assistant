import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  RotateCcw,
  Bot,
  User,
  Sparkles,
  Settings,
  AlertCircle
} from 'lucide-react';
import { chatService } from '../services/chatService';
import { settingsService } from '../services/settingsService';
import { useToast } from '../context/ToastContext';

interface VoiceMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

export const VoiceAssistantPage: React.FC = () => {
  const { showToast } = useToast();

  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [history, setHistory] = useState<VoiceMessage[]>([]);
  const [speechSpeed, setSpeechSpeed] = useState(1.0);
  const [muted, setMuted] = useState(false);
  const [supported, setSupported] = useState(true);
  const [statusText, setStatusText] = useState('Ready. Click microphone to speak.');

  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  useEffect(() => {
    // Check Web Speech API support
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSupported(false);
      setStatusText('Browser Web Speech API not supported in this browser. Please use Chrome, Edge, or Safari.');
      return;
    }

    if ('speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
      setStatusText('Listening to your voice...');
    };

    recognition.onresult = (event: any) => {
      let current = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        current += event.results[i][0].transcript;
      }
      setTranscript(current);
    };

    recognition.onerror = (event: any) => {
      setIsListening(false);
      if (event.error === 'not-allowed') {
        setStatusText('Microphone permission denied. Please allow microphone access.');
        showToast('Microphone permission denied.', 'error');
      } else {
        setStatusText(`Voice recognition error: ${event.error}`);
      }
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      if (synthRef.current) {
        synthRef.current.cancel();
      }
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const handleToggleListen = () => {
    if (!supported || !recognitionRef.current) return;

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
      setStatusText('Stopped listening.');
    } else {
      // Cancel any ongoing speech
      if (synthRef.current) synthRef.current.cancel();
      setIsSpeaking(false);
      setTranscript('');
      try {
        recognitionRef.current.start();
      } catch (err) {
        // quiet retry
      }
    }
  };

  const handleProcessVoiceInput = async () => {
    const userPrompt = transcript.trim();
    if (!userPrompt) return;

    // Add user voice prompt to history
    const userMsg: VoiceMessage = {
      id: 'v-user-' + Date.now(),
      role: 'user',
      text: userPrompt,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setHistory((prev) => [...prev, userMsg]);
    setTranscript('');
    setStatusText('Thinking & generating response...');

    try {
      let responseText = '';
      await chatService.streamChat({
        message: userPrompt,
        onToken: (token) => {
          responseText += token;
        },
        onComplete: () => {
          const cleanText = responseText.replace(/[*#_`]/g, '').trim();
          const asstMsg: VoiceMessage = {
            id: 'v-asst-' + Date.now(),
            role: 'assistant',
            text: cleanText,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          };
          setHistory((prev) => [...prev, asstMsg]);
          speakResponse(cleanText);
        },
        onError: (err) => {
          setStatusText(`Error: ${err.message}`);
          showToast(err.message, 'error');
        },
      });
    } catch (err: any) {
      setStatusText('Failed to process voice query.');
    }
  };

  const speakResponse = (text: string) => {
    if (muted || !synthRef.current) {
      setStatusText('Ready for next voice input.');
      return;
    }

    synthRef.current.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = speechSpeed;

    utterance.onstart = () => {
      setIsSpeaking(true);
      setStatusText('HAIDER AI is speaking...');
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      setStatusText('Ready for next voice input.');
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
      setStatusText('Ready for next voice input.');
    };

    synthRef.current.speak(utterance);
  };

  const handleStopSpeaking = () => {
    if (synthRef.current) {
      synthRef.current.cancel();
      setIsSpeaking(false);
      setStatusText('Speech paused.');
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-xs font-semibold text-cyan-400">
          <Sparkles className="w-3.5 h-3.5" />
          <span>REAL-TIME VOICE ASSISTANT</span>
        </div>
        <h2 className="text-3xl font-extrabold text-white">Voice Interaction Mode</h2>
        <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
          Talk naturally with HAIDER AI. Low-latency speech recognition, intelligent conversational responses, and vocal synthesis.
        </p>
      </div>

      {!supported && (
        <div className="p-4 rounded-2xl bg-amber-950/80 border border-amber-800 text-amber-200 text-xs flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 text-amber-400" />
          <span>
            Web Speech Recognition is not supported in this browser. Please use Google Chrome, Microsoft Edge, or Safari for voice features.
          </span>
        </div>
      )}

      {/* Main Interactive Orb & Voice Console */}
      <div className="p-8 sm:p-12 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl flex flex-col items-center justify-center text-center space-y-8 relative overflow-hidden">
        {/* Pulsing Glowing Voice Orb */}
        <div className="relative flex items-center justify-center">
          {/* Animated Glow Rings */}
          <div
            className={`absolute w-48 h-48 rounded-full transition-all duration-700 ${
              isListening
                ? 'bg-rose-500/20 scale-125 animate-ping'
                : isSpeaking
                ? 'bg-cyan-500/25 scale-125 animate-pulse'
                : 'bg-indigo-500/10 scale-100'
            }`}
          />
          <div
            className={`absolute w-36 h-36 rounded-full transition-all duration-500 ${
              isListening
                ? 'bg-rose-500/30'
                : isSpeaking
                ? 'bg-cyan-500/35'
                : 'bg-indigo-500/20'
            }`}
          />

          {/* Center Orb Button */}
          <button
            onClick={handleToggleListen}
            disabled={!supported}
            className={`relative z-10 w-24 h-24 rounded-full flex items-center justify-center text-white shadow-2xl transition-all duration-300 hover:scale-105 cursor-pointer ${
              isListening
                ? 'bg-rose-600 shadow-rose-600/50'
                : isSpeaking
                ? 'bg-cyan-500 shadow-cyan-500/50'
                : 'bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 shadow-cyan-500/30'
            }`}
            title={isListening ? 'Click to stop listening' : 'Click to speak'}
          >
            {isListening ? (
              <MicOff className="w-10 h-10 animate-bounce" />
            ) : (
              <Mic className="w-10 h-10" />
            )}
          </button>
        </div>

        {/* Live Status Text */}
        <div className="space-y-2">
          <p className="text-sm font-semibold text-slate-200">{statusText}</p>
          {transcript && (
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 max-w-lg mx-auto">
              <p className="text-xs text-slate-400 uppercase tracking-wider font-bold mb-1">
                You said:
              </p>
              <p className="text-sm text-cyan-300 font-medium">"{transcript}"</p>
              <div className="mt-3 flex items-center justify-center gap-2">
                <button
                  onClick={handleProcessVoiceInput}
                  className="px-4 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-white font-bold text-xs shadow-md shadow-cyan-500/25"
                >
                  Send Query to AI
                </button>
                <button
                  onClick={() => setTranscript('')}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs"
                >
                  Clear
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Audio Controls Bar */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-4 border-t border-slate-800/80 w-full max-w-md text-xs text-slate-400">
          {/* Mute button */}
          <button
            onClick={() => setMuted(!muted)}
            className={`p-2.5 rounded-xl border flex items-center gap-1.5 transition-colors ${
              muted
                ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white'
            }`}
          >
            {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            <span>{muted ? 'Unmute Audio' : 'Mute Audio'}</span>
          </button>

          {/* Stop Speaking button */}
          {isSpeaking && (
            <button
              onClick={handleStopSpeaking}
              className="px-3 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white border border-slate-700 transition-colors"
            >
              Stop Speaking
            </button>
          )}

          {/* Speed slider */}
          <div className="flex items-center gap-2 bg-slate-800/60 px-3 py-1.5 rounded-xl border border-slate-700">
            <span>Speed: {speechSpeed}x</span>
            <input
              type="range"
              min="0.75"
              max="1.5"
              step="0.25"
              value={speechSpeed}
              onChange={(e) => setSpeechSpeed(parseFloat(e.target.value))}
              className="w-20 accent-cyan-500"
            />
          </div>
        </div>
      </div>

      {/* Voice Transcript History */}
      {history.length > 0 && (
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Bot className="w-4 h-4 text-cyan-400" />
              <span>Voice Conversation Transcript</span>
            </h3>
            <button
              onClick={() => setHistory([])}
              className="text-xs text-slate-400 hover:text-rose-400 flex items-center gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Clear Log</span>
            </button>
          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
            {history.map((msg) => (
              <div
                key={msg.id}
                className={`p-4 rounded-2xl text-xs space-y-1 ${
                  msg.role === 'user'
                    ? 'bg-slate-950/80 border border-slate-800 text-slate-200'
                    : 'bg-cyan-950/30 border border-cyan-900/40 text-cyan-100'
                }`}
              >
                <div className="flex items-center justify-between font-bold text-slate-400 text-[10px]">
                  <span className="uppercase text-cyan-400">{msg.role === 'user' ? 'You' : 'HAIDER AI'}</span>
                  <span>{msg.timestamp}</span>
                </div>
                <p className="leading-relaxed">{msg.text}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
