import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import { useData } from '../../context/DataContext';

interface EditDataModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: any;
  type: string;
}

const EditDataModal: React.FC<EditDataModalProps> = ({ isOpen, onClose, item, type }) => {
  const { 
    updateDepartment, 
    updateCourseInRegulation, 
    updateFacultyInDepartment, 
    updateRoom, 
    updateBatchInDepartment,
    updateRegulationInDepartment
  } = useData();
  
  const [formData, setFormData] = useState<any>({});

  useEffect(() => {
    if (item) {
      setFormData({ ...item });
    }
  }, [item]);

  if (!isOpen) return null;

  const getFormFields = (type: string) => {
    const fieldMap = {
      departments: [
        { key: 'name', label: 'Department Name', type: 'text', required: true },
        { key: 'code', label: 'Department Code', type: 'text', required: true },
        { key: 'head', label: 'Head of Department', type: 'text', required: true },
      ],
      regulations: [
        { key: 'name', label: 'Regulation Name', type: 'text', required: true },
        { key: 'year', label: 'Year', type: 'number', required: true },
      ],
      courses: [
        { key: 'code', label: 'Course Code', type: 'text', required: true },
        { key: 'name', label: 'Course Name', type: 'text', required: true },
        { key: 'credits', label: 'Credits', type: 'number', required: true },
        { key: 'type', label: 'Type', type: 'select', options: ['Theory', 'Lab', 'Practical'], required: true },
        { key: 'weeklyHours', label: 'Weekly Hours', type: 'number', required: true }
      ],
      faculty: [
        { key: 'name', label: 'Name', type: 'text', required: true },
        { key: 'email', label: 'Email', type: 'email', required: true },
        { key: 'maxLoad', label: 'Max Weekly Load', type: 'number', required: true }
      ],
      rooms: [
        { key: 'name', label: 'Room Name', type: 'text', required: true },
        { key: 'type', label: 'Type', type: 'select', options: ['Classroom', 'Lab', 'Auditorium', 'Seminar Hall'], required: true },
        { key: 'capacity', label: 'Capacity', type: 'number', required: true },
        { key: 'building', label: 'Building', type: 'text', required: true }
      ],
      batches: [
        { key: 'name', label: 'Batch Name', type: 'text', required: true },
        { key: 'regulationId', label: 'Regulation', type: 'select', options: [], required: true }, // Needs dynamic options
        { key: 'studentCount', label: 'Student Count', type: 'number', required: true }
      ]
    };
    return fieldMap[type as keyof typeof fieldMap] || [];
  };

  const fields = getFormFields(type);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { id, departmentId, regulationId, ...updates } = formData;
      switch (type) {
        case 'departments':
          updateDepartment(id, updates);
          break;
        case 'regulations':
          updateRegulationInDepartment(departmentId, id, updates);
          break;
        case 'courses':
          updateCourseInRegulation(departmentId, regulationId, id, updates);
          break;
        case 'faculty':
          updateFacultyInDepartment(departmentId, id, updates);
          break;
        case 'rooms':
          updateRoom(id, updates);
          break;
        case 'batches':
          updateBatchInDepartment(departmentId, id, updates);
          break;
        default:
          throw new Error(`Unknown type: ${type}`);
      }
      
      onClose();
    } catch (error) {
      console.error('Error updating data:', error);
      alert('Error updating data. Please try again.');
    }
  };

  const handleInputChange = (key: string, value: any) => {
    setFormData({ ...formData, [key]: value });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full mx-4 sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 capitalize">
            Edit {type.slice(0, -1)}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {fields.map((field) => (
              <div key={field.key}>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {field.label}
                  {field.required && <span className="text-red-500 ml-1">*</span>}
                </label>
                {field.type === 'select' ? (
                  <select
                    value={formData[field.key] || ''}
                    onChange={(e) => handleInputChange(field.key, e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required={field.required}
                  >
                    <option value="">Select {field.label}</option>
                    {field.options?.map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    type={field.type}
                    value={formData[field.key] || ''}
                    onChange={(e) => handleInputChange(field.key, field.type === 'number' ? parseInt(e.target.value) || 0 : e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required={field.required}
                    placeholder={`Enter ${field.label.toLowerCase()}`}
                  />
                )}
              </div>
            ))}
          </div>

          <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Save className="h-4 w-4 mr-2" />
              Update {type.slice(0, -1)}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditDataModal;
