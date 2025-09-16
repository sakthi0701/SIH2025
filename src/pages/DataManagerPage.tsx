import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Building, MapPin, Plus, Search, Edit2, Trash2, AlertTriangle } from 'lucide-react';
import { useData } from '../context/DataContext';

// --- Reusable Modals defined directly in this file ---

const DepartmentModal: React.FC<{ mode: 'add' | 'edit'; department: any | null; onClose: () => void; }> = ({ mode, department, onClose }) => {
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
        <div className="p-6 border-b"><h3 className="text-lg font-semibold">{mode === 'add' ? 'Add New Department' : 'Edit Department'}</h3></div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Department Name</label><input type="text" value={formData.name} onChange={(e) => handleInputChange('name', e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2" required /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Department Code</label><input type="text" value={formData.code} onChange={(e) => handleInputChange('code', e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2" required /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Head of Department</label><input type="text" value={formData.head} onChange={(e) => handleInputChange('head', e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2" required /></div>
          <div className="flex justify-end space-x-2 pt-4"><button type="button" onClick={onClose} className="px-4 py-2 text-sm bg-gray-100 rounded-lg">Cancel</button><button type="submit" className="px-4 py-2 text-sm text-white bg-blue-600 rounded-lg">{mode === 'add' ? 'Add' : 'Update'}</button></div>
        </form>
      </div>
    </div>
  );
};

const RoomModal: React.FC<{ mode: 'add' | 'edit'; room: any | null; onClose: () => void; }> = ({ mode, room, onClose }) => {
  const { addRoom, updateRoom } = useData();
  const [formData, setFormData] = useState({ name: '', type: 'Classroom' as any, capacity: 60, building: '' });

  useEffect(() => {
    if (mode === 'edit' && room) {
      setFormData({ name: room.name, type: room.type, capacity: room.capacity, building: room.building });
    }
  }, [mode, room]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.building && formData.capacity > 0) {
      if (mode === 'add') {
        addRoom(formData as any);
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
        <div className="p-6 border-b"><h3 className="text-lg font-semibold">{mode === 'add' ? 'Add New Room' : 'Edit Room'}</h3></div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Room Name</label><input type="text" value={formData.name} onChange={(e) => handleInputChange('name', e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2" required /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Building</label><input type="text" value={formData.building} onChange={(e) => handleInputChange('building', e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2" required /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Capacity</label><input type="number" value={formData.capacity} onChange={(e) => handleInputChange('capacity', parseInt(e.target.value))} className="w-full border border-gray-300 rounded-lg px-3 py-2" required /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Type</label><select value={formData.type} onChange={(e) => handleInputChange('type', e.target.value as any)} className="w-full border border-gray-300 rounded-lg px-3 py-2"><option>Classroom</option><option>Lab</option><option>Auditorium</option><option>Seminar Hall</option></select></div>
          <div className="flex justify-end space-x-2 pt-4"><button type="button" onClick={onClose} className="px-4 py-2 text-sm bg-gray-100 rounded-lg">Cancel</button><button type="submit" className="px-4 py-2 text-sm text-white bg-blue-600 rounded-lg">{mode === 'add' ? 'Add Room' : 'Update Room'}</button></div>
        </form>
      </div>
    </div>
  );
};

const DeleteConfirmModal: React.FC<{ item: any; itemType: string; onConfirm: () => void; onClose: () => void; }> = ({ item, itemType, onConfirm, onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"><div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4"><div className="p-6"><div className="flex items-start space-x-3"><div className="p-2 bg-red-100 rounded-full"><AlertTriangle className="h-5 w-5 text-red-600" /></div><div><h3 className="text-lg font-semibold">Delete {itemType}</h3><p className="text-sm text-gray-600 mt-1">Are you sure you want to delete "{item.name}"? This action cannot be undone.</p></div></div></div><div className="flex justify-end space-x-2 p-4 bg-gray-50 rounded-b-xl"><button type="button" onClick={onClose} className="px-4 py-2 text-sm bg-gray-200 rounded-lg">Cancel</button><button type="button" onClick={onConfirm} className="px-4 py-2 text-sm text-white bg-red-600 rounded-lg">Delete</button></div></div></div>
);

// --- Main Page Component ---
const DataManagerPage: React.FC = () => {
  const { departments, rooms, deleteDepartment, deleteRoom, settings, updateSettings } = useData();
  const [activeTab, setActiveTab] = useState<'departments' | 'rooms'>('departments');
  const [showModal, setShowModal] = useState<null | 'add-dept' | 'edit-dept' | 'add-room' | 'edit-room'>(null);
  const [currentItem, setCurrentItem] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [itemToDelete, setItemToDelete] = useState<{ item: any; type: string } | null>(null);

  const handleDeleteConfirm = () => {
    if (itemToDelete) {
      if (itemToDelete.type === 'Department') deleteDepartment(itemToDelete.item.id);
      else if (itemToDelete.type === 'Room') deleteRoom(itemToDelete.item.id);
      setItemToDelete(null);
    }
  };

  const filteredDepartments = departments.filter(d => d.name.toLowerCase().includes(searchTerm.toLowerCase()));
  const filteredRooms = rooms.filter(r => r.name.toLowerCase().includes(searchTerm.toLowerCase()));

  const renderDepartmentsTab = () => (
    <div className="divide-y divide-gray-200">
      {filteredDepartments.map(dept => (
        <div key={dept.id} className="flex items-center justify-between p-4 group">
          <Link to={`/departments/${dept.id}`} className="flex-grow flex items-center space-x-4"><div className="p-3 bg-blue-100 rounded-lg"><Building className="h-6 w-6 text-blue-600" /></div><div><p className="font-semibold text-gray-900">{dept.name}</p><p className="text-sm text-gray-500">{dept.batches.length} Batches • {dept.faculty.length} Faculty</p></div></Link>
          <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity"><button onClick={() => { setCurrentItem(dept); setShowModal('edit-dept'); }} className="p-2 text-gray-400 hover:text-blue-600"><Edit2 className="h-4 w-4" /></button><button onClick={() => setItemToDelete({ item: dept, type: 'Department' })} className="p-2 text-gray-400 hover:text-red-600"><Trash2 className="h-4 w-4" /></button></div>
        </div>
      ))}
    </div>
  );

  const renderRoomsTab = () => (
    <div className="divide-y divide-gray-200">
      {filteredRooms.map(room => (
        <div key={room.id} className="flex items-center justify-between p-4 group">
          <div className="flex items-center space-x-4"><div className="p-3 bg-emerald-100 rounded-lg"><MapPin className="h-6 w-6 text-emerald-600" /></div><div><p className="font-semibold text-gray-900">{room.name}</p><p className="text-sm text-gray-500">{room.type} • Capacity: {room.capacity} • {room.building}</p></div></div>
          <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity"><button onClick={() => { setCurrentItem(room); setShowModal('edit-room'); }} className="p-2 text-gray-400 hover:text-blue-600"><Edit2 className="h-4 w-4" /></button><button onClick={() => setItemToDelete({ item: room, type: 'Room' })} className="p-2 text-gray-400 hover:text-red-600"><Trash2 className="h-4 w-4" /></button></div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
        <div className="flex justify-between items-center">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Data Manager</h1>
                <p className="text-gray-600 mt-1">Manage all institutional data</p>
            </div>
            <div className="flex items-center space-x-4">
                <div>
                    <label htmlFor="semester-select" className="text-sm font-medium text-gray-700">Active Semester:</label>
                    <select
                        id="semester-select"
                        value={settings?.activeSemester || 1}
                        onChange={(e) => updateSettings({ activeSemester: parseInt(e.target.value)})}
                        className="ml-2 border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    >
                        {Array.from({ length: 8 }, (_, i) => i + 1).map(sem => (
                            <option key={sem} value={sem}>Semester {sem}</option>
                        ))}
                    </select>
                </div>
                <button onClick={() => setShowModal(activeTab === 'departments' ? 'add-dept' : 'add-room')} className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
                    <Plus className="h-4 w-4 mr-2" /> Add {activeTab === 'departments' ? 'Department' : 'Room'}
                </button>
            </div>
        </div>
        <div className="border-b border-gray-200"><nav className="flex space-x-8"><button onClick={() => setActiveTab('departments')} className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'departments' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500'}`}>Departments</button><button onClick={() => setActiveTab('rooms')} className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'rooms' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500'}`}>Rooms</button></nav></div>
        <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" /><input type="text" placeholder={`Search ${activeTab}...`} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full max-w-md" /></div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">{activeTab === 'departments' ? renderDepartmentsTab() : renderRoomsTab()}</div>
        {(showModal === 'add-dept' || showModal === 'edit-dept') && <DepartmentModal mode={showModal === 'add-dept' ? 'add' : 'edit'} department={showModal === 'edit-dept' ? currentItem : null} onClose={() => setShowModal(null)} />}
        {(showModal === 'add-room' || showModal === 'edit-room') && <RoomModal mode={showModal === 'add-room' ? 'add' : 'edit'} room={showModal === 'edit-room' ? currentItem : null} onClose={() => setShowModal(null)} />}
        {itemToDelete && <DeleteConfirmModal item={itemToDelete.item} itemType={itemToDelete.type} onConfirm={handleDeleteConfirm} onClose={() => setItemToDelete(null)} />}
    </div>
);
};

export default DataManagerPage;