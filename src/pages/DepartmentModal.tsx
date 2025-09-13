import React, { useState, useEffect } from 'react';
import { useData } from '../../context/DataContext';
import { Building, Save, X } from 'lucide-react';

interface DepartmentModalProps {
  mode: 'add' | 'edit';
  department: any | null;
  onClose: () => void;
}

const DepartmentModal: React.FC<DepartmentModalProps> = ({ mode, department, onClose }) => {
  const { addDepartment, updateDepartment } = useData();
  const [formData, setFormData] = useState({ name: '', code: '', head: '' });

  useEffect(() => {
    if (mode === 'edit' && department) {
      setFormData({ name: department.name, code: department.code, head: department.head });
    }
  }, [mode, department]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.code && formData.head) {
      if (mode === 'add') {
        addDepartment(formData);
      } else if (department) {
        updateDepartment(department.id, formData);
      }
      onClose();
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4">
        <div className="p-6 border-b flex justify-between items-center">
          <h3 className="text-lg font-semibold">{mode === 'add' ? 'Add New Department' : 'Edit Department'}</h3>
          <button onClick={onClose}><X className="h-5 w-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Department Name</label>
            <input type="text" value={formData.name} onChange={(e) => handleInputChange('name', e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Department Code</label>
            <input type="text" value={formData.code} onChange={(e) => handleInputChange('code', e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Head of Department</label>
            <input type="text" value={formData.head} onChange={(e) => handleInputChange('head', e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2" required />
          </div>
          <div className="flex justify-end space-x-2 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm bg-gray-100 rounded-lg">Cancel</button>
            <button type="submit" className="px-4 py-2 text-sm text-white bg-blue-600 rounded-lg">{mode === 'add' ? 'Add' : 'Update'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DepartmentModal;

