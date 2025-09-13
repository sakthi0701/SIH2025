import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useData, Department, Course } from '../context/DataContext';
import { ArrowLeft, Book, Users, UserPlus, Plus, ChevronRight } from 'lucide-react';

// --- MODALS (Can be moved to separate files later) ---

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

const AddBatchModal: React.FC<{ departmentId: string; regulations: any[], onClose: () => void }> = ({ departmentId, regulations, onClose }) => {
    const { addBatchToDepartment } = useData();
    const [formData, setFormData] = useState({ name: '', regulationId: '', studentCount: 60 });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.name && formData.regulationId) {
            addBatchToDepartment(departmentId, formData);
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4">
                <div className="p-6 border-b"><h3 className="text-lg font-semibold">Add New Batch</h3></div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Batch Name (e.g., CSE-2024)</label>
                        <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Regulation</label>
                        <select value={formData.regulationId} onChange={(e) => setFormData({...formData, regulationId: e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2" required>
                            <option value="">Select a Regulation</option>
                            {regulations.map(reg => <option key={reg.id} value={reg.id}>{reg.name}</option>)}
                        </select>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Student Count</label>
                        <input type="number" value={formData.studentCount} onChange={(e) => setFormData({...formData, studentCount: parseInt(e.target.value)})} className="w-full border border-gray-300 rounded-lg px-3 py-2" required />
                    </div>
                    <div className="flex justify-end space-x-2 pt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-sm bg-gray-100 rounded-lg">Cancel</button>
                        <button type="submit" className="px-4 py-2 text-sm text-white bg-blue-600 rounded-lg">Add Batch</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const AddFacultyModal: React.FC<{ departmentId: string; allCourses: (Course & {deptCode: string})[], onClose: () => void; }> = ({ departmentId, allCourses, onClose }) => {
    const { addFacultyToDepartment } = useData();
    const [formData, setFormData] = useState({ name: '', email: '', maxLoad: 18, assignedCourses: [] as string[] });

    const handleCourseToggle = (courseId: string) => {
        setFormData(prev => ({
            ...prev,
            assignedCourses: prev.assignedCourses.includes(courseId)
                ? prev.assignedCourses.filter(id => id !== courseId)
                : [...prev.assignedCourses, courseId]
        }));
    };
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.name && formData.email) {
            addFacultyToDepartment(departmentId, formData);
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b"><h3 className="text-lg font-semibold">Add New Faculty</h3></div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                            <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2" required />
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                            <input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2" required />
                        </div>
                        <div>
                           <label className="block text-sm font-medium text-gray-700 mb-1">Max Weekly Load (Hours)</label>
                            <input type="number" value={formData.maxLoad} onChange={(e) => setFormData({...formData, maxLoad: parseInt(e.target.value)})} className="w-full border border-gray-300 rounded-lg px-3 py-2" required />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Assignable Courses</label>
                        <div className="max-h-60 overflow-y-auto border border-gray-300 rounded-lg p-2 space-y-1">
                            {allCourses.map(course => (
                                <label key={course.id} className="flex items-center space-x-3 p-2 rounded hover:bg-gray-50">
                                    <input type="checkbox" checked={formData.assignedCourses.includes(course.id)} onChange={() => handleCourseToggle(course.id)} className="h-4 w-4 text-blue-600 border-gray-300 rounded" />
                                    <span className="text-sm font-medium">{course.name} ({course.deptCode})</span>
                                </label>
                            ))}
                        </div>
                    </div>
                    <div className="flex justify-end space-x-2 pt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-sm bg-gray-100 rounded-lg">Cancel</button>
                        <button type="submit" className="px-4 py-2 text-sm text-white bg-blue-600 rounded-lg">Add Faculty</button>
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
  const [showAddBatchModal, setShowAddBatchModal] = useState(false);
  // ---- CHANGE: State for Add Faculty Modal ----
  const [showAddFacultyModal, setShowAddFacultyModal] = useState(false);
  // -------------------------------------------

  const department = departments.find(d => d.id === id);
  
  // Create a flat list of all courses from all departments for the faculty modal
  const allCourses = departments.flatMap(dept => 
    dept.regulations.flatMap(reg => 
      reg.semesters.flatMap(sem => 
        sem.courses.map(course => ({...course, deptCode: dept.code}))
      )
    )
  );

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
          <Link 
            key={reg.id} 
            to={`/departments/${department.id}/regulations/${reg.id}`}
            className="flex items-center justify-between p-4 hover:bg-gray-50 cursor-pointer"
          >
            <div>
              <p className="font-semibold">{reg.name} ({reg.year})</p>
              <p className="text-sm text-gray-500">{reg.semesters.reduce((acc, sem) => acc + sem.courses.length, 0)} courses across 8 semesters</p>
            </div>
            <ChevronRight className="h-5 w-5 text-gray-400" />
          </Link>
        ))}
         {department.regulations.length === 0 && <p className="p-4 text-gray-500">No regulations found.</p>}
      </div>
    </div>
  );

  const BatchesTab = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p>Manage student batches for the department.</p>
        <button onClick={() => setShowAddBatchModal(true)} className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" /> Add Batch
        </button>
      </div>
      <div className="border border-gray-200 rounded-lg divide-y divide-gray-200">
        {department.batches.map(batch => {
          const regulation = department.regulations.find(r => r.id === batch.regulationId);
          return (
            <div key={batch.id} className="p-4">
              <p className="font-semibold">{batch.name}</p>
              <p className="text-sm text-gray-500">
                {batch.studentCount} Students • Regulation: {regulation?.name || 'N/A'}
              </p>
            </div>
          )
        })}
        {department.batches.length === 0 && <p className="p-4 text-gray-500">No batches found.</p>}
      </div>
    </div>
  );

  // ---- CHANGE: Implement FacultyTab Component ----
  const FacultyTab = () => (
     <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p>Manage faculty members and their assignable courses.</p>
        <button onClick={() => setShowAddFacultyModal(true)} className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
          <UserPlus className="h-4 w-4 mr-2" /> Add Faculty
        </button>
      </div>
      <div className="border border-gray-200 rounded-lg divide-y divide-gray-200">
        {department.faculty.map(fac => {
          const assignedCourseNames = allCourses
            .filter(c => fac.assignedCourses.includes(c.id))
            .map(c => c.code)
            .join(', ');
          return (
            <div key={fac.id} className="p-4">
              <p className="font-semibold">{fac.name}</p>
              <p className="text-sm text-gray-500">{fac.email} • Max Load: {fac.maxLoad} hrs/week</p>
              <p className="text-xs text-gray-500 mt-1">Handles: {assignedCourseNames || 'None'}</p>
            </div>
          )
        })}
        {department.faculty.length === 0 && <p className="p-4 text-gray-500">No faculty members found.</p>}
      </div>
    </div>
  )
  // -------------------------------------------


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
      {showAddBatchModal && <AddBatchModal departmentId={department.id} regulations={department.regulations} onClose={() => setShowAddBatchModal(false)} />}
      {/* ---- CHANGE: Render the Add Faculty Modal ---- */}
      {showAddFacultyModal && <AddFacultyModal departmentId={department.id} allCourses={allCourses} onClose={() => setShowAddFacultyModal(false)} />}
      {/* ------------------------------------------- */}
    </div>
  );
};

export default DepartmentDetailPage;