import React, { useState, useEffect } from 'react';
import { X, Save, Users } from 'lucide-react';
import { useData, Faculty } from '../../context/DataContext';

interface FacultyAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  batchId: string;
  courseId: string;
  departmentId: string;
}

const FacultyAssignmentModal: React.FC<FacultyAssignmentModalProps> = ({
  isOpen,
  onClose,
  batchId,
  courseId,
  departmentId
}) => {
  const { departments, courses, updateBatchCourseAssignments } = useData();
  const [selectedFacultyIds, setSelectedFacultyIds] = useState<string[]>([]);
  const [showAllDepartments, setShowAllDepartments] = useState(false);

  const department = departments.find(d => d.id === departmentId);
  const batch = department?.batches.find(b => b.id === batchId);
  const course = courses.find(c => c.id === courseId);
  const courseHomeDepartment = departments.find(d =>
    d.regulations.some(r =>
      r.semesters.some(s =>
        s.courses.some(c => c.id === courseId)
      )
    )
  );

  // Get available faculty
  const availableFaculty = React.useMemo(() => {
    let faculty: Faculty[] = [];

    if (showAllDepartments) {
      // Show faculty from all departments
      faculty = departments.flatMap(d => d.faculty);
    } else {
      // Show faculty from batch's department
      faculty = department?.faculty || [];

      // If course is from different department, automatically include its faculty
      if (courseHomeDepartment && courseHomeDepartment.id !== departmentId) {
        faculty = [...faculty, ...courseHomeDepartment.faculty];
      }
    }

    // Filter faculty who can teach this course
    return faculty.filter(f => f.assignedCourses.includes(courseId));
  }, [showAllDepartments, department, courseHomeDepartment, departmentId, courseId, departments]);

  useEffect(() => {
    if (batch && course) {
      const existingAssignment = batch.courseAssignments?.find(ca => ca.courseId === courseId);
      setSelectedFacultyIds(existingAssignment?.facultyIds || []);
    }
  }, [batch, course, courseId]);

  if (!isOpen || !batch || !course) return null;

  const handleFacultyToggle = (facultyId: string) => {
    setSelectedFacultyIds(prev =>
      prev.includes(facultyId)
        ? prev.filter(id => id !== facultyId)
        : [...prev, facultyId]
    );
  };

  const handleSave = async () => {
    if (!batch) return;

    const updatedAssignments = batch.courseAssignments?.filter(ca => ca.courseId !== courseId) || [];
    if (selectedFacultyIds.length > 0) {
      updatedAssignments.push({ courseId, facultyIds: selectedFacultyIds });
    }

    await updateBatchCourseAssignments(departmentId, batchId, updatedAssignments);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full mx-4 sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Assign Faculty</h3>
              <p className="text-sm text-gray-600">{course.name} - {batch.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6">
          {/* Cross-departmental toggle */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={showAllDepartments}
                onChange={(e) => setShowAllDepartments(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="text-sm font-medium text-gray-700">
                Show faculty from other departments
              </span>
            </label>
            <p className="text-xs text-gray-500 mt-1">
              Enable this to assign faculty from any department to this course
            </p>
          </div>

          {/* Faculty list */}
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900">Available Faculty ({availableFaculty.length})</h4>
            {availableFaculty.length > 0 ? (
              <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-lg">
                {availableFaculty.map(faculty => {
                  const facultyDepartment = departments.find(d => d.faculty.some(f => f.id === faculty.id));
                  return (
                    <label key={faculty.id} className="flex items-center space-x-3 p-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0">
                      <input
                        type="checkbox"
                        checked={selectedFacultyIds.includes(faculty.id)}
                        onChange={() => handleFacultyToggle(faculty.id)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{faculty.name}</div>
                        <div className="text-sm text-gray-500">
                          {faculty.email} • {facultyDepartment?.name}
                        </div>
                        <div className="text-xs text-gray-400">
                          Max Load: {faculty.maxLoad} hrs/week
                        </div>
                      </div>
                    </label>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No qualified faculty found for this course</p>
                <p className="text-sm">Try enabling "Show faculty from other departments"</p>
              </div>
            )}
          </div>

          {/* Selected count */}
          {selectedFacultyIds.length > 0 && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                {selectedFacultyIds.length} faculty member(s) selected
              </p>
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Save className="h-4 w-4 mr-2" />
            Save Assignment
          </button>
        </div>
      </div>
    </div>
  );
};

export default FacultyAssignmentModal;