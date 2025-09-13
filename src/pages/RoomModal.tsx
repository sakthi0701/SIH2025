import React, { useState, useEffect } from 'react';
import { useData } from '../../context/DataContext';
import { MapPin, Save, X } from 'lucide-react';

interface RoomModalProps {
  mode: 'add' | 'edit';
  room: any | null;
  onClose: () => void;
}

const RoomModal: React.FC<RoomModalProps> = ({ mode, room, onClose }) => {
  const { addRoom, updateRoom } = useData();
  const [formData, setFormData] = useState({ name: '', type: 'Classroom' as any, capacity: 60, building: '', equipment: [] as string[] });

  useEffect(() => {
    if (mode === 'edit' && room) {
      setFormData({ name: room.name, type: room.type, capacity: room.capacity, building: room.building, equipment: room.equipment || [] });
    }
  }, [mode, room]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.building && formData.capacity > 0) {
      if (mode === 'add') {
        addRoom(formData);
      } else if (room) {
        updateRoom(room.id, formData);
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
        <div className="p-6 border-b flex justify-between items-center">
          <h3 className="text-lg font-semibold">{mode === 'add' ? 'Add New Room' : 'Edit Room'}</h3>
          <button onClick={onClose}><X className="h-5 w-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Room Name</label>
            <input type="text" value={formData.name} onChange={(e) => handleInputChange('name', e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Building</label>
            <input type="text" value={formData.building} onChange={(e) => handleInputChange('building', e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Capacity</label>
            <input type="number" value={formData.capacity} onChange={(e) => handleInputChange('capacity', parseInt(e.target.value))} className="w-full border border-gray-300 rounded-lg px-3 py-2" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <select value={formData.type} onChange={(e) => handleInputChange('type', e.target.value as any)} className="w-full border border-gray-300 rounded-lg px-3 py-2">
              <option>Classroom</option>
              <option>Lab</option>
              <option>Auditorium</option>
              <option>Seminar Hall</option>
            </select>
          </div>
          <div className="flex justify-end space-x-2 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm bg-gray-100 rounded-lg">Cancel</button>
            <button type="submit" className="px-4 py-2 text-sm text-white bg-blue-600 rounded-lg">{mode === 'add' ? 'Add Room' : 'Update Room'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RoomModal;
