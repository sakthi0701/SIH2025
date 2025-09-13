import React, { createContext, useContext, ReactNode, useState } from 'react';

// --- INTERFACES FOR DATA MODELS ---

interface Department {
  id: string;
  name: string;
  code: string;
  head: string;
  facultyCount: number;
  studentCount: number;
}

interface Course {
  id: string;
  code: string;
  name: string;
  department: string;
  credits: number;
  type: 'Theory' | 'Lab' | 'Practical';
  duration: number;
  weeklyHours: number;
}

interface Faculty {
  id: string;
  name: string;
  email: string;
  department: string;
  maxLoad: number;
  courses: string[];
  availability: string[];
  preferences: string[];
}

interface Room {
  id: string;
  name: string;
  type: 'Classroom' | 'Lab' | 'Auditorium' | 'Seminar Hall';
  capacity: number;
  building: string;
  equipment: string[];
}

interface Batch {
  id: string;
  name: string;
  program: string;
  year: number;
  department: string;
  studentCount: number;
}

// Interface for the final generated timetable
interface TimetableSolution {
  id: number;
  name: string;
  timetable: any; // Can be refined to a specific Timetable type later
  score: number;
}


// --- CONTEXT TYPE DEFINITION ---

interface DataContextType {
  departments: Department[];
  courses: Course[];
  faculty: Faculty[];
  rooms: Room[];
  batches: Batch[];
  
  // Department operations
  addDepartment: (department: Omit<Department, 'id'>) => void;
  updateDepartment: (id: string, updates: Partial<Department>) => void;
  deleteDepartment: (id: string) => void;
  
  // Course operations
  addCourse: (course: Omit<Course, 'id'>) => void;
  updateCourse: (id: string, updates: Partial<Course>) => void;
  deleteCourse: (id: string) => void;
  
  // Faculty operations
  addFaculty: (faculty: Omit<Faculty, 'id'>) => void;
  updateFaculty: (id: string, updates: Partial<Faculty>) => void;
  deleteFaculty: (id: string) => void;
  
  // Room operations
  addRoom: (room: Omit<Room, 'id'>) => void;
  updateRoom: (id: string, updates: Partial<Room>) => void;
  deleteRoom: (id: string) => void;
  
  // Batch operations
  addBatch: (batch: Omit<Batch, 'id'>) => void;
  updateBatch: (id: string, updates: Partial<Batch>) => void;
  deleteBatch: (id: string) => void;

  // Generated Timetable State
  generatedTimetable: TimetableSolution | null;
  setGeneratedTimetable: (timetable: TimetableSolution | null) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

interface DataProviderProps {
  children: ReactNode;
}

export const DataProvider: React.FC<DataProviderProps> = ({ children }) => {
  // --- STATE MANAGEMENT FOR ALL DATA ---

  const [departments, setDepartments] = useState<Department[]>([
    { id: '1', name: 'Computer Science', code: 'CSE', head: 'Dr. Smith', facultyCount: 25, studentCount: 300 },
    { id: '2', name: 'Electronics', code: 'ECE', head: 'Dr. Johnson', facultyCount: 20, studentCount: 250 },
  ]);

  const [courses, setCourses] = useState<Course[]>([
    { id: '1', code: 'CSE101', name: 'Programming Fundamentals', department: 'Computer Science', credits: 4, type: 'Theory', duration: 60, weeklyHours: 3 },
    { id: '2', code: 'CSE102', name: 'Data Structures', department: 'Computer Science', credits: 4, type: 'Theory', duration: 60, weeklyHours: 3 },
  ]);

  const [faculty, setFaculty] = useState<Faculty[]>([
    { id: '1', name: 'Dr. Alice Smith', email: 'alice@uni.edu', department: 'Computer Science', maxLoad: 18, courses: ['CSE101', 'CSE102'], availability: ['Mon-Fri 9-17'], preferences: ['Morning slots'] },
  ]);

  const [rooms, setRooms] = useState<Room[]>([
    { id: '1', name: 'Room A101', type: 'Classroom', capacity: 60, building: 'Academic Block A', equipment: ['Projector', 'Whiteboard', 'AC'] },
  ]);

  const [batches, setBatches] = useState<Batch[]>([
    { id: '1', name: 'CSE-2024-A', program: 'B.Tech Computer Science', year: 1, department: 'Computer Science', studentCount: 50 },
  ]);

  const [generatedTimetable, setGeneratedTimetable] = useState<TimetableSolution | null>(null);

  // --- CRUD FUNCTIONS ---

  // Department operations
  const addDepartment = (department: Omit<Department, 'id'>) => {
    const newDepartment = { ...department, id: Date.now().toString() };
    setDepartments(prev => [...prev, newDepartment]);
  };
  const updateDepartment = (id: string, updates: Partial<Department>) => {
    setDepartments(prev => prev.map(dept => dept.id === id ? { ...dept, ...updates } : dept));
  };
  const deleteDepartment = (id: string) => {
    setDepartments(prev => prev.filter(dept => dept.id !== id));
  };

  // Course operations
  const addCourse = (course: Omit<Course, 'id'>) => {
    const newCourse = { ...course, id: Date.now().toString() };
    setCourses(prev => [...prev, newCourse]);
  };
  const updateCourse = (id: string, updates: Partial<Course>) => {
    setCourses(prev => prev.map(course => course.id === id ? { ...course, ...updates } : course));
  };
  const deleteCourse = (id: string) => {
    setCourses(prev => prev.filter(course => course.id !== id));
  };

  // Faculty operations
  const addFaculty = (facultyMember: Omit<Faculty, 'id'>) => {
    const newFaculty = { ...facultyMember, id: Date.now().toString() };
    setFaculty(prev => [...prev, newFaculty]);
  };
  const updateFaculty = (id: string, updates: Partial<Faculty>) => {
    setFaculty(prev => prev.map(fac => fac.id === id ? { ...fac, ...updates } : fac));
  };
  const deleteFaculty = (id: string) => {
    setFaculty(prev => prev.filter(fac => fac.id !== id));
  };

  // Room operations
  const addRoom = (room: Omit<Room, 'id'>) => {
    const newRoom = { ...room, id: Date.now().toString() };
    setRooms(prev => [...prev, newRoom]);
  };
  const updateRoom = (id: string, updates: Partial<Room>) => {
    setRooms(prev => prev.map(room => room.id === id ? { ...room, ...updates } : room));
  };
  const deleteRoom = (id: string) => {
    setRooms(prev => prev.filter(room => room.id !== id));
  };

  // Batch operations
  const addBatch = (batch: Omit<Batch, 'id'>) => {
    const newBatch = { ...batch, id: Date.now().toString() };
    setBatches(prev => [...prev, newBatch]);
  };
  const updateBatch = (id: string, updates: Partial<Batch>) => {
    setBatches(prev => prev.map(batch => batch.id === id ? { ...batch, ...updates } : batch));
  };
  const deleteBatch = (id: string) => {
    setBatches(prev => prev.filter(batch => batch.id !== id));
  };

  // --- CONTEXT VALUE ---
  const value = {
    departments,
    courses,
    faculty,
    rooms,
    batches,
    addDepartment,
    updateDepartment,
    deleteDepartment,
    addCourse,
    updateCourse,
    deleteCourse,
    addFaculty,
    updateFaculty,
    deleteFaculty,
    addRoom,
    updateRoom,
    deleteRoom,
    addBatch,
    updateBatch,
    deleteBatch,
    generatedTimetable,
    setGeneratedTimetable
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};

