import React, { useEffect, useRef, useState } from 'react';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  X,
  Sparkles,
  Radio,
  AlertCircle,
  Play,
  RotateCcw,
  Send
} from 'lucide-react';
import { api } from '../services/api';

interface VoiceConversationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const VoiceConversationModal: React.FC<VoiceConversationModalProps> = ({ isOpen, onClose }) => {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [isModelSpeaking, setIsModelSpeaking] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [transcripts, setTranscripts] = useState<Array<{ sender: 'user' | 'model'; text: string }>>([
    {
      sender: 'model',
      text: 'Hello! I am Kaushalam Voice Assistant powered by Gemini 3.8 Live. Ask me any question, practice an interview question, or explain a concept out loud.'
    }
  ]);
  const [fallbackPrompt, setFallbackPrompt] = useState<string>('');
  const [isSimulatingVoice, setIsSimulatingVoice] = useState<boolean>(false);

  const wsRef = useRef<WebSocket | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const nextPlayTimeRef = useRef<number>(0);
  const audioQueueRef = useRef<AudioBufferSourceNode[]>([]);

  useEffect(() => {
    if (!isOpen) {
      stopVoiceSession();
    }
  }, [isOpen]);

  const pcmToBase64 = (float32Array: Float32Array): string => {
    const l = float32Array.length;
    const buffer = new ArrayBuffer(l * 2);
    const view = new DataView(buffer);
    for (let i = 0; i < l; i++) {
      const s = Math.max(-1, Math.min(1, float32Array[i]));
      view.setInt16(i * 2, s < 0 ? s * 0x8000 : s * 0x7fff, true);
    }
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  };

  const startVoiceSession = async () => {
    setErrorMessage(null);

    try {
      // 1. Establish WebSocket connection to backend /ws/live
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/ws/live`;
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      // 2. Setup AudioContexts (16kHz input, 24kHz output for Gemini Live API)
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioCtx({ sampleRate: 16000 });
      audioContextRef.current = audioCtx;

      ws.onopen = async () => {
        setIsConnected(true);

        try {
          // Request mic access
          const stream = await navigator.mediaDevices.getUserMedia({
            audio: {
              echoCancellation: true,
              noiseSuppression: true,
              channelCount: 1,
              sampleRate: 16000
            }
          });
          mediaStreamRef.current = stream;

          const source = audioCtx.createMediaStreamSource(stream);
          const processor = audioCtx.createScriptProcessor(4096, 1, 1);
          scriptProcessorRef.current = processor;

          processor.onaudioprocess = (e) => {
            const inputData = e.inputBuffer.getChannelData(0);

            // Compute volume energy to show active speaker animation
            let sum = 0;
            for (let i = 0; i < inputData.length; i++) {
              sum += inputData[i] * inputData[i];
            }
            const rms = Math.sqrt(sum / inputData.length);
            setIsSpeaking(rms > 0.03);

            if (ws.readyState === WebSocket.OPEN) {
              const base64Audio = pcmToBase64(inputData);
              ws.send(JSON.stringify({ audio: base64Audio }));
            }
          };

          source.connect(processor);
          processor.connect(audioCtx.destination);
        } catch (micErr: any) {
          console.warn('Microphone permission blocked or unavailable:', micErr);
          setErrorMessage('Microphone access unavailable or denied. You can still use the audio turn fallback below.');
        }
      };

      ws.onmessage = async (event) => {
        try {
          const data = JSON.parse(event.data);

          if (data.interrupted) {
            // User interrupted the model
            stopPlayback();
            setIsModelSpeaking(false);
            return;
          }

          if (data.audio) {
            setIsModelSpeaking(true);
            playAudioChunk(data.audio);
          }

          if (data.error) {
            console.warn('[Live API ws error]', data.error);
          }
        } catch (e) {
          console.error('Error handling message from server:', e);
        }
      };

      ws.onerror = (e) => {
        console.warn('WebSocket encountered error:', e);
      };

      ws.onclose = () => {
        setIsConnected(false);
        setIsModelSpeaking(false);
      };
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to initialize voice session');
    }
  };

  const playAudioChunk = (base64Audio: string) => {
    try {
      const binary = atob(base64Audio);
      const len = binary.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binary.charCodeAt(i);
      }

      const int16Array = new Int16Array(bytes.buffer);
      const float32Array = new Float32Array(int16Array.length);
      for (let i = 0; i < int16Array.length; i++) {
        float32Array[i] = int16Array[i] / 32768.0;
      }

      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = audioContextRef.current || new AudioCtx({ sampleRate: 24000 });
      const buffer = ctx.createBuffer(1, float32Array.length, 24000);
      buffer.getChannelData(0).set(float32Array);

      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(ctx.destination);

      const currentTime = ctx.currentTime;
      const startTime = Math.max(currentTime, nextPlayTimeRef.current);
      source.start(startTime);
      nextPlayTimeRef.current = startTime + buffer.duration;

      audioQueueRef.current.push(source);
      source.onended = () => {
        const idx = audioQueueRef.current.indexOf(source);
        if (idx !== -1) audioQueueRef.current.splice(idx, 1);
        if (audioQueueRef.current.length === 0) {
          setIsModelSpeaking(false);
        }
      };
    } catch (e) {
      console.error('Error playing audio chunk:', e);
    }
  };

  const stopPlayback = () => {
    audioQueueRef.current.forEach((src) => {
      try {
        src.stop();
      } catch {}
    });
    audioQueueRef.current = [];
    nextPlayTimeRef.current = 0;
  };

  const stopVoiceSession = () => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    if (scriptProcessorRef.current) {
      scriptProcessorRef.current.disconnect();
      scriptProcessorRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    stopPlayback();
    setIsConnected(false);
    setIsSpeaking(false);
    setIsModelSpeaking(false);
  };

  // Turn-based fallback using Web Speech API or server audio synthesis
  const handleFallbackVoiceTurn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fallbackPrompt.trim()) return;

    const userText = fallbackPrompt.trim();
    setTranscripts((prev) => [...prev, { sender: 'user', text: userText }]);
    setFallbackPrompt('');
    setIsSimulatingVoice(true);

    try {
      const res = await api.sendVoiceTurn(userText);
      setTranscripts((prev) => [...prev, { sender: 'model', text: res.replyText }]);

      // Speak using client SpeechSynthesis for instant zero-latency feedback
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(res.replyText);
        utterance.rate = 1.05;
        utterance.pitch = 1.0;
        window.speechSynthesis.speak(utterance);
      }
    } catch (err: any) {
      setTranscripts((prev) => [
        ...prev,
        { sender: 'model', text: 'I heard your question. Practice answering with clear structure and confidence.' }
      ]);
    } finally {
      setIsSimulatingVoice(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl relative flex flex-col max-h-[90vh]">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-950 border border-teal-800 text-teal-300 text-xs font-semibold mb-2">
            <Radio className="w-3.5 h-3.5 text-teal-400 animate-pulse" />
            <span>Gemini 3.8 Live API Voice Engine</span>
          </div>
          <h3 className="text-2xl font-bold text-white">Live Voice Practice & Viva Coach</h3>
          <p className="text-xs text-slate-400 mt-1">
            Real-time low-latency voice conversation with Gemini 3.8 Live for viva practice, speech critique, and verbal concept explanations.
          </p>
        </div>

        {errorMessage && (
          <div className="mb-4 p-3 rounded-xl bg-amber-950/60 border border-amber-800 text-amber-200 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>{errorMessage}</div>
          </div>
        )}

        {/* Central Live Visualizer */}
        <div className="relative py-8 my-2 rounded-2xl bg-slate-950 border border-slate-800/80 flex flex-col items-center justify-center overflow-hidden">
          {/* Animated Wave Circles */}
          <div className="relative flex items-center justify-center w-32 h-32 mb-4">
            <div
              className={`absolute inset-0 rounded-full bg-teal-500/20 transition-all duration-300 ${
                isSpeaking ? 'scale-125 opacity-100 animate-ping' : isModelSpeaking ? 'scale-110 opacity-75 animate-pulse' : 'scale-75 opacity-20'
              }`}
            />
            <div
              className={`absolute inset-2 rounded-full bg-teal-500/30 transition-all duration-300 ${
                isSpeaking ? 'scale-110' : isModelSpeaking ? 'scale-105' : 'scale-90'
              }`}
            />
            <div className="relative z-10 w-20 h-20 rounded-full bg-gradient-to-tr from-teal-600 to-emerald-500 flex items-center justify-center text-white shadow-xl shadow-teal-500/30">
              {isModelSpeaking ? (
                <Volume2 className="w-8 h-8 animate-bounce" />
              ) : isSpeaking ? (
                <Mic className="w-8 h-8 animate-pulse text-amber-200" />
              ) : isConnected ? (
                <Mic className="w-8 h-8 text-white" />
              ) : (
                <MicOff className="w-8 h-8 text-slate-300" />
              )}
            </div>
          </div>

          {/* Status Label */}
          <div className="text-center">
            <span
              className={`text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider ${
                isModelSpeaking
                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                  : isSpeaking
                  ? 'bg-amber-950 text-amber-300 border border-amber-800'
                  : isConnected
                  ? 'bg-teal-950 text-teal-300 border border-teal-800'
                  : 'bg-slate-800 text-slate-400'
              }`}
            >
              {isModelSpeaking
                ? 'Gemini 3.8 Live is speaking...'
                : isSpeaking
                ? 'Listening to you speak...'
                : isConnected
                ? 'Microphone Active — Speak Now'
                : 'Session Idle'}
            </span>
          </div>

          {/* Controls */}
          <div className="mt-6 flex items-center gap-3">
            {!isConnected ? (
              <button
                onClick={startVoiceSession}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-semibold text-xs shadow-lg shadow-teal-700/20 transition-all"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>Start Live Voice Session</span>
              </button>
            ) : (
              <button
                onClick={stopVoiceSession}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs shadow-lg shadow-rose-700/20 transition-all"
              >
                <MicOff className="w-4 h-4" />
                <span>End Voice Session</span>
              </button>
            )}
          </div>
        </div>

        {/* Transcripts / Interactive Speech Display */}
        <div className="mt-4 flex-1 min-h-[120px] max-h-[160px] overflow-y-auto p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs space-y-2">
          {transcripts.map((t, idx) => (
            <div
              key={idx}
              className={`p-2.5 rounded-lg text-xs leading-relaxed ${
                t.sender === 'user'
                  ? 'bg-teal-950/50 text-teal-200 border border-teal-900/60 ml-6 text-right'
                  : 'bg-slate-900 text-slate-300 border border-slate-800 mr-6'
              }`}
            >
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
                {t.sender === 'user' ? 'You' : 'Gemini 3.8 Live'}
              </span>
              {t.text}
            </div>
          ))}
        </div>

        {/* Text Voice Prompt Fallback (Works when mic is not allowed) */}
        <form onSubmit={handleFallbackVoiceTurn} className="mt-4 flex gap-2">
          <input
            type="text"
            value={fallbackPrompt}
            onChange={(e) => setFallbackPrompt(e.target.value)}
            placeholder="Type a voice prompt or viva question (e.g. Ask me about QuickSort)..."
            className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-teal-500"
          />
          <button
            type="submit"
            disabled={isSimulatingVoice || !fallbackPrompt.trim()}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-teal-300 border border-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Speak</span>
          </button>
        </form>
      </div>
    </div>
  );
};
