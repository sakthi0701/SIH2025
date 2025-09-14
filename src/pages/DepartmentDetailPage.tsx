import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useData, Course, Regulation, Batch, Faculty } from '../context/DataContext';
import { ArrowLeft, Plus, ChevronRight, Edit2, Trash2, AlertTriangle, UserPlus, ChevronDown } from 'lucide-react';
import EditDataModal from '../components/DataManager/EditDataModal';
import FacultyAssignmentModal from '../components/DataManager/FacultyAssignmentModal';

// --- Reusable Modals ---

const BatchModal: React.FC<{ mode: 'add' | 'edit'; batch: Batch | null; departmentId: string; regulations: Regulation[]; onClose: () => void; }> = ({ mode, batch, departmentId, regulations, onClose }) => {
  const { addBatchToDepartment, updateBatchInDepartment } = useData();
  const [formData, setFormData] = useState({ name: '', regulationId: '', studentCount: 60, yearEntered: new Date().getFullYear(), yearGraduating: new Date().getFullYear() + 4 });

  useEffect(() => {
    if (mode === 'edit' && batch) {
      setFormData({ name: batch.name, regulationId: batch.regulationId, studentCount: batch.studentCount, yearEntered: batch.yearEntered, yearGraduating: batch.yearGraduating });
    } else {
      setFormData({ name: '', regulationId: '', studentCount: 60, yearEntered: new Date().getFullYear(), yearGraduating: new Date().getFullYear() + 4 });
    }
  }, [mode, batch]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.regulationId) {
      if (mode === 'add') {
        addBatchToDepartment(departmentId, formData);
      } else if (batch) {
        updateBatchInDepartment(departmentId, batch.id, formData);
      }
      onClose();
    }
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full mx-4 sm:max-w-xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b"><h3 className="text-lg font-semibold">{mode === 'add' ? 'Add New Batch' : 'Edit Batch'}</h3></div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Batch Name (e.g., CSE-2024)</label><input type="text" value={formData.name} onChange={(e) => handleInputChange('name', e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2" required /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Regulation</label><select value={formData.regulationId} onChange={(e) => handleInputChange('regulationId', e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2" required><option value="">Select a Regulation</option>{regulations.map(reg => <option key={reg.id} value={reg.id}>{reg.name}</option>)}</select></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Student Count</label><input type="number" value={formData.studentCount} onChange={(e) => handleInputChange('studentCount', parseInt(e.target.value))} className="w-full border border-gray-300 rounded-lg px-3 py-2" required /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Year Entered</label><input type="number" value={formData.yearEntered} onChange={(e) => handleInputChange('yearEntered', parseInt(e.target.value))} className="w-full border border-gray-300 rounded-lg px-3 py-2" required /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Year Graduating</label><input type="number" value={formData.yearGraduating} onChange={(e) => handleInputChange('yearGraduating', parseInt(e.target.value))} className="w-full border border-gray-300 rounded-lg px-3 py-2" required /></div>
          <div className="flex justify-end space-x-2 pt-4"><button type="button" onClick={onClose} className="px-4 py-2 text-sm bg-gray-100 rounded-lg">Cancel</button><button type="submit" className="px-4 py-2 text-sm text-white bg-blue-600 rounded-lg">{mode === 'add' ? 'Add Batch' : 'Update Batch'}</button></div>
        </form>
      </div>
    </div>
  );
};

const FacultyModal: React.FC<{ mode: 'add' | 'edit'; faculty: Faculty | null; departmentId: string; allCourses: (Course & { deptCode: string })[]; onClose: () => void; }> = ({ mode, faculty, departmentId, allCourses, onClose }) => {
  const { addFacultyToDepartment, updateFacultyInDepartment, departments } = useData();
  const [formData, setFormData] = useState({ name: '', email: '', maxLoad: 18, assignedCourses: [] as string[] });
  const [showOtherDepts, setShowOtherDepts] = useState(false);
  const [selectedDept, setSelectedDept] = useState('');

  useEffect(() => {
    if (mode === 'edit' && faculty) {
      setFormData({ name: faculty.name, email: faculty.email, maxLoad: faculty.maxLoad, assignedCourses: faculty.assignedCourses || [] });
    } else {
        setFormData({ name: '', email: '', maxLoad: 18, assignedCourses: [] });
    }
  }, [mode, faculty]);

  const handleCourseToggle = (courseId: string) => {
    setFormData(prev => ({ ...prev, assignedCourses: prev.assignedCourses.includes(courseId) ? prev.assignedCourses.filter(id => id !== courseId) : [...prev.assignedCourses, courseId]}));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.email) {
      if (mode === 'add') {
        addFacultyToDepartment(departmentId, formData);
      } else if (faculty) {
        updateFacultyInDepartment(departmentId, faculty.id, formData);
      }
      onClose();
    }
  };

  const coursesToShow = showOtherDepts && selectedDept ? allCourses.filter(c => c.departmentId === selectedDept) : allCourses.filter(c => c.departmentId === departmentId);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full mx-4 sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b"><h3 className="text-lg font-semibold">{mode === 'add' ? 'Add New Faculty' : 'Edit Faculty'}</h3></div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label><input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2" required /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Email</label><input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2" required /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Max Weekly Load (Hours)</label><input type="number" value={formData.maxLoad} onChange={(e) => setFormData({ ...formData, maxLoad: parseInt(e.target.value) })} className="w-full border border-gray-300 rounded-lg px-3 py-2" required /></div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Assignable Courses</label>
            <div className="flex items-center space-x-2 mb-2">
                <input type="checkbox" id="showOtherDepts" checked={showOtherDepts} onChange={(e) => setShowOtherDepts(e.target.checked)} />
                <label htmlFor="showOtherDepts">Show courses from other departments</label>
            </div>
            {showOtherDepts && (
                <select value={selectedDept} onChange={(e) => setSelectedDept(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-2">
                    <option value="">Select a department</option>
                    {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
            )}
            <div className="max-h-60 overflow-y-auto border border-gray-300 rounded-lg p-2 space-y-1">{coursesToShow.map(course => (<label key={course.id} className="flex items-center space-x-3 p-2 rounded hover:bg-gray-50"><input type="checkbox" checked={formData.assignedCourses.includes(course.id)} onChange={() => handleCourseToggle(course.id)} className="h-4 w-4 text-blue-600 border-gray-300 rounded" /><span className="text-sm font-medium">{course.name} ({course.deptCode})</span></label>))}</div>
          </div>
          <div className="flex justify-end space-x-2 pt-4"><button type="button" onClick={onClose} className="px-4 py-2 text-sm bg-gray-100 rounded-lg">Cancel</button><button type="submit" className="px-4 py-2 text-sm text-white bg-blue-600 rounded-lg">{mode === 'add' ? 'Add Faculty' : 'Update Faculty'}</button></div>
        </form>
      </div>
    </div>
  );
};


const AddRegulationModal: React.FC<{ onClose: () => void; departmentId: string; }> = ({ onClose, departmentId }) => {
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
      <div className="bg-white rounded-xl shadow-xl w-full mx-4 sm:max-w-xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b"><h3 className="text-lg font-semibold">Add New Regulation</h3></div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Regulation Name (e.g., R2023)</label><input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2" required /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Year</label><input type="number" value={year} onChange={(e) => setYear(parseInt(e.target.value))} className="w-full border border-gray-300 rounded-lg px-3 py-2" required /></div>
          <div className="flex justify-end space-x-2 pt-4"><button type="button" onClick={onClose} className="px-4 py-2 text-sm bg-gray-100 rounded-lg">Cancel</button><button type="submit" className="px-4 py-2 text-sm text-white bg-blue-600 rounded-lg">Add Regulation</button></div>
        </form>
      </div>
    </div>
  );
};

const DeleteConfirmModal: React.FC<{ item: any; itemType: string; onConfirm: () => void; onClose: () => void; }> = ({ item, itemType, onConfirm, onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"><div className="bg-white rounded-xl shadow-xl w-full mx-4 sm:max-w-xl max-h-[90vh] overflow-y-auto"><div className="p-6"><div className="flex items-start space-x-3"><div className="p-2 bg-red-100 rounded-full"><AlertTriangle className="h-5 w-5 text-red-600" /></div><div><h3 className="text-lg font-semibold">Delete {itemType}</h3><p className="text-sm text-gray-600 mt-1">Are you sure you want to delete "{item.name}"? This action cannot be undone.</p></div></div></div><div className="flex justify-end space-x-2 p-4 bg-gray-50 rounded-b-xl"><button type="button" onClick={onClose} className="px-4 py-2 text-sm bg-gray-200 rounded-lg">Cancel</button><button type="button" onClick={onConfirm} className="px-4 py-2 text-sm text-white bg-red-600 rounded-lg">Delete</button></div></div></div>
);

// --- Main Page Component ---
const DepartmentDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { departments, deleteRegulationFromDepartment, deleteBatchFromDepartment, deleteFacultyFromDepartment, faculty, currentSemester } = useData();
  const [activeTab, setActiveTab] = useState<'regulations' | 'batches' | 'faculty'>('regulations');
  const [showAddRegulationModal, setShowAddRegulationModal] = useState(false);
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [showFacultyModal, setShowFacultyModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ item: any; type: string } | null>(null);
  const [itemToEdit, setItemToEdit] = useState<{ item: any; type: string } | null>(null);
  const [editingBatch, setEditingBatch] = useState<Batch | null>(null);
  const [editingFaculty, setEditingFaculty] = useState<Faculty | null>(null);
  const [expandedBatch, setExpandedBatch] = useState<string | null>(null);
  const [facultyAssignmentModalOpen, setFacultyAssignmentModalOpen] = useState(false);
  const [selectedCourseForFacultyAssignment, setSelectedCourseForFacultyAssignment] = useState<Course | null>(null);
  const [selectedBatchForFacultyAssignment, setSelectedBatchForFacultyAssignment] = useState<Batch | null>(null);


  const department = departments.find(d => d.id === id);
  const allCourses = departments.flatMap(dept => dept.regulations.flatMap(reg => reg.semesters.flatMap(sem => sem.courses.map(course => ({...course, deptCode: dept.code, departmentId: dept.id})))));

  const handleDeleteConfirm = () => {
    if (!itemToDelete || !department) return;
    switch (itemToDelete.type) {
      case 'Regulation': deleteRegulationFromDepartment(department.id, itemToDelete.item.id); break;
      case 'Batch': deleteBatchFromDepartment(department.id, itemToDelete.item.id); break;
      case 'Faculty': deleteFacultyFromDepartment(department.id, itemToDelete.item.id); break;
    }
    setItemToDelete(null);
  };

  const handleOpenFacultyAssignmentModal = (course: Course, batch: Batch) => {
    setSelectedCourseForFacultyAssignment(course);
    setSelectedBatchForFacultyAssignment(batch);
    setFacultyAssignmentModalOpen(true);
  };

  if (!department) return <div className="text-center py-12"><h2 className="text-xl font-bold">Department not found</h2><Link to="/data-manager" className="text-blue-600 hover:underline mt-4 inline-block">&larr; Back to Data Manager</Link></div>;

  const RegulationsTab = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center"><p>Manage the academic regulations and their curriculums.</p><button onClick={() => setShowAddRegulationModal(true)} className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"><Plus className="h-4 w-4 mr-2" /> Add Regulation</button></div>
      <div className="border border-gray-200 rounded-lg divide-y divide-gray-200">{department.regulations.map(reg => (<div key={reg.id} className="flex items-center justify-between p-4 group"><Link to={`/departments/${department.id}/regulations/${reg.id}`} className="flex-grow flex items-center justify-between"><div><p className="font-semibold">{reg.name} ({reg.year})</p><p className="text-sm text-gray-500">{reg.semesters.reduce((acc, sem) => acc + sem.courses.length, 0)} courses</p></div><ChevronRight className="h-5 w-5 text-gray-400 group-hover:translate-x-1 transition-transform" /></Link><div className="flex space-x-2 pl-4"><button onClick={() => setItemToEdit({item: { ...reg, departmentId: department.id }, type: 'regulations'})} className="p-2 text-gray-400 hover:text-blue-600 opacity-0 group-hover:opacity-100"><Edit2 className="h-4 w-4" /></button><button onClick={() => setItemToDelete({item: reg, type: 'Regulation'})} className="p-2 text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100"><Trash2 className="h-4 w-4" /></button></div></div>))}{department.regulations.length === 0 && <p className="p-4 text-gray-500">No regulations found.</p>}</div>
    </div>
  );

  const BatchesTab = () => (
    <div className="space-y-4">
        <div className="flex justify-between items-center">
            <p>Manage student batches and view their assigned courses for Semester {currentSemester}.</p>
            <button onClick={() => { setEditingBatch(null); setShowBatchModal(true); }} className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" /> Add Batch
            </button>
        </div>
        <div className="border border-gray-200 rounded-lg divide-y divide-gray-200">
            {department.batches.map(batch => {
                const regulation = department.regulations.find(r => r.id === batch.regulationId);
                const semester = regulation?.semesters.find(s => s.semesterNumber === currentSemester);
                const courses = semester?.courses || [];
                return (
                    <div key={batch.id}>
                        <div className="flex items-center justify-between p-4 group">
                            <div>
                                <p className="font-semibold">{batch.name}</p>
                                <p className="text-sm text-gray-500">{batch.studentCount} Students • Regulation: {regulation?.name || 'N/A'}</p>
                            </div>
                            <div className="flex items-center space-x-2">
                                <button onClick={() => setExpandedBatch(expandedBatch === batch.id ? null : batch.id)} className="p-2 text-gray-500 hover:text-gray-800">
                                    <ChevronDown className={`h-5 w-5 transition-transform ${expandedBatch === batch.id ? 'rotate-180' : ''}`} />
                                </button>
                                <button onClick={() => { setEditingBatch(batch); setShowBatchModal(true); }} className="p-2 text-gray-400 hover:text-blue-600 opacity-0 group-hover:opacity-100"><Edit2 className="h-4 w-4" /></button>
                                <button onClick={() => setItemToDelete({ item: batch, type: 'Batch' })} className="p-2 text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100"><Trash2 className="h-4 w-4" /></button>
                            </div>
                        </div>
                        {expandedBatch === batch.id && (
                            <div className="p-4 bg-gray-50 border-t">
                                <h4 className="font-semibold text-sm mb-2">Courses for Semester {currentSemester}:</h4>
                                {courses.length > 0 ? (
                                    <ul className="text-sm text-gray-700 space-y-2">
                                        {courses.map(c => {
                                            const assignment = batch.courseAssignments?.find(a => a.courseId === c.id);
                                            const assignedFaculty = assignment?.facultyIds.map(id => faculty.find(f => f.id === id)?.name).filter(Boolean);
                                            return (
                                                <li key={c.id} className="flex justify-between items-center p-2 bg-white rounded-md">
                                                    <div>
                                                        <p className="font-medium">{c.name} ({c.code})</p>
                                                        {assignedFaculty && assignedFaculty.length > 0 ? (
                                                            <p className="text-xs text-gray-600">
                                                                Assigned to: {assignedFaculty.join(', ')}
                                                            </p>
                                                        ) : <p className="text-xs text-gray-400">No faculty assigned</p>}
                                                    </div>
                                                    <button onClick={() => handleOpenFacultyAssignmentModal(c, batch)} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded hover:bg-blue-200">
                                                        {assignedFaculty && assignedFaculty.length > 0 ? 'Edit' : 'Assign'} Faculty
                                                    </button>
                                                </li>
                                            )
                                        })}
                                    </ul>
                                ) : (
                                    <p className="text-sm text-gray-500">No courses found for this semester.</p>
                                )}
                            </div>
                        )}
                    </div>
                )
            })}
            {department.batches.length === 0 && <p className="p-4 text-gray-500">No batches found.</p>}
        </div>
    </div>
);


  const FacultyTab = () => (
     <div className="space-y-4">
      <div className="flex justify-between items-center"><p>Manage faculty members and their assignable courses.</p><button onClick={() => { setEditingFaculty(null); setShowFacultyModal(true); }} className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"><UserPlus className="h-4 w-4 mr-2" /> Add Faculty</button></div>
      <div className="border border-gray-200 rounded-lg divide-y divide-gray-200">{department.faculty.map(fac => { const assignedCourseNames = allCourses.filter(c => fac.assignedCourses.includes(c.id)).map(c => c.code).join(', '); return (<div key={fac.id} className="flex items-center justify-between p-4 group"><div><p className="font-semibold">{fac.name}</p><p className="text-sm text-gray-500">{fac.email} • Max Load: {fac.maxLoad} hrs/week</p><p className="text-xs text-gray-500 mt-1">Handles: {assignedCourseNames || 'None'}</p></div><div className="flex space-x-2"><button onClick={() => { setEditingFaculty(fac); setShowFacultyModal(true); }} className="p-2 text-gray-400 hover:text-blue-600 opacity-0 group-hover:opacity-100"><Edit2 className="h-4 w-4" /></button><button onClick={() => setItemToDelete({item: fac, type: 'Faculty'})} className="p-2 text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100"><Trash2 className="h-4 w-4" /></button></div></div>)})}
        {department.faculty.length === 0 && <p className="p-4 text-gray-500">No faculty members found.</p>}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4"><Link to="/data-manager" className="p-2 rounded-lg hover:bg-gray-100"><ArrowLeft className="h-5 w-5 text-gray-600" /></Link><div><h1 className="text-3xl font-bold text-gray-900">{department.name}</h1><p className="text-gray-600 mt-1">Head of Department: {department.head}</p></div></div>
      <div className="border-b border-gray-200"><nav className="flex space-x-8"><button onClick={() => setActiveTab('regulations')} className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'regulations' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500'}`}>Regulations</button><button onClick={() => setActiveTab('batches')} className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'batches' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500'}`}>Batches</button><button onClick={() => setActiveTab('faculty')} className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'faculty' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500'}`}>Faculty</button></nav></div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">{activeTab === 'regulations' && <RegulationsTab />}{activeTab === 'batches' && <BatchesTab />}{activeTab === 'faculty' && <FacultyTab />}</div>
      {showAddRegulationModal && <AddRegulationModal departmentId={department.id} onClose={() => setShowAddRegulationModal(false)} />}
      {showBatchModal && <BatchModal mode={editingBatch ? 'edit' : 'add'} batch={editingBatch} departmentId={department.id} regulations={department.regulations} onClose={() => { setShowBatchModal(false); setEditingBatch(null); }} />}
      {showFacultyModal && <FacultyModal mode={editingFaculty ? 'edit' : 'add'} faculty={editingFaculty} departmentId={department.id} allCourses={allCourses} onClose={() => { setShowFacultyModal(false); setEditingFaculty(null); }} />}
      {itemToEdit && <EditDataModal isOpen={!!itemToEdit} onClose={() => setItemToEdit(null)} item={itemToEdit.item} type={itemToEdit.type} />}
      {itemToDelete && <DeleteConfirmModal item={itemToDelete.item} itemType={itemToDelete.type} onConfirm={handleDeleteConfirm} onClose={() => setItemToDelete(null)} />}
      {facultyAssignmentModalOpen && selectedCourseForFacultyAssignment && selectedBatchForFacultyAssignment && (
        <FacultyAssignmentModal
          isOpen={facultyAssignmentModalOpen}
          onClose={() => setFacultyAssignmentModalOpen(false)}
          batchId={selectedBatchForFacultyAssignment.id}
          courseId={selectedCourseForFacultyAssignment.id}
          departmentId={department.id}
        />
      )}
    </div>
  );
};

export default DepartmentDetailPage;