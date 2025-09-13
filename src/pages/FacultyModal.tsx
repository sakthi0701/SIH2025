import React, { useState, useEffect } from 'react';
import { useData, Faculty, Course } from '../../context/DataContext';
import { UserPlus, Save, X } from 'lucide-react';

interface FacultyModalProps {
  mode: 'add' | 'edit';
  faculty: (Faculty & { departmentId: string }) | null;
  departmentId: string;
  allCourses: (Course & { deptCode: string })[];
  onClose: () => void;
}

const FacultyModal: React.FC<FacultyModalProps> = ({ mode, faculty, departmentId, allCourses, onClose }) => {
  const { addFacultyToDepartment, updateFacultyInDepartment } = useData();
  const [formData, setFormData] = useState({ name: '', email: '', maxLoad: 18, assignedCourses: [] as string[] });

  useEffect(() => {
    if (mode === 'edit' && faculty) {
      setFormData({ name: faculty.name, email: faculty.email, maxLoad: faculty.maxLoad, assignedCourses: faculty.assignedCourses || [] });
    }
  }, [mode, faculty]);

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
      if (mode === 'add') {
        addFacultyToDepartment(departmentId, formData);
      } else if (faculty) {
        updateFacultyInDepartment(departmentId, faculty.id, formData);
      }
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b"><h3 className="text-lg font-semibold">{mode === 'add' ? 'Add New Faculty' : 'Edit Faculty'}</h3></div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Max Weekly Load (Hours)</label>
              <input type="number" value={formData.maxLoad} onChange={(e) => setFormData({ ...formData, maxLoad: parseInt(e.target.value) })} className="w-full border border-gray-300 rounded-lg px-3 py-2" required />
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
            <button type="submit" className="px-4 py-2 text-sm text-white bg-blue-600 rounded-lg">{mode === 'add' ? 'Add Faculty' : 'Update Faculty'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FacultyModal;
