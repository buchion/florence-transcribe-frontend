import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import RealtimeSession from '../components/RealtimeSession';
import TranscriptionView from '../components/TranscriptionView';
import ClinicalView from '../components/ClinicalView';
import SOAPViewer from '../components/SOAPViewer';
import EHRExport from '../components/EHRExport';
import api from '../services/api';

export default function Session() {
  const [sessionId, setSessionId] = useState<number | undefined>();
  const [patientId, setPatientId] = useState('');
  const [patientName, setPatientName] = useState('');
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [clinicalData, setClinicalData] = useState<any>(null);
  const [soapNote, setSoapNote] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'transcription' | 'clinical' | 'soap' | 'export'>('transcription');
  const navigate = useNavigate();

  const handleTranscriptUpdate = (text: string, isInterim: boolean) => {
    if (isInterim) {
      setInterimTranscript(text);
    } else {
      setTranscript((prev) => prev + ' ' + text);
      setInterimTranscript('');
    }
  };

  const handleClinicalize = async () => {
    try {
      const response = await api.post('/api/clinicalize', {
        transcript_text: transcript,
        session_id: sessionId,
      });
      setClinicalData(response.data);
      setActiveTab('clinical');
    } catch (error) {
      console.error('Error clinicalizing:', error);
    }
  };

  const handleCompose = async () => {
    if (!clinicalData) return;
    try {
      const response = await api.post('/api/compose', {
        clinical_extraction: clinicalData,
        transcript_text: transcript,
      });
      setSoapNote(response.data);
      setActiveTab('soap');
    } catch (error) {
      console.error('Error composing SOAP note:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={() => navigate('/dashboard')}
                className="text-gray-600 hover:text-gray-900"
              >
                ← Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-6">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Patient ID
                </label>
                <input
                  type="text"
                  value={patientId}
                  onChange={(e) => setPatientId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Enter patient ID"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Patient Name
                </label>
                <input
                  type="text"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Enter patient name"
                />
              </div>
            </div>
            <RealtimeSession
              sessionId={sessionId}
              patientId={patientId}
              patientName={patientName}
              onTranscriptUpdate={handleTranscriptUpdate}
              onSessionStart={setSessionId}
            />
          </div>

          <div className="bg-white rounded-lg shadow">
            <div className="border-b border-gray-200">
              <nav className="flex -mb-px">
                {(['transcription', 'clinical', 'soap', 'export'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-6 py-3 text-sm font-medium ${
                      activeTab === tab
                        ? 'border-b-2 border-indigo-500 text-indigo-600'
                        : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </nav>
            </div>

            <div className="p-6">
              {activeTab === 'transcription' && (
                <TranscriptionView
                  transcript={transcript}
                  interimTranscript={interimTranscript}
                  onClinicalize={handleClinicalize}
                />
              )}
              {activeTab === 'clinical' && clinicalData && (
                <ClinicalView
                  data={clinicalData}
                  onCompose={handleCompose}
                />
              )}
              {activeTab === 'soap' && soapNote && (
                <SOAPViewer soapNote={soapNote} />
              )}
              {activeTab === 'export' && soapNote && (
                <EHRExport soapNoteId={soapNote.soap_note_id} />
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

