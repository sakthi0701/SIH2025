import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// --- Supabase Client Setup ---
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey);

// --- INTERFACES (No changes needed) ---
export interface Course { id: string; code: string; name: string; credits: number; weeklyHours: number; type: 'Theory' | 'Lab' | 'Practical'; }
export interface Semester { id: string; semesterNumber: number; courses: Course[]; }
export interface Regulation { id: string; name: string; year: number; semesters: Semester[]; }
export interface Batch { id: string; name: string; regulationId: string; studentCount: number; }
export interface Faculty { id: string; name: string; email: string; maxLoad: number; assignedCourses: string[]; }
export interface Department { id: string; name: string; code: string; head: string; regulations: Regulation[]; batches: Batch[]; faculty: Faculty[]; }
export interface Room { id: string; name: string; type: 'Classroom' | 'Lab' | 'Auditorium' | 'Seminar Hall'; capacity: number; building: string; equipment: string[]; }
export interface TimetableSolution { id: number; name: string; timetable: any; score: number; }

// --- CONTEXT TYPE (Updated for async operations) ---
interface DataContextType {
  departments: Department[];
  rooms: Room[];
  loading: boolean;
  addDepartment: (department: Omit<Department, 'id' | 'regulations' | 'batches' | 'faculty'>) => Promise<void>;
  updateDepartment: (id: string, updates: Partial<Omit<Department, 'id'>>) => Promise<void>;
  deleteDepartment: (id: string) => Promise<void>;
  addRegulationToDepartment: (departmentId: string, regulation: Omit<Regulation, 'id' | 'semesters'>) => Promise<void>;
  addCourseToRegulation: (departmentId: string, regulationId: string, semesterNumber: number, course: Omit<Course, 'id'>) => Promise<void>;
  addBatchToDepartment: (departmentId: string, batch: Omit<Batch, 'id'>) => Promise<void>;
  addFacultyToDepartment: (departmentId: string, faculty: Omit<Faculty, 'id'>) => Promise<void>;
  addRoom: (room: Omit<Room, 'id'>) => Promise<void>;
  updateRoom: (id: string, updates: Partial<Room>) => Promise<void>;
  deleteRoom: (id: string) => Promise<void>;
  generatedTimetable: TimetableSolution | null;
  setGeneratedTimetable: (timetable: TimetableSolution | null) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) throw new Error('useData must be used within a DataProvider');
  return context;
};

export const DataProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [generatedTimetable, setGeneratedTimetable] = useState<TimetableSolution | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const { data: departmentsData, error: deptError } = await supabase.from('departments').select('*');
      const { data: roomsData, error: roomError } = await supabase.from('rooms').select('*');

      if (deptError) console.error('Error fetching departments:', deptError);
      else setDepartments(departmentsData || []);

      if (roomError) console.error('Error fetching rooms:', roomError);
      else setRooms(roomsData || []);
      
      setLoading(false);
    };
    fetchData();
  }, []);

  const addDepartment = async (dept: Omit<Department, 'id' | 'regulations' | 'batches' | 'faculty'>) => {
    const newDepartment = { ...dept, id: `dept-${Date.now()}`, regulations: [], batches: [], faculty: [] };
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

  const addRegulationToDepartment = async (departmentId: string, regulation: Omit<Regulation, 'id' | 'semesters'>) => {
    const department = departments.find(d => d.id === departmentId);
    if (!department) return;
    const newRegulation: Regulation = { ...regulation, id: `reg-${departmentId}-${Date.now()}`,
      semesters: Array.from({ length: 8 }, (_, i) => ({ id: `sem-${departmentId}-${regulation.name}-${i + 1}`, semesterNumber: i + 1, courses: [] }))
    };
    const updatedRegulations = [...department.regulations, newRegulation];
    await updateDepartment(departmentId, { regulations: updatedRegulations });
  };
  
  const addCourseToRegulation = async (departmentId: string, regulationId: string, semesterNumber: number, course: Omit<Course, 'id'>) => {
    const department = departments.find(d => d.id === departmentId);
    if (!department) return;
    const newCourse: Course = { ...course, id: `course-${Date.now()}` };
    const updatedRegulations = department.regulations.map(reg => {
        if (reg.id === regulationId) {
            const updatedSemesters = reg.semesters.map(sem => {
                if (sem.semesterNumber === semesterNumber) {
                    return { ...sem, courses: [...sem.courses, newCourse] };
                }
                return sem;
            });
            return { ...reg, semesters: updatedSemesters };
        }
        return reg;
    });
    await updateDepartment(departmentId, { regulations: updatedRegulations });
  };

  const addBatchToDepartment = async (departmentId: string, batch: Omit<Batch, 'id'>) => {
    const department = departments.find(d => d.id === departmentId);
    if (!department) return;
    const newBatch: Batch = { ...batch, id: `batch-${departmentId}-${Date.now()}` };
    const updatedBatches = [...department.batches, newBatch];
    await updateDepartment(departmentId, { batches: updatedBatches });
  };
  
  const addFacultyToDepartment = async (departmentId: string, faculty: Omit<Faculty, 'id'>) => {
    const department = departments.find(d => d.id === departmentId);
    if (!department) return;
    const newFaculty: Faculty = { ...faculty, id: `faculty-${Date.now()}` };
    const updatedFaculty = [...department.faculty, newFaculty];
    await updateDepartment(departmentId, { faculty: updatedFaculty });
  };

  const addRoom = async (room: Omit<Room, 'id'>) => {
    const newRoom = { ...room, id: `room-${Date.now()}` };
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

  const value = {
    departments, rooms, loading, addDepartment, updateDepartment, deleteDepartment,
    addRegulationToDepartment, addCourseToRegulation, addBatchToDepartment,
    addFacultyToDepartment, addRoom, updateRoom, deleteRoom,
    generatedTimetable, setGeneratedTimetable
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};