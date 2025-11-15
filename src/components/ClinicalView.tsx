import { useState } from 'react';

interface ClinicalViewProps {
  data: any;
  onCompose: () => void;
}

export default function ClinicalView({ data, onCompose }: ClinicalViewProps) {
  const [editableData, setEditableData] = useState(data);

  const updateField = (section: string, index: number, field: string, value: any) => {
    const newData = { ...editableData };
    newData[section][index][field] = value;
    setEditableData(newData);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Clinical Extraction</h3>
        <button
          onClick={onCompose}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          Generate SOAP Note
        </button>
      </div>

      <div className="space-y-6">
        {editableData.problems && editableData.problems.length > 0 && (
          <div>
            <h4 className="font-semibold mb-2">Problems/Diagnoses</h4>
            <div className="space-y-2">
              {editableData.problems.map((problem: any, idx: number) => (
                <div key={idx} className="border p-3 rounded">
                  <input
                    type="text"
                    value={problem.description}
                    onChange={(e) => updateField('problems', idx, 'description', e.target.value)}
                    className="w-full mb-2 px-2 py-1 border rounded"
                  />
                  <div className="text-sm text-gray-600">
                    ICD-10: {problem.icd10_code || 'Not assigned'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {editableData.medications && editableData.medications.length > 0 && (
          <div>
            <h4 className="font-semibold mb-2">Medications</h4>
            <div className="space-y-2">
              {editableData.medications.map((med: any, idx: number) => (
                <div key={idx} className="border p-3 rounded">
                  <input
                    type="text"
                    value={med.name}
                    onChange={(e) => updateField('medications', idx, 'name', e.target.value)}
                    className="w-full mb-2 px-2 py-1 border rounded"
                  />
                  <div className="text-sm text-gray-600">
                    {med.dosage} {med.frequency} {med.route}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {editableData.orders && editableData.orders.length > 0 && (
          <div>
            <h4 className="font-semibold mb-2">Orders</h4>
            <div className="space-y-2">
              {editableData.orders.map((order: any, idx: number) => (
                <div key={idx} className="border p-3 rounded">
                  <div className="font-medium">{order.type}</div>
                  <input
                    type="text"
                    value={order.description}
                    onChange={(e) => updateField('orders', idx, 'description', e.target.value)}
                    className="w-full mt-2 px-2 py-1 border rounded"
                  />
                  <div className="text-sm text-gray-600">
                    CPT: {order.cpt_code || 'Not assigned'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {editableData.vitals && editableData.vitals.length > 0 && (
          <div>
            <h4 className="font-semibold mb-2">Vital Signs</h4>
            <div className="grid grid-cols-2 gap-2">
              {editableData.vitals.map((vital: any, idx: number) => (
                <div key={idx} className="border p-3 rounded">
                  <div className="font-medium">{vital.type}</div>
                  <input
                    type="text"
                    value={vital.value}
                    onChange={(e) => updateField('vitals', idx, 'value', e.target.value)}
                    className="w-full mt-2 px-2 py-1 border rounded"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

