import React from 'react';
import { X, User, MapPin, BookOpen, Users, Building } from 'lucide-react';

interface ViewDataModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: any;
  type: string;
}

const ViewDataModal: React.FC<ViewDataModalProps> = ({ isOpen, onClose, item, type }) => {
  if (!isOpen) return null;

  const getIcon = (type: string) => {
    const iconMap = {
      departments: Building,
      courses: BookOpen,
      faculty: User,
      rooms: MapPin,
      batches: Users
    };
    return iconMap[type as keyof typeof iconMap] || User;
  };

  const Icon = getIcon(type);

  const getDisplayFields = (type: string, item: any) => {
    const fieldMap = {
      departments: [
        { label: 'Department Name', value: item.name },
        { label: 'Code', value: item.code },
        { label: 'Head of Department', value: item.head },
        { label: 'Faculty Count', value: item.facultyCount },
        { label: 'Student Count', value: item.studentCount }
      ],
      courses: [
        { label: 'Course Code', value: item.code },
        { label: 'Course Name', value: item.name },
        { label: 'Department', value: item.department },
        { label: 'Credits', value: item.credits },
        { label: 'Type', value: item.type },
        { label: 'Duration', value: `${item.duration} minutes` },
        { label: 'Weekly Hours', value: item.weeklyHours }
      ],
      faculty: [
        { label: 'Name', value: item.name },
        { label: 'Email', value: item.email },
        { label: 'Department', value: item.department },
        { label: 'Max Weekly Load', value: `${item.maxLoad} hours` },
        { label: 'Assigned Courses', value: item.courses?.join(', ') || 'None' },
        { label: 'Availability', value: item.availability?.join(', ') || 'Not specified' }
      ],
      rooms: [
        { label: 'Room Name', value: item.name },
        { label: 'Type', value: item.type },
        { label: 'Capacity', value: `${item.capacity} students` },
        { label: 'Building', value: item.building },
        { label: 'Equipment', value: item.equipment?.join(', ') || 'None' }
      ],
      batches: [
        { label: 'Batch Name', value: item.name },
        { label: 'Program', value: item.program },
        { label: 'Year', value: item.year },
        { label: 'Department', value: item.department },
        { label: 'Student Count', value: item.studentCount }
      ]
    };
    return fieldMap[type as keyof typeof fieldMap] || [];
  };

  const fields = getDisplayFields(type, item);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Icon className="h-5 w-5 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 capitalize">
              {type.slice(0, -1)} Details
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {fields.map((field, index) => (
              <div key={index} className={field.label === 'Course Name' || field.label === 'Department Name' || field.label === 'Name' ? 'md:col-span-2' : ''}>
                <dt className="text-sm font-medium text-gray-500">{field.label}</dt>
                <dd className="mt-1 text-sm text-gray-900 font-medium">{field.value || 'Not specified'}</dd>
              </div>
            ))}
          </div>

          <div className="flex justify-end mt-6 pt-6 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewDataModal;