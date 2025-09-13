import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// --- Supabase Client Setup ---
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey);

// --- INTERFACES ---
export interface Course { id: string; code: string; name: string; credits: number; weeklyHours: number; type: 'Theory' | 'Lab' | 'Practical'; }
export interface Semester { id: string; semesterNumber: number; courses: Course[]; }
export interface Regulation { id: string; name: string; year: number; semesters: Semester[]; }
export interface Batch { id: string; name: string; regulationId: string; studentCount: number; }
export interface Faculty { id: string; name: string; email: string; maxLoad: number; assignedCourses: string[]; }
export interface Department { id: string; name: string; code: string; head: string; regulations: Regulation[]; batches: Batch[]; faculty: Faculty[]; }
export interface Room { id: string; name: string; type: 'Classroom' | 'Lab' | 'Auditorium' | 'Seminar Hall'; capacity: number; building: string; equipment: string[]; }
export interface TimetableSolution { id: number; name: string; timetable: any; score: number; }
export interface Constraint { id: string; name: string; type: 'hard' | 'soft'; description: string; priority: number; enabled: boolean; category: string; }

// --- CONTEXT TYPE ---
interface DataContextType {
  departments: Department[];
  courses: Course[];
  faculty: Faculty[];
  rooms: Room[];
  batches: Batch[];
  constraints: Constraint[];
  loading: boolean;
  
  // Department
  addDepartment: (department: Omit<Department, 'id' | 'regulations' | 'batches' | 'faculty'>) => Promise<void>;
  updateDepartment: (id: string, updates: Partial<Omit<Department, 'id'>>) => Promise<void>;
  deleteDepartment: (id: string) => Promise<void>;

  // Regulation
  addRegulationToDepartment: (departmentId: string, regulation: Omit<Regulation, 'id' | 'semesters'>) => Promise<void>;
  updateRegulationInDepartment: (departmentId: string, regulationId: string, updates: Partial<Omit<Regulation, 'id' | 'semesters'>>) => Promise<void>;
  deleteRegulationFromDepartment: (departmentId: string, regulationId: string) => Promise<void>;

  // Course
  addCourse: (course: Omit<Course, 'id'>) => Promise<void>;
  addCourseToRegulation: (departmentId: string, regulationId: string, semesterNumber: number, course: Omit<Course, 'id'>) => Promise<void>;
  updateCourse: (id: string, updates: Partial<Course>) => Promise<void>;
  updateCourseInRegulation: (departmentId: string, regulationId: string, courseId: string, updates: Partial<Omit<Course, 'id'>>) => Promise<void>;
  deleteCourse: (id: string) => Promise<void>;
  deleteCourseFromRegulation: (departmentId: string, regulationId: string, courseId: string) => Promise<void>;

  // Batch
  addBatch: (batch: Omit<Batch, 'id'>) => Promise<void>;
  addBatchToDepartment: (departmentId: string, batch: Omit<Batch, 'id'>) => Promise<void>;
  updateBatch: (id: string, updates: Partial<Batch>) => Promise<void>;
  updateBatchInDepartment: (departmentId: string, batchId: string, updates: Partial<Omit<Batch, 'id'>>) => Promise<void>;
  deleteBatch: (id: string) => Promise<void>;
  deleteBatchFromDepartment: (departmentId: string, batchId: string) => Promise<void>;

  // Faculty
  addFaculty: (faculty: Omit<Faculty, 'id'>) => Promise<void>;
  addFacultyToDepartment: (departmentId: string, faculty: Omit<Faculty, 'id'>) => Promise<void>;
  updateFaculty: (id: string, updates: Partial<Faculty>) => Promise<void>;
  updateFacultyInDepartment: (departmentId: string, facultyId: string, updates: Partial<Omit<Faculty, 'id'>>) => Promise<void>;
  deleteFaculty: (id: string) => Promise<void>;
  deleteFacultyFromDepartment: (departmentId: string, facultyId: string) => Promise<void>;

  // Room
  addRoom: (room: Omit<Room, 'id'>) => Promise<void>;
  updateRoom: (id: string, updates: Partial<Room>) => Promise<void>;
  deleteRoom: (id: string) => Promise<void>;

  // Constraints
  addConstraint: (constraint: Omit<Constraint, 'id'>) => Promise<void>;
  updateConstraint: (id: string, updates: Partial<Constraint>) => Promise<void>;
  deleteConstraint: (id: string) => Promise<void>;
  
  // Timetable
  generatedTimetable: TimetableSolution | null;
  setGeneratedTimetable: (timetable: TimetableSolution | null) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);
export const useData = () => { const context = useContext(DataContext); if (!context) throw new Error('useData must be used within a DataProvider'); return context; };

export const DataProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [faculty, setFaculty] = useState<Faculty[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [constraints, setConstraints] = useState<Constraint[]>([]);
  const [loading, setLoading] = useState(true);
  const [generatedTimetable, setGeneratedTimetable] = useState<TimetableSolution | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const { data: departmentsData, error: deptError } = await supabase.from('departments').select('*');
      const { data: roomsData, error: roomError } = await supabase.from('rooms').select('*');
      const { data: constraintsData, error: constraintError } = await supabase.from('constraints').select('*');
      
      if (deptError) console.error('Error fetching departments:', deptError); else setDepartments(departmentsData || []);
      if (roomError) console.error('Error fetching rooms:', roomError); else setRooms(roomsData || []);
      if (constraintError) console.error('Error fetching constraints:', constraintError); else setConstraints(constraintsData || []);
      
      setLoading(false);
    };
    fetchData();
  }, []);

  useEffect(() => {
    // Derive courses, faculty, and batches from departments
    const allCourses = departments.flatMap(dept => dept.regulations.flatMap(reg => reg.semesters.flatMap(sem => sem.courses)));
    const allFaculty = departments.flatMap(dept => dept.faculty);
    const allBatches = departments.flatMap(dept => dept.batches);
    setCourses(allCourses);
    setFaculty(allFaculty);
    setBatches(allBatches);
  }, [departments]);

  // --- FULL CRUD FUNCTIONS FOR SUPABASE ---

  // Departments
  const addDepartment = async (dept: Omit<Department, 'id' | 'regulations' | 'batches' | 'faculty'>) => {
    const newDepartment = { ...dept, regulations: [], batches: [], faculty: [] };
    const { data, error } = await supabase.from('departments').insert([newDepartment]).select();
    if (error) console.error("Error adding department:", error);
    else if (data) setDepartments(prev => [...prev, data[0]]);
  };
  const updateDepartment = async (id: string, updates: Partial<Omit<Department, 'id'>>) => {
     const { data, error } = await supabase.from('departments').update(updates).eq('id', id).select();
     if (error) console.error("Error updating department:", error);
     else if (data) setDepartments(prev => prev.map(d => d.id === id ? data[0] : d));
  };
  const deleteDepartment = async (id: string) => {
    const { error } = await supabase.from('departments').delete().eq('id', id);
    if (error) console.error("Error deleting department:", error);
    else setDepartments(prev => prev.filter(d => d.id !== id));
  };

  // Regulations
  const addRegulationToDepartment = async (departmentId: string, regulation: Omit<Regulation, 'id' | 'semesters'>) => {
    const department = departments.find(d => d.id === departmentId);
    if (!department) return;
    const newRegulation: Regulation = { ...regulation, id: `reg-${Date.now()}`, semesters: Array.from({ length: 8 }, (_, i) => ({ id: `sem-${Date.now()}-${i}`, semesterNumber: i + 1, courses: [] }))};
    await updateDepartment(departmentId, { regulations: [...department.regulations, newRegulation] });
  };
  const updateRegulationInDepartment = async (departmentId: string, regulationId: string, updates: Partial<Omit<Regulation, 'id' | 'semesters'>>) => {
    const department = departments.find(d => d.id === departmentId);
    if (!department) return;
    const updatedRegulations = department.regulations.map(r => r.id === regulationId ? { ...r, ...updates } : r);
    await updateDepartment(departmentId, { regulations: updatedRegulations });
  };
  const deleteRegulationFromDepartment = async (departmentId: string, regulationId: string) => {
    const department = departments.find(d => d.id === departmentId);
    if (!department) return;
    await updateDepartment(departmentId, { regulations: department.regulations.filter(r => r.id !== regulationId) });
  };

  // Courses
  const addCourse = async (course: Omit<Course, 'id'>) => {
    const newCourse = { ...course };
    // This is a placeholder as courses are nested. You might want a separate 'courses' table.
    console.warn("addCourse is a placeholder. Courses should be added to a regulation within a department.", newCourse);
  };
  const addCourseToRegulation = async (departmentId: string, regulationId: string, semesterNumber: number, course: Omit<Course, 'id'>) => {
    const department = departments.find(d => d.id === departmentId);
    if (!department) return;
    const newCourse: Course = { ...course, id: `course-${Date.now()}` };
    const updatedRegulations = department.regulations.map(reg => {
      if (reg.id === regulationId) {
        reg.semesters = reg.semesters.map(sem => sem.semesterNumber === semesterNumber ? { ...sem, courses: [...sem.courses, newCourse] } : sem);
      }
      return reg;
    });
    await updateDepartment(departmentId, { regulations: updatedRegulations });
  };
  const updateCourse = async (id: string, updates: Partial<Course>) => {
    // This is a placeholder. You'll need to find which department and regulation the course belongs to.
    console.warn("updateCourse is a placeholder. You need to implement the logic to find and update the course within its department/regulation.", id, updates);
  };
  const updateCourseInRegulation = async (departmentId: string, regulationId: string, courseId: string, updates: Partial<Omit<Course, 'id'>>) => {
    const department = departments.find(d => d.id === departmentId);
    if (!department) return;
    const updatedRegulations = department.regulations.map(reg => {
      if (reg.id === regulationId) {
        reg.semesters = reg.semesters.map(sem => ({ ...sem, courses: sem.courses.map(c => c.id === courseId ? { ...c, ...updates } : c) }));
      }
      return reg;
    });
    await updateDepartment(departmentId, { regulations: updatedRegulations });
  };
  const deleteCourse = async (id: string) => {
    // This is a placeholder.
    console.warn("deleteCourse is a placeholder.", id);
  };
  const deleteCourseFromRegulation = async (departmentId: string, regulationId: string, courseId: string) => {
    const department = departments.find(d => d.id === departmentId);
    if (!department) return;
    const updatedRegulations = department.regulations.map(reg => {
      if (reg.id === regulationId) {
        reg.semesters = reg.semesters.map(sem => ({ ...sem, courses: sem.courses.filter(c => c.id !== courseId) }));
      }
      return reg;
    });
    await updateDepartment(departmentId, { regulations: updatedRegulations });
  };
  
  // Batches
  const addBatch = async (batch: Omit<Batch, 'id'>) => {
    console.warn("addBatch is a placeholder.", batch);
  };
  const addBatchToDepartment = async (departmentId: string, batch: Omit<Batch, 'id'>) => {
    const department = departments.find(d => d.id === departmentId);
    if (!department) return;
    const newBatch: Batch = { ...batch, id: `batch-${Date.now()}` };
    await updateDepartment(departmentId, { batches: [...department.batches, newBatch] });
  };
  const updateBatch = async (id: string, updates: Partial<Batch>) => {
    console.warn("updateBatch is a placeholder.", id, updates);
  };
  const updateBatchInDepartment = async (departmentId: string, batchId: string, updates: Partial<Omit<Batch, 'id'>>) => {
    const department = departments.find(d => d.id === departmentId);
    if (!department) return;
    const updatedBatches = department.batches.map(b => b.id === batchId ? { ...b, ...updates } : b);
    await updateDepartment(departmentId, { batches: updatedBatches });
  };
  const deleteBatch = async (id: string) => {
    console.warn("deleteBatch is a placeholder.", id);
  };
  const deleteBatchFromDepartment = async (departmentId: string, batchId: string) => {
    const department = departments.find(d => d.id === departmentId);
    if (!department) return;
    await updateDepartment(departmentId, { batches: department.batches.filter(b => b.id !== batchId) });
  };
  
  // Faculty
  const addFaculty = async (faculty: Omit<Faculty, 'id'>) => {
    console.warn("addFaculty is a placeholder.", faculty);
  };
  const addFacultyToDepartment = async (departmentId: string, faculty: Omit<Faculty, 'id'>) => {
    const department = departments.find(d => d.id === departmentId);
    if (!department) return;
    const newFaculty: Faculty = { ...faculty, id: `faculty-${Date.now()}` };
    await updateDepartment(departmentId, { faculty: [...department.faculty, newFaculty] });
  };
  const updateFaculty = async (id: string, updates: Partial<Faculty>) => {
    console.warn("updateFaculty is a placeholder.", id, updates);
  };
  const updateFacultyInDepartment = async (departmentId: string, facultyId: string, updates: Partial<Omit<Faculty, 'id'>>) => {
    const department = departments.find(d => d.id === departmentId);
    if (!department) return;
    const updatedFaculty = department.faculty.map(f => f.id === facultyId ? { ...f, ...updates } : f);
    await updateDepartment(departmentId, { faculty: updatedFaculty });
  };
  const deleteFaculty = async (id: string) => {
    console.warn("deleteFaculty is a placeholder.", id);
  };
  const deleteFacultyFromDepartment = async (departmentId: string, facultyId: string) => {
      const department = departments.find(d => d.id === departmentId);
      if (!department) return;
      await updateDepartment(departmentId, { faculty: department.faculty.filter(f => f.id !== facultyId) });
  };
  
  // Rooms
  const addRoom = async (room: Omit<Room, 'id'>) => {
    const newRoom = { ...room };
    const { data, error } = await supabase.from('rooms').insert([newRoom]).select();
    if (error) console.error("Error adding room:", error);
    else if (data) setRooms(prev => [...prev, data[0]]);
  };
  const updateRoom = async (id: string, updates: Partial<Room>) => {
    const { data, error } = await supabase.from('rooms').update(updates).eq('id', id).select();
    if (error) console.error("Error updating room:", error);
    else if (data) setRooms(prev => prev.map(r => r.id === id ? data[0] : r));
  };
  const deleteRoom = async (id: string) => {
    const { error } = await supabase.from('rooms').delete().eq('id', id);
    if (error) console.error("Error deleting room:", error);
    else setRooms(prev => prev.filter(r => r.id !== id));
  };
  
  // Constraints
  const addConstraint = async (constraint: Omit<Constraint, 'id'>) => {
    const { data, error } = await supabase.from('constraints').insert([constraint]).select();
    if (error) console.error("Error adding constraint:", error);
    else if (data) setConstraints(prev => [...prev, data[0]]);
  };
  const updateConstraint = async (id: string, updates: Partial<Constraint>) => {
    const { data, error } = await supabase.from('constraints').update(updates).eq('id', id).select();
    if (error) console.error("Error updating constraint:", error);
    else if (data) setConstraints(prev => prev.map(c => c.id === id ? data[0] : c));
  };
  const deleteConstraint = async (id: string) => {
    const { error } = await supabase.from('constraints').delete().eq('id', id);
    if (error) console.error("Error deleting constraint:", error);
    else setConstraints(prev => prev.filter(c => c.id !== id));
  };

  const value = {
    departments, courses, faculty, rooms, batches, constraints, loading,
    addDepartment, updateDepartment, deleteDepartment,
    addRegulationToDepartment, updateRegulationInDepartment, deleteRegulationFromDepartment,
    addCourse, addCourseToRegulation, updateCourse, updateCourseInRegulation, deleteCourse, deleteCourseFromRegulation,
    addBatch, addBatchToDepartment, updateBatch, updateBatchInDepartment, deleteBatch, deleteBatchFromDepartment,
    addFaculty, addFacultyToDepartment, updateFaculty, updateFacultyInDepartment, deleteFaculty, deleteFacultyFromDepartment,
    addRoom, updateRoom, deleteRoom,
    addConstraint, updateConstraint, deleteConstraint,
    generatedTimetable, setGeneratedTimetable
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};