import { useState } from 'react';

interface TranscriptionViewProps {
  transcript: string;
  interimTranscript: string;
  onClinicalize: () => void;
}

export default function TranscriptionView({
  transcript,
  interimTranscript,
  onClinicalize,
}: TranscriptionViewProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTranscript, setEditedTranscript] = useState(transcript);

  const displayText = isEditing ? editedTranscript : transcript;
  const fullText = displayText + (interimTranscript ? ` ${interimTranscript}` : '');

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Transcription</h3>
        <div className="space-x-2">
          <button
            onClick={() => {
              setIsEditing(!isEditing);
              if (!isEditing) {
                setEditedTranscript(transcript);
              }
            }}
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            {isEditing ? 'Cancel' : 'Edit'}
          </button>
          {isEditing && (
            <button
              onClick={() => {
                // Save edited transcript
                setIsEditing(false);
              }}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              Save
            </button>
          )}
          <button
            onClick={onClinicalize}
            disabled={!transcript.trim()}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
          >
            Extract Clinical Data
          </button>
        </div>
      </div>
      <div className="border border-gray-300 rounded-md p-4 min-h-[400px] bg-gray-50">
        {isEditing ? (
          <textarea
            value={editedTranscript}
            onChange={(e) => setEditedTranscript(e.target.value)}
            className="w-full h-full min-h-[400px] p-2 border-none bg-transparent focus:outline-none"
          />
        ) : (
          <div className="whitespace-pre-wrap">
            {fullText || (
              <span className="text-gray-400">Transcription will appear here...</span>
            )}
            {interimTranscript && (
              <span className="text-gray-500 italic">{interimTranscript}</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

