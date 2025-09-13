import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Building, MapPin, Plus, Search, ChevronRight, Edit2, Trash2, AlertTriangle } from 'lucide-react';
import { useData } from '../context/DataContext';
import DepartmentModal from '../components/DataManager/DepartmentModal';
import RoomModal from '../components/DataManager/RoomModal';
import DeleteConfirmModal from '../components/DataManager/DeleteConfirmModal';

const DataManagerPage: React.FC = () => {
  const { departments, rooms, deleteDepartment, deleteRoom } = useData();
  const [activeTab, setActiveTab] = useState<'departments' | 'rooms'>('departments');
  const [showModal, setShowModal] = useState<null | 'add-dept' | 'edit-dept' | 'add-room' | 'edit-room'>(null);
  const [currentItem, setCurrentItem] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [itemToDelete, setItemToDelete] = useState<{ item: any; type: string } | null>(null);

  const handleDeleteConfirm = () => {
    if (itemToDelete) {
      if (itemToDelete.type === 'Department') {
        deleteDepartment(itemToDelete.item.id);
      } else if (itemToDelete.type === 'Room') {
        deleteRoom(itemToDelete.item.id);
      }
      setItemToDelete(null);
    }
  };

  const filteredDepartments = departments.filter(d => d.name.toLowerCase().includes(searchTerm.toLowerCase()));
  const filteredRooms = rooms.filter(r => r.name.toLowerCase().includes(searchTerm.toLowerCase()));

  const renderDepartmentsTab = () => (
    <div className="divide-y divide-gray-200">
      {filteredDepartments.map(dept => (
        <div key={dept.id} className="flex items-center justify-between p-4 group">
            <Link to={`/departments/${dept.id}`} className="flex-grow flex items-center space-x-4">
              <div className="p-3 bg-blue-100 rounded-lg"><Building className="h-6 w-6 text-blue-600" /></div>
              <div><p className="font-semibold text-gray-900">{dept.name}</p><p className="text-sm text-gray-500">{dept.batches.length} Batches • {dept.faculty.length} Faculty</p></div>
            </Link>
            <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => { setCurrentItem(dept); setShowModal('edit-dept'); }} className="p-2 text-gray-400 hover:text-blue-600"><Edit2 className="h-4 w-4" /></button>
                <button onClick={() => setItemToDelete({ item: dept, type: 'Department' })} className="p-2 text-gray-400 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
            </div>
        </div>
      ))}
    </div>
  );
  
  const renderRoomsTab = () => (
    <div className="divide-y divide-gray-200">
        {filteredRooms.map(room => (
            <div key={room.id} className="flex items-center justify-between p-4 group">
                <div className="flex items-center space-x-4"><div className="p-3 bg-emerald-100 rounded-lg"><MapPin className="h-6 w-6 text-emerald-600" /></div><div><p className="font-semibold text-gray-900">{room.name}</p><p className="text-sm text-gray-500">{room.type} • Capacity: {room.capacity} • {room.building}</p></div></div>
                <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => { setCurrentItem(room); setShowModal('edit-room'); }} className="p-2 text-gray-400 hover:text-blue-600"><Edit2 className="h-4 w-4" /></button>
                    <button onClick={() => setItemToDelete({ item: room, type: 'Room' })} className="p-2 text-gray-400 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
                </div>
            </div>
        ))}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div><h1 className="text-3xl font-bold text-gray-900">Data Manager</h1><p className="text-gray-600 mt-1">Manage all institutional data</p></div>
        <button onClick={() => activeTab === 'departments' ? setShowModal('add-dept') : setShowModal('add-room')} className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"><Plus className="h-4 w-4 mr-2" /> Add {activeTab === 'departments' ? 'Department' : 'Room'}</button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200"><nav className="flex space-x-8"><button onClick={() => setActiveTab('departments')} className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'departments' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500'}`}>Departments</button><button onClick={() => setActiveTab('rooms')} className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'rooms' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500'}`}>Rooms</button></nav></div>

      {/* Search Bar */}
      <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" /><input type="text" placeholder={`Search ${activeTab}...`} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full max-w-md" /></div>
      
      {/* Content */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        {activeTab === 'departments' ? renderDepartmentsTab() : renderRoomsTab()}
      </div>

      {(showModal === 'add-dept' || showModal === 'edit-dept') && <DepartmentModal mode={showModal === 'add-dept' ? 'add' : 'edit'} department={showModal === 'edit-dept' ? currentItem : null} onClose={() => setShowModal(null)} />}
      {(showModal === 'add-room' || showModal === 'edit-room') && <RoomModal mode={showModal === 'add-room' ? 'add' : 'edit'} room={showModal === 'edit-room' ? currentItem : null} onClose={() => setShowModal(null)} />}
      {itemToDelete && <DeleteConfirmModal item={itemToDelete.item} itemType={itemToDelete.type} onConfirm={handleDeleteConfirm} onClose={() => setItemToDelete(null)} />}
    </div>
  );
};

export default DataManagerPage;
