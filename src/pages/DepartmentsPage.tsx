import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Building, MapPin, Plus, Search, ChevronRight, Edit2, Trash2 } from 'lucide-react';
import { useData } from '../context/DataContext';

// --- Reusable Modals (Can be moved to separate files later) ---

const AddDepartmentModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { addDepartment } = useData();
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [head, setHead] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && code && head) {
      addDepartment({ name, code, head });
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4">
        <div className="p-6 border-b"><h3 className="text-lg font-semibold">Add New Department</h3></div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Department Name</label><input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2" required /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Department Code</label><input type="text" value={code} onChange={(e) => setCode(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2" required /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Head of Department</label><input type="text" value={head} onChange={(e) => setHead(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2" required /></div>
          <div className="flex justify-end space-x-2 pt-4"><button type="button" onClick={onClose} className="px-4 py-2 text-sm bg-gray-100 rounded-lg">Cancel</button><button type="submit" className="px-4 py-2 text-sm text-white bg-blue-600 rounded-lg">Add</button></div>
        </form>
      </div>
    </div>
  );
};

const AddRoomModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { addRoom } = useData();
  const [formData, setFormData] = useState({ name: '', type: 'Classroom' as any, capacity: 60, building: '', equipment: [] as string[] });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.building && formData.capacity > 0) {
      addRoom(formData);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4">
        <div className="p-6 border-b"><h3 className="text-lg font-semibold">Add New Room</h3></div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Room Name</label><input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2" required /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Building</label><input type="text" value={formData.building} onChange={(e) => setFormData({...formData, building: e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2" required /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Capacity</label><input type="number" value={formData.capacity} onChange={(e) => setFormData({...formData, capacity: parseInt(e.target.value)})} className="w-full border border-gray-300 rounded-lg px-3 py-2" required /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Type</label><select value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value as any})} className="w-full border border-gray-300 rounded-lg px-3 py-2"><option>Classroom</option><option>Lab</option><option>Auditorium</option><option>Seminar Hall</option></select></div>
            <div className="flex justify-end space-x-2 pt-4"><button type="button" onClick={onClose} className="px-4 py-2 text-sm bg-gray-100 rounded-lg">Cancel</button><button type="submit" className="px-4 py-2 text-sm text-white bg-blue-600 rounded-lg">Add Room</button></div>
        </form>
      </div>
    </div>
  )
};

// --- Main Page Component ---

const DataManagerPage: React.FC = () => {
  const { departments, rooms } = useData();
  const [activeTab, setActiveTab] = useState<'departments' | 'rooms'>('departments');
  const [showAddDeptModal, setShowAddDeptModal] = useState(false);
  const [showAddRoomModal, setShowAddRoomModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredDepartments = departments.filter(d => d.name.toLowerCase().includes(searchTerm.toLowerCase()));
  const filteredRooms = rooms.filter(r => r.name.toLowerCase().includes(searchTerm.toLowerCase()));

  const renderDepartmentsTab = () => (
    <div className="divide-y divide-gray-200">
      {filteredDepartments.map(dept => (
        <Link key={dept.id} to={`/departments/${dept.id}`} className="flex items-center justify-between p-4 hover:bg-gray-50">
          <div className="flex items-center space-x-4"><div className="p-3 bg-blue-100 rounded-lg"><Building className="h-6 w-6 text-blue-600" /></div><div><p className="font-semibold text-gray-900">{dept.name}</p><p className="text-sm text-gray-500">{dept.batches.length} Batches • {dept.faculty.length} Faculty</p></div></div>
          <ChevronRight className="h-5 w-5 text-gray-400" />
        </Link>
      ))}
    </div>
  );
  
  const renderRoomsTab = () => (
    <div className="divide-y divide-gray-200">
        {filteredRooms.map(room => (
            <div key={room.id} className="flex items-center justify-between p-4">
                <div className="flex items-center space-x-4"><div className="p-3 bg-emerald-100 rounded-lg"><MapPin className="h-6 w-6 text-emerald-600" /></div><div><p className="font-semibold text-gray-900">{room.name}</p><p className="text-sm text-gray-500">{room.type} • Capacity: {room.capacity} • {room.building}</p></div></div>
                <div className="flex space-x-2"><button className="p-2 text-gray-400 hover:text-blue-600"><Edit2 className="h-4 w-4" /></button><button className="p-2 text-gray-400 hover:text-red-600"><Trash2 className="h-4 w-4" /></button></div>
            </div>
        ))}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div><h1 className="text-3xl font-bold text-gray-900">Data Manager</h1><p className="text-gray-600 mt-1">Manage all institutional data</p></div>
        <button onClick={() => activeTab === 'departments' ? setShowAddDeptModal(true) : setShowAddRoomModal(true)} className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"><Plus className="h-4 w-4 mr-2" /> Add {activeTab === 'departments' ? 'Department' : 'Room'}</button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200"><nav className="flex space-x-8"><button onClick={() => setActiveTab('departments')} className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'departments' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500'}`}>Departments</button><button onClick={() => setActiveTab('rooms')} className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'rooms' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500'}`}>Rooms</button></nav></div>

      {/* Search Bar */}
      <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" /><input type="text" placeholder={`Search ${activeTab}...`} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full max-w-md" /></div>
      
      {/* Content */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        {activeTab === 'departments' ? renderDepartmentsTab() : renderRoomsTab()}
      </div>

      {showAddDeptModal && <AddDepartmentModal onClose={() => setShowAddDeptModal(false)} />}
      {showAddRoomModal && <AddRoomModal onClose={() => setShowAddRoomModal(false)} />}
    </div>
  );
};

export default DataManagerPage;