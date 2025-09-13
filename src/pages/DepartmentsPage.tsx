import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Building, Plus, Search, ChevronRight } from 'lucide-react';
import { useData } from '../context/DataContext';

// A simple modal for adding a new department (can be moved to a separate file later)
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
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold">Add New Department</h3>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Department Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Department Code</label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Head of Department</label>
            <input
              type="text"
              value={head}
              onChange={(e) => setHead(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              required
            />
          </div>
          <div className="flex justify-end space-x-2 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm bg-gray-100 rounded-lg">Cancel</button>
            <button type="submit" className="px-4 py-2 text-sm text-white bg-blue-600 rounded-lg">Add</button>
          </div>
        </form>
      </div>
    </div>
  );
};


const DepartmentsPage: React.FC = () => {
  const { departments } = useData();
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const filteredDepartments = departments.filter(dept => 
    dept.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dept.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Departments</h1>
          <p className="text-gray-600 mt-1">Manage all institutional departments and their data</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Department
        </button>
      </div>
      
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search departments..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full max-w-md"
        />
      </div>

      {/* Departments List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="divide-y divide-gray-200">
          {filteredDepartments.map(dept => (
            <Link 
              key={dept.id} 
              to={`/departments/${dept.id}`}
              className="flex items-center justify-between p-4 hover:bg-gray-50 cursor-pointer"
            >
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Building className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{dept.name}</p>
                  <p className="text-sm text-gray-500">
                    {dept.batches.length} Batches • {dept.faculty.length} Faculty • {dept.regulations.length} Regulations
                  </p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </Link>
          ))}
        </div>
        {filteredDepartments.length === 0 && (
          <div className="text-center p-12 text-gray-500">
            <p>No departments found.</p>
          </div>
        )}
      </div>

      {showAddModal && <AddDepartmentModal onClose={() => setShowAddModal(false)} />}
    </div>
  );
};

export default DepartmentsPage;