import React, { useState, useEffect } from 'react';
import { useData, Batch, Regulation } from '../../context/DataContext';

interface BatchModalProps {
  mode: 'add' | 'edit';
  batch: Batch | null;
  departmentId: string;
  regulations: Regulation[];
  onClose: () => void;
}

const BatchModal: React.FC<BatchModalProps> = ({ mode, batch, departmentId, regulations, onClose }) => {
  const { addBatchToDepartment, updateBatchInDepartment } = useData();
  const [formData, setFormData] = useState({ name: '', regulationId: '', studentCount: 60 });

  useEffect(() => {
    if (mode === 'edit' && batch) {
      setFormData({ name: batch.name, regulationId: batch.regulationId, studentCount: batch.studentCount });
    }
  }, [mode, batch]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.regulationId) {
      if (mode === 'add') {
        addBatchToDepartment(departmentId, formData);
      } else if (batch) {
        updateBatchInDepartment(departmentId, batch.id, formData);
      }
      onClose();
    }
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4">
        <div className="p-6 border-b"><h3 className="text-lg font-semibold">{mode === 'add' ? 'Add New Batch' : 'Edit Batch'}</h3></div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Batch Name (e.g., CSE-2024)</label>
            <input type="text" value={formData.name} onChange={(e) => handleInputChange('name', e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Regulation</label>
            <select value={formData.regulationId} onChange={(e) => handleInputChange('regulationId', e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2" required>
              <option value="">Select a Regulation</option>
              {regulations.map(reg => <option key={reg.id} value={reg.id}>{reg.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Student Count</label>
            <input type="number" value={formData.studentCount} onChange={(e) => handleInputChange('studentCount', parseInt(e.target.value))} className="w-full border border-gray-300 rounded-lg px-3 py-2" required />
          </div>
          <div className="flex justify-end space-x-2 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm bg-gray-100 rounded-lg">Cancel</button>
            <button type="submit" className="px-4 py-2 text-sm text-white bg-blue-600 rounded-lg">{mode === 'add' ? 'Add Batch' : 'Update Batch'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BatchModal;

