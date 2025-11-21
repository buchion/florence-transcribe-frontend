import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import patientsService from '../services/patients';
import type { Patient, CreatePatientDto } from '../types/patient';
import PatientForm from '../components/PatientForm';
import FileUpload from '../components/FileUpload';

interface User {
  email: string;
  id?: number;
}

interface Session {
  id: number;
  user_id: number;
  user_email: string;
  patient_id: string | null;
  patient_name: string | null;
  status: string;
  started_at: string | null;
  ended_at: string | null;
  created_at: string | null;
}

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [view, setView] = useState<'sessions' | 'patients'>('sessions');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddPatient, setShowAddPatient] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [patientSessions, setPatientSessions] = useState<Session[]>([]);
  
  const navigate = useNavigate();

  // Auth Check & Fetch Sessions
  useEffect(() => {
    const fetchData = async () => {
      const isDemoMode = localStorage.getItem('demo_mode') === 'true';
      if (isDemoMode) {
        setUser({ email: 'demo@florence.ai' });
        setLoading(false);
        return;
      }

      try {
        const userResponse = await api.get('/api/auth/me');
        setUser(userResponse.data);
        
        // Fetch sessions for current user
        const sessionsResponse = await api.get('/api/admin/sessions', {
          params: {
            user_id: userResponse.data.id,
            limit: 100
          }
        });
        setSessions(sessionsResponse.data.sessions || []);
      } catch (err: unknown) {
        if (err && typeof err === 'object' && 'response' in err) {
          const axiosError = err as { response?: { status?: number } };
          if (axiosError.response?.status === 401) {
            navigate('/auth');
          } else {
            setError('Failed to load sessions');
          }
        } else {
          setError('Failed to load sessions');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [navigate]);

  // Fetch patients when view changes to patients
  useEffect(() => {
    if (view === 'patients') {
      fetchPatients();
    }
  }, [view, searchQuery]);

  const fetchPatients = async () => {
    try {
      const response = await patientsService.getPatients(0, 100, searchQuery || undefined);
      setPatients(response.patients || []);
    } catch (err: any) {
      setError('Failed to load patients');
    }
  };

  const handleCreatePatient = async (data: CreatePatientDto) => {
    try {
      await patientsService.createPatient(data);
      setShowAddPatient(false);
      fetchPatients();
    } catch (err: any) {
      throw err;
    }
  };

  const handleImportPatients = async (file: File) => {
    return await patientsService.importPatients(file);
  };

  const handleViewPatientSessions = async (patient: Patient) => {
    setSelectedPatient(patient);
    try {
      const response = await patientsService.getPatientSessions(patient.id);
      setPatientSessions(response.sessions || []);
    } catch (err: any) {
      setError('Failed to load patient sessions');
    }
  };

  const handleClosePatientDetail = () => {
    setSelectedPatient(null);
    setPatientSessions([]);
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('demo_mode');
    navigate('/auth');
  };

  const handleNewSession = () => {
    navigate('/session');
  };

  const handleViewSession = (sessionId: number) => {
    navigate(`/session?id=${sessionId}`);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const getStatusBadge = (status: string) => {
    const baseClasses = "px-2 py-1 rounded-full text-xs font-medium";
    switch (status.toLowerCase()) {
      case 'active':
        return `${baseClasses} bg-green-100 text-green-800`;
      case 'ended':
        return `${baseClasses} bg-gray-100 text-gray-800`;
      case 'cancelled':
        return `${baseClasses} bg-red-100 text-red-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F0FDFF' }}>
      <nav className="bg-white shadow" style={{ borderBottom: '2px solid #42D7D7' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold" style={{ color: '#42D7D7' }}>
                Florence Transcribe
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
          {/* View Toggle */}
          <div className="mb-6 flex gap-2">
            <button
              onClick={() => setView('sessions')}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                view === 'sessions'
                  ? 'text-white'
                  : 'text-gray-700 bg-white border border-gray-300'
              }`}
              style={view === 'sessions' ? { backgroundColor: '#42D7D7' } : {}}
            >
              Sessions
            </button>
            <button
              onClick={() => setView('patients')}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                view === 'patients'
                  ? 'text-white'
                  : 'text-gray-700 bg-white border border-gray-300'
              }`}
              style={view === 'patients' ? { backgroundColor: '#42D7D7' } : {}}
            >
              Patients
            </button>
          </div>

          {/* Header */}
          {view === 'sessions' ? (
            <div className="mb-6 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Sessions Overview</h2>
                <p className="text-gray-600 mt-1">Manage and view all your transcription sessions</p>
              </div>
              <button
                onClick={handleNewSession}
                className="px-6 py-3 rounded-lg text-white font-medium flex items-center transition-all transform hover:scale-105 shadow-lg"
                style={{ backgroundColor: '#42D7D7' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#3BC5C5'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#42D7D7'}
              >
                <span className="mr-2">+</span>
                New Session
              </button>
            </div>
          ) : (
            <div className="mb-6 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Patients</h2>
                <p className="text-gray-600 mt-1">Manage patient records</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowAddPatient(true)}
                  className="px-6 py-3 rounded-lg text-white font-medium flex items-center transition-all transform hover:scale-105 shadow-lg"
                  style={{ backgroundColor: '#42D7D7' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#3BC5C5'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#42D7D7'}
                >
                  <span className="mr-2">+</span>
                  Add Patient
                </button>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {/* Patient Search */}
          {view === 'patients' && (
            <div className="mb-6">
              <input
                type="text"
                placeholder="Search patients by name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#42D7D7]"
              />
            </div>
          )}

          {/* Add Patient Modal */}
          {showAddPatient && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 max-w-4xl max-h-[90vh] overflow-y-auto w-full mx-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold">Add New Patient</h3>
                  <button
                    onClick={() => setShowAddPatient(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ✕
                  </button>
                </div>
                <PatientForm
                  onSubmit={handleCreatePatient}
                  onCancel={() => setShowAddPatient(false)}
                />
              </div>
            </div>
          )}

          {/* Patient Detail Modal */}
          {selectedPatient && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 max-w-4xl max-h-[90vh] overflow-y-auto w-full mx-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold">
                    {selectedPatient.firstName} {selectedPatient.lastName}
                  </h3>
                  <button
                    onClick={handleClosePatientDetail}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ✕
                  </button>
                </div>
                <div className="mb-4">
                  <p><strong>Phone:</strong> {selectedPatient.phoneNumber}</p>
                  {selectedPatient.email && <p><strong>Email:</strong> {selectedPatient.email}</p>}
                </div>
                <div className="mt-4">
                  <h4 className="font-bold mb-2">Sessions ({patientSessions.length})</h4>
                  {patientSessions.length === 0 ? (
                    <p className="text-gray-500">No sessions found for this patient</p>
                  ) : (
                    <div className="space-y-2">
                      {patientSessions.map((session) => (
                        <div
                          key={session.id}
                          className="p-3 border border-gray-200 rounded cursor-pointer hover:bg-gray-50"
                          onClick={() => handleViewSession(session.id)}
                        >
                          <div className="flex justify-between">
                            <span className="font-medium">Session #{session.id}</span>
                            <span className={getStatusBadge(session.status)}>{session.status}</span>
                          </div>
                          {session.startedAt && (
                            <div className="text-sm text-gray-500">
                              {formatDate(session.startedAt)}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Import Patients Section */}
          {view === 'patients' && (
            <div className="mb-6 bg-white rounded-lg shadow-lg p-6" style={{ border: '2px solid #42D7D7' }}>
              <h3 className="text-lg font-bold mb-4">Import Patients</h3>
              <FileUpload onUpload={handleImportPatients} />
            </div>
          )}

          {/* Patients List */}
          {view === 'patients' && (
            <>
              {loading ? (
                <div className="bg-white rounded-lg shadow-lg p-12 text-center">
                  <div className="text-gray-500">Loading patients...</div>
                </div>
              ) : patients.length === 0 ? (
                <div className="bg-white rounded-lg shadow-lg p-12 text-center" style={{ border: '2px solid #42D7D7' }}>
                  <div className="text-gray-500 mb-4">No patients found</div>
                  <button
                    onClick={() => setShowAddPatient(true)}
                    className="px-6 py-2 rounded-md text-white font-medium"
                    style={{ backgroundColor: '#42D7D7' }}
                  >
                    Add Your First Patient
                  </button>
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow-lg overflow-hidden" style={{ border: '2px solid #42D7D7' }}>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Name
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Phone
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Email
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Patient ID
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {patients.map((patient) => (
                          <tr key={patient.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {patient.firstName} {patient.lastName}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {patient.phoneNumber}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {patient.email || '-'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {patient.patientId || '-'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <button
                                onClick={() => handleViewPatientSessions(patient)}
                                className="text-[#42D7D7] hover:text-[#3BC5C5] transition-colors mr-4"
                              >
                                View Sessions
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Sessions List */}
          {view === 'sessions' && (
            <>
              {loading ? (
            <div className="bg-white rounded-lg shadow-lg p-12 text-center">
              <div className="text-gray-500">Loading sessions...</div>
            </div>
          ) : sessions.length === 0 ? (
            <div className="bg-white rounded-lg shadow-lg p-12 text-center" style={{ border: '2px solid #42D7D7' }}>
              <div className="text-gray-500 mb-4">No sessions found</div>
                  <button
                onClick={handleNewSession}
                className="px-6 py-2 rounded-md text-white font-medium"
                style={{ backgroundColor: '#42D7D7' }}
              >
                Start Your First Session
                  </button>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-lg overflow-hidden" style={{ border: '2px solid #42D7D7' }}>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Session ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Patient
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Started
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ended
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Duration
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {sessions.map((session) => {
                      const startTime = session.started_at ? new Date(session.started_at) : null;
                      const endTime = session.ended_at ? new Date(session.ended_at) : null;
                      const duration = startTime && endTime 
                        ? Math.round((endTime.getTime() - startTime.getTime()) / 1000 / 60)
                        : null;

                      return (
                        <tr key={session.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            #{session.id}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <div>
                              {session.patient_name ? (
                                <>
                                  <div className="font-medium">{session.patient_name}</div>
                                  {session.patient_id && (
                                    <div className="text-gray-500 text-xs">ID: {session.patient_id}</div>
                                  )}
                                </>
                              ) : (
                                <span className="text-gray-400">No patient info</span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={getStatusBadge(session.status)}>
                              {session.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(session.started_at)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(session.ended_at)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {duration !== null ? `${duration} min` : '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button
                              onClick={() => handleViewSession(session.id)}
                              className="text-[#42D7D7] hover:text-[#3BC5C5] transition-colors"
                            >
                              View →
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
                  </div>
          )}
            </>
          )}

          {/* Stats Summary */}
          {view === 'sessions' && sessions.length > 0 && (
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-lg shadow-lg p-6" style={{ border: '2px solid #42D7D7' }}>
                <div className="text-sm text-gray-600">Total Sessions</div>
                <div className="text-2xl font-bold mt-2" style={{ color: '#42D7D7' }}>
                  {sessions.length}
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-lg p-6" style={{ border: '2px solid #42D7D7' }}>
                <div className="text-sm text-gray-600">Active Sessions</div>
                <div className="text-2xl font-bold mt-2" style={{ color: '#42D7D7' }}>
                  {sessions.filter(s => s.status.toLowerCase() === 'active').length}
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-lg p-6" style={{ border: '2px solid #42D7D7' }}>
                <div className="text-sm text-gray-600">Completed Sessions</div>
                <div className="text-2xl font-bold mt-2" style={{ color: '#42D7D7' }}>
                  {sessions.filter(s => s.status.toLowerCase() === 'ended').length}
                  </div>
                  </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
