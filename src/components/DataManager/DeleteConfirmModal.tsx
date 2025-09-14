import React from 'react';
import { X, Trash2, AlertTriangle } from 'lucide-react';
import { useData } from '../../context/DataContext';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: any;
  type: string;
  onConfirm: () => void;
}

const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({ 
  isOpen, 
  onClose, 
  item, 
  type, 
  onConfirm
}) => {
  const { 
    deleteDepartment, 
    deleteCourse, 
    deleteFaculty, 
    deleteRoom, 
    deleteBatch 
  } = useData();
  
  if (!isOpen) return null;

  const getItemName = (item: any, type: string) => {
    if (item.name) return item.name;
    if (item.code) return item.code;
    return `${type.slice(0, -1)} #${item.id}`;
  };

  const itemName = getItemName(item, type);
  
  const handleConfirm = () => {
    try {
      switch (type) {
        case 'departments':
          deleteDepartment(item.id);
          break;
        case 'courses':
          deleteCourse(item.id);
          break;
        case 'faculty':
          deleteFaculty(item.id);
          break;
        case 'rooms':
          deleteRoom(item.id);
          break;
        case 'batches':
          deleteBatch(item.id);
          break;
        default:
          throw new Error(`Unknown type: ${type}`);
      }
      
      onConfirm();
      onClose();
    } catch (error) {
      console.error('Error deleting data:', error);
      alert('Error deleting data. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full mx-4 sm:max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              Confirm Deletion
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
          <p className="text-sm text-gray-600 mb-4">
            Are you sure you want to delete <span className="font-semibold text-gray-900">"{itemName}"</span>? 
            This action cannot be undone and may affect related data.
          </p>

          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex">
              <AlertTriangle className="h-5 w-5 text-red-600 mr-2 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-medium text-red-800">Warning</h4>
                <p className="text-sm text-red-700 mt-1">
                  Deleting this {type.slice(0, -1)} may impact existing timetables and schedules.
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete {type.slice(0, -1)}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmModal;