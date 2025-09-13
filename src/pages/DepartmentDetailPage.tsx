import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useData, Regulation } from '../context/DataContext';
import { ArrowLeft, Book, Users, UserPlus, Plus } from 'lucide-react';

// A simple modal for adding a new Regulation (can be moved later)
const AddRegulationModal: React.FC<{ departmentId: string; onClose: () => void }> = ({ departmentId, onClose }) => {
  const { addRegulationToDepartment } = useData();
  const [name, setName] = useState('');
  const [year, setYear] = useState(new Date().getFullYear());

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && year) {
      addRegulationToDepartment(departmentId, { name, year });
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4">
        <div className="p-6 border-b"><h3 className="text-lg font-semibold">Add New Regulation</h3></div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Regulation Name (e.g., R2023)</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
            <input type="number" value={year} onChange={(e) => setYear(parseInt(e.target.value))} className="w-full border border-gray-300 rounded-lg px-3 py-2" required />
          </div>
          <div className="flex justify-end space-x-2 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm bg-gray-100 rounded-lg">Cancel</button>
            <button type="submit" className="px-4 py-2 text-sm text-white bg-blue-600 rounded-lg">Add Regulation</button>
          </div>
        </form>
      </div>
    </div>
  );
};


const DepartmentDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { departments } = useData();
  const [activeTab, setActiveTab] = useState<'regulations' | 'batches' | 'faculty'>('regulations');
  const [showAddRegulationModal, setShowAddRegulationModal] = useState(false);

  const department = departments.find(d => d.id === id);

  if (!department) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-bold">Department not found</h2>
        <Link to="/departments" className="text-blue-600 hover:underline mt-4 inline-block">
          &larr; Back to Departments
        </Link>
      </div>
    );
  }

  // ---- TAB CONTENT COMPONENTS ----
  const RegulationsTab = () => (
    <div className="space-y-4">
       <div className="flex justify-between items-center">
        <p>Manage the academic regulations and their curriculums for the department.</p>
        <button onClick={() => setShowAddRegulationModal(true)} className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" /> Add Regulation
        </button>
      </div>
      <div className="border border-gray-200 rounded-lg divide-y divide-gray-200">
        {department.regulations.map(reg => (
          <div key={reg.id} className="p-4">
            <p className="font-semibold">{reg.name} ({reg.year})</p>
            <p className="text-sm text-gray-500">{reg.semesters.reduce((acc, sem) => acc + sem.courses.length, 0)} courses across 8 semesters</p>
          </div>
        ))}
         {department.regulations.length === 0 && <p className="p-4 text-gray-500">No regulations found.</p>}
      </div>
    </div>
  );

  const BatchesTab = () => <p className="text-gray-500">Batch management will be here.</p>;
  const FacultyTab = () => <p className="text-gray-500">Faculty management will be here.</p>;


  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Link to="/departments" className="p-2 rounded-lg hover:bg-gray-100">
          <ArrowLeft className="h-5 w-5 text-gray-600" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{department.name}</h1>
          <p className="text-gray-600 mt-1">Head of Department: {department.head}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          <button onClick={() => setActiveTab('regulations')} className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'regulations' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500'}`}>Regulations</button>
          <button onClick={() => setActiveTab('batches')} className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'batches' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500'}`}>Batches</button>
          <button onClick={() => setActiveTab('faculty')} className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'faculty' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500'}`}>Faculty</button>
        </nav>
      </div>
      
      {/* Tab Content */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        {activeTab === 'regulations' && <RegulationsTab />}
        {activeTab === 'batches' && <BatchesTab />}
        {activeTab === 'faculty' && <FacultyTab />}
      </div>

      {showAddRegulationModal && <AddRegulationModal departmentId={department.id} onClose={() => setShowAddRegulationModal(false)} />}
    </div>
  );
};

export default DepartmentDetailPage;