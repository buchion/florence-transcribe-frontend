import { useState, useEffect, useRef } from 'react';
import { AudioRecorder } from '../services/audio';
import { WebSocketClient } from '../services/websocket';

interface RealtimeSessionProps {
  sessionId?: number;
  patientId?: string;
  patientName?: string;
  onTranscriptUpdate: (text: string, isInterim: boolean) => void;
  onSessionStart: (sessionId: number) => void;
}

export default function RealtimeSession({
  sessionId: _sessionId,
  patientId: _patientId,
  patientName: _patientName,
  onTranscriptUpdate,
  onSessionStart,
}: RealtimeSessionProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState('');
  const audioRecorderRef = useRef<AudioRecorder | null>(null);
  const wsClientRef = useRef<WebSocketClient | null>(null);

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
  const WS_URL = API_BASE_URL.replace('http', 'ws') + '/api/realtime/ws';

  const startRecording = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        setError('Not authenticated');
        return;
      }

      // Create WebSocket connection
      wsClientRef.current = new WebSocketClient(WS_URL, token);

      wsClientRef.current.connect(
        (data) => {
          if (data.type === 'session_started') {
            onSessionStart(data.session_id);
          } else if (data.type === 'interim_transcript') {
            onTranscriptUpdate(data.text, true);
          } else if (data.type === 'final_transcript') {
            onTranscriptUpdate(data.text, false);
          }
        },
        (error) => {
          console.error('WebSocket error:', error);
          setError('Connection error');
        },
        () => {
          setIsRecording(false);
        }
      );

      // Start audio recording
      audioRecorderRef.current = new AudioRecorder();
      await audioRecorderRef.current.startRecording((audioData) => {
        if (wsClientRef.current) {
          wsClientRef.current.send(audioData);
        }
      });

      setIsRecording(true);
      setError('');
    } catch (err: any) {
      setError(err.message || 'Failed to start recording');
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (audioRecorderRef.current) {
      audioRecorderRef.current.stopRecording();
      audioRecorderRef.current = null;
    }
    if (wsClientRef.current) {
      wsClientRef.current.close();
      wsClientRef.current = null;
    }
    setIsRecording(false);
  };

  useEffect(() => {
    return () => {
      stopRecording();
    };
  }, []);

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Recording Session</h3>
        {error && <div className="text-red-600 text-sm">{error}</div>}
      </div>
      <div className="flex items-center space-x-4">
        {!isRecording ? (
          <button
            onClick={startRecording}
            className="bg-red-600 text-white px-6 py-2 rounded-md hover:bg-red-700 flex items-center"
          >
            <span className="w-3 h-3 bg-white rounded-full mr-2"></span>
            Start Recording
          </button>
        ) : (
          <button
            onClick={stopRecording}
            className="bg-gray-600 text-white px-6 py-2 rounded-md hover:bg-gray-700 flex items-center"
          >
            <span className="w-3 h-3 bg-white rounded-full mr-2 animate-pulse"></span>
            Stop Recording
          </button>
        )}
      </div>
    </div>
  );
}

