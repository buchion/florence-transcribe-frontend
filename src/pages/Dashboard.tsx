import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { AudioRecorder } from '../services/audio';
import { WebSocketClient } from '../services/websocket';

interface User {
  email: string;
}

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const audioRecorderRef = useRef<AudioRecorder | null>(null);
  const wsClientRef = useRef<WebSocketClient | null>(null);

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
  const WS_URL = API_BASE_URL.replace('http', 'ws') + '/api/realtime/ws';

  useEffect(() => {
    const fetchUser = async () => {
      // Check if in demo mode
      const isDemoMode = localStorage.getItem('demo_mode') === 'true';
      if (isDemoMode) {
        setUser({ email: 'demo@florence.ai' });
        return;
      }

      try {
        const response = await api.get('/api/auth/me');
        setUser(response.data);
      } catch {
        navigate('/auth');
      }
    };
    fetchUser();
  }, [navigate]);

  const handleLogout = () => {
    stopRecording();
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('demo_mode');
    navigate('/auth');
  };

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
            // Session started successfully
            console.log('Session started:', data.session_id);
          } else if (data.type === 'interim_transcript') {
            setInterimTranscript(data.text);
          } else if (data.type === 'final_transcript') {
            setTranscript((prev) => prev + ' ' + data.text);
            setInterimTranscript('');
          } else if (data.type === 'error') {
            setError(data.message || 'An error occurred');
            setIsRecording(false);
            stopRecording();
          }
        },
        (error) => {
          console.error('WebSocket error:', error);
          setError('Connection error. Please check your backend server and AssemblyAI API key.');
          setIsRecording(false);
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
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to start recording';
      setError(errorMessage);
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
    <div className="min-h-screen" style={{ backgroundColor: '#F0FDFF' }}>
      <nav className="bg-white shadow" style={{ borderBottom: '2px solid #42D7D7' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-xl font-bold" style={{ color: '#42D7D7' }}>
                  Florence Transcribe
                </h1>
              </div>
            </div>
            <div className="flex items-center">
              <span className="mr-4" style={{ color: '#42D7D7' }}>{user?.email}</span>
              <button
                onClick={handleLogout}
                className="px-4 py-2 rounded-md text-white font-medium transition-colors"
                style={{ backgroundColor: '#42D7D7' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#3BC5C5'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#42D7D7'}
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-8">
            <h2 className="text-3xl font-bold mb-2" style={{ color: '#42D7D7' }}>
              Welcome to Florence Transcribe
            </h2>
            <p className="text-gray-600">
              Start recording to begin transcribing with Assembly AI.
            </p>
          </div>

          {/* Recording Controls */}
          <div className="bg-white p-6 rounded-lg shadow-lg mb-6" style={{ border: '2px solid #42D7D7' }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold" style={{ color: '#42D7D7' }}>
                Recording Session
              </h3>
              {error && (
                <div className="text-red-600 text-sm bg-red-50 px-3 py-1 rounded">
                  {error}
                </div>
              )}
              {isRecording && (
                <div className="flex items-center">
                  <span className="w-3 h-3 rounded-full mr-2 animate-pulse" style={{ backgroundColor: '#42D7D7' }}></span>
                  <span className="text-sm" style={{ color: '#42D7D7' }}>Recording...</span>
                </div>
              )}
            </div>
            <div className="flex items-center space-x-4">
              {!isRecording ? (
                <button
                  onClick={startRecording}
                  className="px-8 py-3 rounded-lg text-white font-medium flex items-center transition-all transform hover:scale-105 shadow-lg"
                  style={{ backgroundColor: '#42D7D7' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#3BC5C5'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#42D7D7'}
                >
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                  </svg>
                  Start Recording
                </button>
              ) : (
                <button
                  onClick={stopRecording}
                  className="px-8 py-3 rounded-lg text-white font-medium flex items-center transition-all transform hover:scale-105 shadow-lg"
                  style={{ backgroundColor: '#FF6B6B' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#FF5252'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#FF6B6B'}
                >
                  <span className="w-3 h-3 bg-white rounded-full mr-2 animate-pulse"></span>
                  Stop Recording
                </button>
              )}
              <button
                onClick={() => navigate('/session')}
                className="px-6 py-3 rounded-lg font-medium transition-colors border-2"
                style={{ 
                  borderColor: '#42D7D7',
                  color: '#42D7D7',
                  backgroundColor: 'transparent'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#42D7D7';
                  e.currentTarget.style.color = 'white';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = '#42D7D7';
                }}
              >
                Advanced Session
              </button>
            </div>
          </div>

          {/* Transcription Section */}
          <div className="bg-white p-6 rounded-lg shadow-lg" style={{ border: '2px solid #42D7D7' }}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold" style={{ color: '#42D7D7' }}>
                Transcribe
              </h3>
              {transcript && (
                <button
                  onClick={() => {
                    setTranscript('');
                    setInterimTranscript('');
                  }}
                  className="px-4 py-2 rounded-md text-sm font-medium transition-colors"
                  style={{ 
                    borderColor: '#42D7D7',
                    color: '#42D7D7',
                    border: '1px solid',
                    backgroundColor: 'transparent'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#42D7D7';
                    e.currentTarget.style.color = 'white';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = '#42D7D7';
                  }}
                >
                  Clear
                </button>
              )}
            </div>
            <div 
              className="rounded-md p-6 min-h-[400px] overflow-y-auto"
              style={{ 
                border: '2px solid #E0F7FA',
                backgroundColor: '#FAFEFF'
              }}
            >
              {transcript || interimTranscript ? (
                <div className="whitespace-pre-wrap text-gray-800 leading-relaxed">
                  <span>{transcript}</span>
                  {interimTranscript && (
                    <span className="italic opacity-70" style={{ color: '#42D7D7' }}>
                      {interimTranscript}
                    </span>
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <svg 
                      className="w-16 h-16 mx-auto mb-4 opacity-30" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                      style={{ color: '#42D7D7' }}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                    </svg>
                    <p className="text-gray-400" style={{ color: '#42D7D7' }}>
                      Transcription will appear here when you start recording...
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

