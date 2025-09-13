import React, { useState } from 'react';
import { Upload, Download, Plus, Search, Filter } from 'lucide-react';
import DataTable from '../components/DataManager/DataTable';
import ImportModal from '../components/DataManager/ImportModal';
import AddDataModal from '../components/DataManager/AddDataModal';
import { useData } from '../context/DataContext';

const DataManager: React.FC = () => {
  const { departments, courses, faculty, rooms, batches } = useData();
  const [activeTab, setActiveTab] = useState('departments');
  const [showImportModal, setShowImportModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const tabs = [
    { id: 'departments', label: 'Departments', count: departments.length },
    { id: 'courses', label: 'Courses', count: courses.length },
    { id: 'faculty', label: 'Faculty', count: faculty.length },
    { id: 'rooms', label: 'Rooms', count: rooms.length },
    { id: 'batches', label: 'Batches', count: batches.length }
  ];

  const getActiveData = () => {
    const dataMap = {
      departments,
      courses,
      faculty,
      rooms,
      batches
    };
    return dataMap[activeTab as keyof typeof dataMap] || [];
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Data Manager</h1>
          <p className="text-gray-600 mt-1">Manage your institutional data and imports</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowAddModal(true)}
            onClick={() => setShowImportModal(true)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
          >
            <Upload className="h-4 w-4 mr-2" />
            Import Data
          </button>
          <button className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
            <Plus className="h-4 w-4 mr-2" />
            Add New
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
              <span className="ml-2 bg-gray-100 text-gray-900 py-0.5 px-2 rounded-full text-xs">
                {tab.count}
              </span>
            </button>
          ))}
        </nav>
      </div>

      {/* Search and Filters */}
      <div className="flex justify-between items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder={`Search ${activeTab}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors">
          <Filter className="h-4 w-4 mr-2" />
          Filters
        </button>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <DataTable
          type={activeTab}
          data={getActiveData()}
          searchTerm={searchTerm}
        />
      </div>

      {/* Import Modal */}
      {showImportModal && (
        <ImportModal
          isOpen={showImportModal}
          onClose={() => setShowImportModal(false)}
        />
      )}

      {/* Add Data Modal */}
      {showAddModal && (
        <AddDataModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          type={activeTab}
        />
      )}
    </div>
  );
};

export default DataManager;