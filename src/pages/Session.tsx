import { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../services/api';
import { WebSocketClient } from '../services/websocket';
import { AudioRecorder } from '../services/audio';
import TranscriptionView from '../components/TranscriptionView';
import ClinicalView from '../components/ClinicalView';
import SOAPViewer from '../components/SOAPViewer';
import EHRExport from '../components/EHRExport';
import type { TranscriptSegment, TranscriptUpdatePayload } from '../types/transcript';
import { useSpeakerAllocator } from '../hooks/useSpeakerAllocator';
import { createSegment, rebuildSegmentsFromText, transcriptToSegment } from '../utils/transcriptSegments';

interface User {
  email: string;
}

export default function Session() {
  const [user, setUser] = useState<User | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState('');
  const [searchParams] = useSearchParams();
  
  // Session State
  const [sessionId, setSessionId] = useState<number | undefined>(
    searchParams.get('id') ? parseInt(searchParams.get('id')!) : undefined
  );
  const [patientId, setPatientId] = useState(searchParams.get('patient_id') || '');
  const [patientName, setPatientName] = useState(searchParams.get('patient_name') || '');
  const [segments, setSegments] = useState<TranscriptSegment[]>([]);
  const [interimSegment, setInterimSegment] = useState<TranscriptSegment | null>(null);
  const [clinicalData, setClinicalData] = useState<Record<string, unknown> | null>(null);
  const [soapNote, setSoapNote] = useState<Record<string, unknown> | null>(null);
  const [activeTab, setActiveTab] = useState<'transcription' | 'clinical' | 'soap' | 'export'>('transcription');
  
  const navigate = useNavigate();
  const audioRecorderRef = useRef<AudioRecorder | null>(null);
  const wsClientRef = useRef<WebSocketClient | null>(null);
  const { assignSpeaker, resetSpeakers } = useSpeakerAllocator();

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
  const WS_URL = API_BASE_URL.replace('http', 'ws') + '/api/realtime/ws';

  // Auth Check
  useEffect(() => {
    const fetchUser = async () => {
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

  // Load existing transcripts when sessionId is present
  useEffect(() => {
    const loadExistingTranscripts = async () => {
      if (!sessionId) return;
      
      const isDemoMode = localStorage.getItem('demo_mode') === 'true';
      if (isDemoMode) {
        // Skip loading in demo mode
        return;
      }

      try {
        const response = await api.get<{ transcripts: Array<{ id: number; text: string; speaker: string | null; isInterim: boolean; createdAt: string }> }>(`/api/transcripts/session/${sessionId}`);
        const transcripts = response.data.transcripts || [];
        
        // Filter out interim transcripts and convert to segments
        const finalTranscripts = transcripts.filter((t) => !t.isInterim);
        if (finalTranscripts.length > 0) {
          const loadedSegments = finalTranscripts.map((transcript) =>
            transcriptToSegment(transcript, assignSpeaker)
          );
          setSegments(loadedSegments);
        }
      } catch (error) {
        // Silently fail - session might not have transcripts yet
        console.debug('Could not load existing transcripts:', error);
      }
    };

    loadExistingTranscripts();
  }, [sessionId, assignSpeaker]);

  const handleLogout = () => {
    stopRecording();
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('demo_mode');
    navigate('/auth');
  };

  const handleBackToDashboard = () => {
    stopRecording();
    navigate('/dashboard');
  };

  // Derived State
  const transcriptText = useMemo(
    () => segments.map((segment) => segment.text).join(' ').trim(),
    [segments]
  );
  const editableTranscript = useMemo(
    () => segments.map((segment) => segment.text).join('\n\n'),
    [segments]
  );

  // Handlers
  const handleTranscriptUpdate = ({ text, isInterim, speaker }: TranscriptUpdatePayload) => {
    if (!text?.trim()) return;
    
    // Pass isFinal flag (opposite of isInterim) to help with speaker alternation
    const speakerLabel = assignSpeaker(speaker, !isInterim);
    if (isInterim) {
      setInterimSegment({
        ...createSegment(text, speakerLabel),
        id: 'interim',
      });
    } else {
      setSegments((prev) => [...prev, createSegment(text, speakerLabel)]);
      setInterimSegment(null);
    }
  };

  const startRecording = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        setError('Not authenticated');
        return;
      }

      // Build query parameters object
      const queryParams: Record<string, string> = {};
      if (sessionId) queryParams.session_id = sessionId.toString();
      if (patientId) queryParams.patient_id = patientId;
      if (patientName) queryParams.patient_name = patientName;
      
      // Create WebSocket client with base URL, token, and query params
      // The client will construct: ws://localhost:8000/api/realtime/ws?token=...&patient_id=...&patient_name=...
      wsClientRef.current = new WebSocketClient(WS_URL, token, queryParams);

      wsClientRef.current.connect(
        (data) => {
          if (data.type === 'session_started') {
            const sessionData = data as {
              type: string;
              session_id: number;
              user_id?: number;
              token_verified?: boolean;
              assemblyai_session_id?: string;
            };
            console.log('Session started:', {
              session_id: sessionData.session_id,
              user_id: sessionData.user_id,
              token_verified: sessionData.token_verified,
              assemblyai_session_id: sessionData.assemblyai_session_id,
            });
            setSessionId(sessionData.session_id);
          } else if (data.type === 'interim_transcript') {
            const transcriptData = data as {
              type: string;
              text: string;
              speaker?: string;
            };
            handleTranscriptUpdate({
              text: transcriptData.text,
              isInterim: true,
              speaker: transcriptData.speaker,
            });
          } else if (data.type === 'final_transcript') {
            const transcriptData = data as {
              type: string;
              text: string;
              speaker?: string;
            };
            handleTranscriptUpdate({
              text: transcriptData.text,
              isInterim: false,
              speaker: transcriptData.speaker,
            });
          } else if (data.type === 'error') {
            const errorData = data as {
              type: string;
              message?: string;
            };
            setError(errorData.message || 'An error occurred');
            setIsRecording(false);
            stopRecording();
          }
        },
        (error) => {
          console.error('WebSocket error:', error);
          setError('Connection error. Please check your backend server.');
          setIsRecording(false);
        },
        () => {
          setIsRecording(false);
        }
      );

      audioRecorderRef.current = new AudioRecorder();
      await audioRecorderRef.current.startRecording((audioData) => {
        if (wsClientRef.current) {
          wsClientRef.current.send(audioData);
        }
      });

      setIsRecording(true);
      setError('');
      setActiveTab('transcription');
    } catch (err: unknown) {
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
    return () => stopRecording();
  }, []);

  const handleTranscriptEdit = (updatedText: string) => {
    setSegments((prev) => rebuildSegmentsFromText(updatedText, prev));
    setInterimSegment(null);
  };

  const handleClinicalize = async () => {
    if (!transcriptText) return;
    try {
      const response = await api.post('/api/clinicalize', {
        transcript_text: transcriptText,
        session_id: sessionId,
      });
      setClinicalData(response.data);
      setActiveTab('clinical');
    } catch (error) {
      console.error('Error clinicalizing:', error);
      setError('Failed to extract clinical data');
    }
  };

  const handleCompose = async () => {
    if (!clinicalData) return;
    try {
      const response = await api.post('/api/compose', {
        clinical_extraction: clinicalData,
        transcript_text: transcriptText,
      });
      setSoapNote(response.data);
      setActiveTab('soap');
    } catch (error) {
      console.error('Error composing SOAP note:', error);
      setError('Failed to generate SOAP note');
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F0FDFF' }}>
      <nav className="bg-white shadow" style={{ borderBottom: '2px solid #42D7D7' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={handleBackToDashboard}
                className="mr-4 px-3 py-1 rounded-md text-sm font-medium transition-colors"
                style={{ color: '#42D7D7', border: '1px solid #42D7D7' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#42D7D7';
                  e.currentTarget.style.color = 'white';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = '#42D7D7';
                }}
              >
                ← Back to Dashboard
              </button>
              <h1 className="text-xl font-bold" style={{ color: '#42D7D7' }}>
                Session {sessionId ? `#${sessionId}` : 'Recording'}
              </h1>
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
          {/* Patient Info & Controls */}
          <div className="bg-white p-6 rounded-lg shadow-lg mb-6" style={{ border: '2px solid #42D7D7' }}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Patient ID</label>
                <input
                  type="text"
                  value={patientId}
                  onChange={(e) => setPatientId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[#42D7D7] focus:border-[#42D7D7]"
                  placeholder="Enter patient ID"
                  disabled={isRecording}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Patient Name</label>
                <input
                  type="text"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[#42D7D7] focus:border-[#42D7D7]"
                  placeholder="Enter patient name"
                  disabled={isRecording}
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {!isRecording ? (
                  <button
                    onClick={startRecording}
                    className="px-8 py-3 rounded-lg text-white font-medium flex items-center transition-all transform hover:scale-105 shadow-lg"
                    style={{ backgroundColor: '#42D7D7' }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#3BC5C5'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#42D7D7'}
                  >
                    <span className="w-3 h-3 bg-white rounded-full mr-2"></span>
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
                {(segments.length > 0 || interimSegment) && (
                  <button
                    onClick={() => {
                      setSegments([]);
                      setInterimSegment(null);
                      resetSpeakers();
                      setClinicalData(null);
                      setSoapNote(null);
                      setSessionId(undefined);
                      setActiveTab('transcription');
                    }}
                    className="px-4 py-2 rounded-md text-sm font-medium transition-colors border"
                    style={{ borderColor: '#42D7D7', color: '#42D7D7' }}
                  >
                    Clear Session
                  </button>
                )}
              </div>
              {error && (
                <div className="text-red-600 text-sm bg-red-50 px-3 py-1 rounded">
                  {error}
                </div>
              )}
            </div>
          </div>

          {/* Main Workspace */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden" style={{ border: '2px solid #42D7D7' }}>
            <div className="border-b border-gray-200 bg-gray-50">
              <nav className="flex">
                {(['transcription', 'clinical', 'soap', 'export'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                      activeTab === tab
                        ? 'border-[#42D7D7] text-[#00838F]'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </nav>
            </div>

            <div className="p-6 min-h-[500px]">
              {activeTab === 'transcription' && (
                <TranscriptionView
                  segments={segments}
                  interimSegment={interimSegment}
                  editableText={editableTranscript}
                  onTranscriptEdit={handleTranscriptEdit}
                  onClinicalize={handleClinicalize}
                />
              )}
              {activeTab === 'clinical' && (
                clinicalData ? (
                  <ClinicalView
                    data={clinicalData}
                    onCompose={handleCompose}
                  />
                ) : (
                  <div className="text-center text-gray-500 py-12">
                    {segments.length > 0 
                      ? "Click 'Extract Clinical Data' in the Transcription tab to proceed."
                      : "Record a session to extract clinical data."}
                  </div>
                )
              )}
              {activeTab === 'soap' && (
                soapNote ? (
                  <SOAPViewer soapNote={soapNote} />
                ) : (
                  <div className="text-center text-gray-500 py-12">
                    Generate a SOAP note from the Clinical Data tab first.
                  </div>
                )
              )}
              {activeTab === 'export' && (
                soapNote && typeof soapNote.soap_note_id === 'number' ? (
                  <EHRExport soapNoteId={soapNote.soap_note_id} />
                ) : (
                  <div className="text-center text-gray-500 py-12">
                    Generate a SOAP note to enable export options.
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

