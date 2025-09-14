import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useData, Course } from '../context/DataContext';
import { ArrowLeft, Plus, Edit2, Trash2, AlertTriangle } from 'lucide-react';
import EditDataModal from '../components/DataManager/EditDataModal';

// --- Reusable Modals ---
const AddCourseModal: React.FC<{
  departmentId: string;
  regulationId: string;
  semesterNumber: number;
  onClose: () => void;
}> = ({ departmentId, regulationId, semesterNumber, onClose }) => {
  const { addCourseToRegulation } = useData();
  const [formData, setFormData] = useState({ name: '', code: '', credits: 3, weeklyHours: 3, type: 'Theory' as 'Theory' | 'Lab' | 'Practical' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.code) { addCourseToRegulation(departmentId, regulationId, semesterNumber, formData); onClose(); }
  };
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full mx-4 sm:max-w-xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b"><h3 className="text-lg font-semibold">Add New Course to Semester {semesterNumber}</h3></div>
        <form onSubmit={handleSubmit} className="p-6 grid grid-cols-2 gap-4">
          <div className="col-span-2"><label className="block text-sm font-medium text-gray-700 mb-1">Course Name</label><input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2" required /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Course Code</label><input type="text" value={formData.code} onChange={(e) => setFormData({...formData, code: e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2" required /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Type</label><select value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value as any})} className="w-full border border-gray-300 rounded-lg px-3 py-2"><option value="Theory">Theory</option><option value="Lab">Lab</option><option value="Practical">Practical</option></select></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Credits</label><input type="number" value={formData.credits} onChange={(e) => setFormData({...formData, credits: parseInt(e.target.value)})} className="w-full border border-gray-300 rounded-lg px-3 py-2" required /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Weekly Hours</label><input type="number" value={formData.weeklyHours} onChange={(e) => setFormData({...formData, weeklyHours: parseInt(e.target.value)})} className="w-full border border-gray-300 rounded-lg px-3 py-2" required /></div>
          <div className="col-span-2 flex justify-end space-x-2 pt-4"><button type="button" onClick={onClose} className="px-4 py-2 text-sm bg-gray-100 rounded-lg">Cancel</button><button type="submit" className="px-4 py-2 text-sm text-white bg-blue-600 rounded-lg">Add Course</button></div>
        </form>
      </div>
    </div>
  );
};

const DeleteConfirmModal: React.FC<{ item: any; onConfirm: () => void; onClose: () => void; }> = ({ item, onConfirm, onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"><div className="bg-white rounded-xl shadow-xl w-full mx-4 sm:max-w-xl max-h-[90vh] overflow-y-auto"><div className="p-6"><div className="flex items-start space-x-3"><div className="p-2 bg-red-100 rounded-full"><AlertTriangle className="h-5 w-5 text-red-600" /></div><div><h3 className="text-lg font-semibold">Delete Course</h3><p className="text-sm text-gray-600 mt-1">Are you sure you want to delete "{item.name}"? This will remove it from the curriculum.</p></div></div></div><div className="flex justify-end space-x-2 p-4 bg-gray-50 rounded-b-xl"><button type="button" onClick={onClose} className="px-4 py-2 text-sm bg-gray-200 rounded-lg">Cancel</button><button type="button" onClick={onConfirm} className="px-4 py-2 text-sm text-white bg-red-600 rounded-lg">Delete</button></div></div></div>
);

// --- Main Page Component ---
const RegulationDetailPage: React.FC = () => {
  const { deptId, regId } = useParams<{ deptId: string, regId: string }>();
  const { departments, deleteCourseFromRegulation } = useData();
  const [modalSemester, setModalSemester] = useState<number | null>(null);
  const [courseToDelete, setCourseToDelete] = useState<Course | null>(null);
  const [courseToEdit, setCourseToEdit] = useState<Course | null>(null);

  const department = departments.find(d => d.id === deptId);
  const regulation = department?.regulations.find(r => r.id === regId);

  const handleDeleteConfirm = () => {
      if (courseToDelete && department && regulation) {
          deleteCourseFromRegulation(department.id, regulation.id, courseToDelete.id);
          setCourseToDelete(null);
      }
  };

  if (!department || !regulation) return <div className="text-center py-12"><h2 className="text-xl font-bold">Regulation not found</h2><Link to={`/departments/${deptId}`} className="text-blue-600 hover:underline mt-4 inline-block">&larr; Back to Department</Link></div>;

  return (
     <div className="space-y-6">
      <div className="flex items-center space-x-4"><Link to={`/departments/${deptId}`} className="p-2 rounded-lg hover:bg-gray-100"><ArrowLeft className="h-5 w-5 text-gray-600" /></Link><div><h1 className="text-3xl font-bold text-gray-900">Regulation: {regulation.name} ({regulation.year})</h1><p className="text-gray-600 mt-1">Managing curriculum for {department.name}</p></div></div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">{regulation.semesters.map(semester => (<div key={semester.id} className="bg-white rounded-xl shadow-sm border border-gray-200"><div className="p-4 border-b flex justify-between items-center"><h3 className="font-semibold text-gray-900">Semester {semester.semesterNumber}</h3><button onClick={() => setModalSemester(semester.semesterNumber)} className="p-1 text-blue-600 hover:bg-blue-100 rounded-full"><Plus className="h-4 w-4" /></button></div><div className="p-4 space-y-2">{semester.courses.length > 0 ? semester.courses.map(course => (<div key={course.id} className="flex items-center justify-between p-2 rounded-lg group hover:bg-gray-50"><div><p className="font-medium text-sm text-gray-800">{course.name} ({course.code})</p><p className="text-xs text-gray-500">{course.credits} Credits • {course.weeklyHours} hrs/week • {course.type}</p></div><div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity"><button onClick={() => setCourseToEdit({ ...course, departmentId: deptId!, regulationId: regId! })} className="p-1 text-gray-400 hover:text-blue-600"><Edit2 className="h-4 w-4" /></button><button onClick={() => setCourseToDelete(course)} className="p-1 text-gray-400 hover:text-red-600"><Trash2 className="h-4 w-4" /></button></div></div>)) : (<p className="text-sm text-gray-400 text-center py-4">No courses added yet.</p>)}</div></div>))}</div>
      {modalSemester && (<AddCourseModal departmentId={deptId!} regulationId={regId!} semesterNumber={modalSemester} onClose={() => setModalSemester(null)}/>)}
      {courseToEdit && <EditDataModal isOpen={!!courseToEdit} onClose={() => setCourseToEdit(null)} item={courseToEdit} type="courses" />}
      {courseToDelete && <DeleteConfirmModal item={courseToDelete} onConfirm={handleDeleteConfirm} onClose={() => setCourseToDelete(null)} />}
    </div>
  )
};

export default RegulationDetailPage;