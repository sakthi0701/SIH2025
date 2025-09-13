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
  // These flattened arrays now include parent context for easy editing
  courses: (Course & { departmentId: string; regulationId: string; department: string; })[];
  faculty: (Faculty & { departmentId: string; department: string; })[];
  rooms: Room[];
  batches: (Batch & { departmentId: string; department: string; })[];
  constraints: Constraint[];
  loading: boolean;
  
  // Department Functions
  addDepartment: (department: Omit<Department, 'id' | 'regulations' | 'batches' | 'faculty'>) => Promise<void>;
  updateDepartment: (id: string, updates: Partial<Omit<Department, 'id'>>) => Promise<void>;
  deleteDepartment: (id: string) => Promise<void>;

  // Regulation Functions
  addRegulationToDepartment: (departmentId: string, regulation: Omit<Regulation, 'id' | 'semesters'>) => Promise<void>;
  updateRegulationInDepartment: (departmentId: string, regulationId: string, updates: Partial<Omit<Regulation, 'id'>>) => Promise<void>;
  deleteRegulationFromDepartment: (departmentId: string, regulationId: string) => Promise<void>;

  // Course Functions (require full context)
  addCourseToRegulation: (departmentId: string, regulationId: string, semesterNumber: number, course: Omit<Course, 'id'>) => Promise<void>;
  updateCourseInRegulation: (departmentId: string, regulationId: string, courseId: string, updates: Partial<Omit<Course, 'id'>>) => Promise<void>;
  deleteCourseFromRegulation: (departmentId: string, regulationId: string, courseId: string) => Promise<void>;

  // Batch Functions (require full context)
  addBatchToDepartment: (departmentId: string, batch: Omit<Batch, 'id'>) => Promise<void>;
  updateBatchInDepartment: (departmentId: string, batchId: string, updates: Partial<Omit<Batch, 'id'>>) => Promise<void>;
  deleteBatchFromDepartment: (departmentId: string, batchId: string) => Promise<void>;

  // Faculty Functions (require full context)
  addFacultyToDepartment: (departmentId: string, faculty: Omit<Faculty, 'id'>) => Promise<void>;
  updateFacultyInDepartment: (departmentId: string, facultyId: string, updates: Partial<Omit<Faculty, 'id'>>) => Promise<void>;
  deleteFacultyFromDepartment: (departmentId: string, facultyId: string) => Promise<void>;

  // Room Functions
  addRoom: (room: Omit<Room, 'id'>) => Promise<void>;
  updateRoom: (id: string, updates: Partial<Room>) => Promise<void>;
  deleteRoom: (id: string) => Promise<void>;

  // Constraint Functions
  addConstraint: (constraint: Omit<Constraint, 'id'>) => Promise<void>;
  updateConstraint: (id: string, updates: Partial<Constraint>) => Promise<void>;
  deleteConstraint: (id: string) => Promise<void>;
  
  // Timetable State
  generatedTimetable: TimetableSolution | null;
  setGeneratedTimetable: (timetable: TimetableSolution | null) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);
export const useData = () => { const context = useContext(DataContext); if (!context) throw new Error('useData must be used within a DataProvider'); return context; };

export const DataProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [courses, setCourses] = useState<(Course & { departmentId: string; regulationId: string; department: string; })[]>([]);
  const [faculty, setFaculty] = useState<(Faculty & { departmentId: string; department: string; })[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [batches, setBatches] = useState<(Batch & { departmentId: string; department: string; })[]>([]);
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

  // **CRITICAL CHANGE**: This effect runs whenever `departments` data changes.
  // It creates flattened arrays for courses, faculty, and batches.
  // Each item in these new arrays has its parent context (e.g., departmentId) attached.
  useEffect(() => {
    const allCourses = departments.flatMap(dept => 
      dept.regulations.flatMap(reg => 
        reg.semesters.flatMap(sem => 
          sem.courses.map(course => ({ 
            ...course, 
            departmentId: dept.id, 
            regulationId: reg.id,
            department: dept.name // Also add name for easy display
          }))
        )
      )
    );
    const allFaculty = departments.flatMap(dept => 
      dept.faculty.map(f => ({ 
        ...f, 
        departmentId: dept.id,
        department: dept.name
      }))
    );
    const allBatches = departments.flatMap(dept => 
      dept.batches.map(b => ({ 
        ...b, 
        departmentId: dept.id,
        department: dept.name
      }))
    );
    
    setCourses(allCourses);
    setFaculty(allFaculty);
    setBatches(allBatches);
  }, [departments]);

  // --- FULL CRUD FUNCTIONS ---
  // (These functions are now guaranteed to work because the UI will pass the correct IDs)

  const addDepartment = async (dept: Omit<Department, 'id' | 'regulations' | 'batches' | 'faculty'>) => {
    const newDepartment = { ...dept, regulations: [], batches: [], faculty: [] };
    const { data, error } = await supabase.from('departments').insert([newDepartment]).select();
    if (error) { console.error("Error adding department:", error); throw error; }
    else if (data) setDepartments(prev => [...prev, data[0]]);
  };
  const updateDepartment = async (id: string, updates: Partial<Omit<Department, 'id'>>) => {
     const { data, error } = await supabase.from('departments').update(updates).eq('id', id).select();
     if (error) { console.error("Error updating department:", error); throw error; }
     else if (data) setDepartments(prev => prev.map(d => d.id === id ? data[0] : d));
  };
  const deleteDepartment = async (id: string) => {
    const { error } = await supabase.from('departments').delete().eq('id', id);
    if (error) { console.error("Error deleting department:", error); throw error; }
    else setDepartments(prev => prev.filter(d => d.id !== id));
  };

  const addRegulationToDepartment = async (departmentId: string, regulation: Omit<Regulation, 'id' | 'semesters'>) => {
    const department = departments.find(d => d.id === departmentId);
    if (!department) return;
    const newRegulation: Regulation = { ...regulation, id: `reg-${Date.now()}`, semesters: Array.from({ length: 8 }, (_, i) => ({ id: `sem-${Date.now()}-${i}`, semesterNumber: i + 1, courses: [] }))};
    await updateDepartment(departmentId, { regulations: [...department.regulations, newRegulation] });
  };
  
  const updateRegulationInDepartment = async (departmentId: string, regulationId: string, updates: Partial<Omit<Regulation, 'id'>>) => {
    const department = departments.find(d => d.id === departmentId);
    if (!department) return;
    const updatedRegulations = department.regulations.map(reg => reg.id === regulationId ? { ...reg, ...updates } : reg);
    await updateDepartment(departmentId, { regulations: updatedRegulations });
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
  
  const updateFacultyInDepartment = async (departmentId: string, facultyId: string, updates: Partial<Omit<Faculty, 'id'>>) => {
    const department = departments.find(d => d.id === departmentId);
    if (!department) return;
    const updatedFaculty = department.faculty.map(f => f.id === facultyId ? { ...f, ...updates } : f);
    await updateDepartment(departmentId, { faculty: updatedFaculty });
  };
  
  const updateBatchInDepartment = async (departmentId: string, batchId: string, updates: Partial<Omit<Batch, 'id'>>) => {
    const department = departments.find(d => d.id === departmentId);
    if (!department) return;
    const updatedBatches = department.batches.map(b => b.id === batchId ? { ...b, ...updates } : b);
    await updateDepartment(departmentId, { batches: updatedBatches });
  };

  // ... (rest of the add, delete, and other functions remain the same)
  // --- DELETE FUNCTIONS ---
  const deleteRegulationFromDepartment = async (departmentId: string, regulationId: string) => {
    const department = departments.find(d => d.id === departmentId);
    if (!department) return;
    await updateDepartment(departmentId, { regulations: department.regulations.filter(r => r.id !== regulationId) });
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
  const addBatchToDepartment = async (departmentId: string, batch: Omit<Batch, 'id'>) => {
    const department = departments.find(d => d.id === departmentId);
    if (!department) return;
    const newBatch: Batch = { ...batch, id: `batch-${Date.now()}` };
    await updateDepartment(departmentId, { batches: [...department.batches, newBatch] });
  };
  const deleteBatchFromDepartment = async (departmentId: string, batchId: string) => {
    const department = departments.find(d => d.id === departmentId);
    if (!department) return;
    await updateDepartment(departmentId, { batches: department.batches.filter(b => b.id !== batchId) });
  };
  const addFacultyToDepartment = async (departmentId: string, faculty: Omit<Faculty, 'id'>) => {
    const department = departments.find(d => d.id === departmentId);
    if (!department) return;
    const newFaculty: Faculty = { ...faculty, id: `faculty-${Date.now()}` };
    await updateDepartment(departmentId, { faculty: [...department.faculty, newFaculty] });
  };
  const deleteFacultyFromDepartment = async (departmentId: string, facultyId: string) => {
      const department = departments.find(d => d.id === departmentId);
      if (!department) return;
      await updateDepartment(departmentId, { faculty: department.faculty.filter(f => f.id !== facultyId) });
  };
  const addRoom = async (room: Omit<Room, 'id'>) => {
    const { data, error } = await supabase.from('rooms').insert([room]).select();
    if (error) { console.error("Error adding room:", error); throw error; }
    else if (data) setRooms(prev => [...prev, data[0]]);
  };
  const updateRoom = async (id: string, updates: Partial<Room>) => {
    const { data, error } = await supabase.from('rooms').update(updates).eq('id', id).select();
    if (error) { console.error("Error updating room:", error); throw error; }
    else if (data) setRooms(prev => prev.map(r => r.id === id ? data[0] : r));
  };
  const deleteRoom = async (id: string) => {
    const { error } = await supabase.from('rooms').delete().eq('id', id);
    if (error) { console.error("Error deleting room:", error); throw error; }
    else setRooms(prev => prev.filter(r => r.id !== id));
  };
  const addConstraint = async (constraint: Omit<Constraint, 'id'>) => {
    const { data, error } = await supabase.from('constraints').insert([constraint]).select();
    if (error) { console.error("Error adding constraint:", error); throw error; }
    else if (data) setConstraints(prev => [...prev, data[0]]);
  };
  const updateConstraint = async (id: string, updates: Partial<Constraint>) => {
    const { data, error } = await supabase.from('constraints').update(updates).eq('id', id).select();
    if (error) { console.error("Error updating constraint:", error); throw error; }
    else if (data) setConstraints(prev => prev.map(c => c.id === id ? data[0] : c));
  };
  const deleteConstraint = async (id: string) => {
    const { error } = await supabase.from('constraints').delete().eq('id', id);
    if (error) { console.error("Error deleting constraint:", error); throw error; }
    else setConstraints(prev => prev.filter(c => c.id !== id));
  };

  const value = {
    departments, courses, faculty, rooms, batches, constraints, loading,
    addDepartment, updateDepartment, deleteDepartment,
    addRegulationToDepartment, updateRegulationInDepartment, deleteRegulationFromDepartment,
    addCourseToRegulation, updateCourseInRegulation, deleteCourseFromRegulation,
    addBatchToDepartment, updateBatchInDepartment, deleteBatchFromDepartment,
    addFacultyToDepartment, updateFacultyInDepartment, deleteFacultyFromDepartment,
    addRoom, updateRoom, deleteRoom,
    addConstraint, updateConstraint, deleteConstraint,
    generatedTimetable, setGeneratedTimetable
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};