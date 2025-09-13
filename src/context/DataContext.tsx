import React, { createContext, useContext, ReactNode, useState } from 'react';

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
  // Initial sample data
  const [departments, setDepartments] = useState<Department[]>([
    { id: '1', name: 'Computer Science', code: 'CSE', head: 'Dr. Smith', facultyCount: 25, studentCount: 300 },
    { id: '2', name: 'Electronics', code: 'ECE', head: 'Dr. Johnson', facultyCount: 20, studentCount: 250 },
    { id: '3', name: 'Mathematics', code: 'MATH', head: 'Dr. Wilson', facultyCount: 15, studentCount: 200 },
    { id: '4', name: 'Physics', code: 'PHY', head: 'Dr. Brown', facultyCount: 12, studentCount: 180 },
    { id: '5', name: 'Chemistry', code: 'CHEM', head: 'Dr. Davis', facultyCount: 10, studentCount: 150 }
  ]);

  const [courses, setCourses] = useState<Course[]>([
    { id: '1', code: 'CSE101', name: 'Programming Fundamentals', department: 'Computer Science', credits: 4, type: 'Theory', duration: 60, weeklyHours: 3 },
    { id: '2', code: 'CSE102', name: 'Data Structures', department: 'Computer Science', credits: 4, type: 'Theory', duration: 60, weeklyHours: 3 },
    { id: '3', code: 'CSE103', name: 'Programming Lab', department: 'Computer Science', credits: 2, type: 'Lab', duration: 120, weeklyHours: 2 },
    { id: '4', code: 'ECE101', name: 'Circuit Theory', department: 'Electronics', credits: 3, type: 'Theory', duration: 60, weeklyHours: 3 },
    { id: '5', code: 'MATH101', name: 'Calculus I', department: 'Mathematics', credits: 4, type: 'Theory', duration: 60, weeklyHours: 4 }
  ]);

  const [faculty, setFaculty] = useState<Faculty[]>([
    { id: '1', name: 'Dr. Alice Smith', email: 'alice@uni.edu', department: 'Computer Science', maxLoad: 18, courses: ['CSE101', 'CSE102'], availability: ['Mon-Fri 9-17'], preferences: ['Morning slots'] },
    { id: '2', name: 'Prof. Bob Johnson', email: 'bob@uni.edu', department: 'Electronics', maxLoad: 16, courses: ['ECE101'], availability: ['Mon-Fri 10-16'], preferences: ['Afternoon slots'] },
    { id: '3', name: 'Dr. Carol Wilson', email: 'carol@uni.edu', department: 'Mathematics', maxLoad: 20, courses: ['MATH101'], availability: ['Mon-Fri 9-18'], preferences: ['Morning slots'] },
    { id: '4', name: 'Dr. David Brown', email: 'david@uni.edu', department: 'Physics', maxLoad: 15, courses: [], availability: ['Mon-Fri 9-17'], preferences: ['No preference'] },
    { id: '5', name: 'Dr. Eva Davis', email: 'eva@uni.edu', department: 'Chemistry', maxLoad: 14, courses: [], availability: ['Mon-Fri 10-16'], preferences: ['Afternoon slots'] }
  ]);

  const [rooms, setRooms] = useState<Room[]>([
    { id: '1', name: 'Room A101', type: 'Classroom', capacity: 60, building: 'Academic Block A', equipment: ['Projector', 'Whiteboard', 'AC'] },
    { id: '2', name: 'Lab B201', type: 'Lab', capacity: 30, building: 'Academic Block B', equipment: ['Computers', 'Projector', 'AC'] },
    { id: '3', name: 'Auditorium', type: 'Auditorium', capacity: 200, building: 'Main Building', equipment: ['Projector', 'Sound System', 'AC'] },
    { id: '4', name: 'Room C301', type: 'Classroom', capacity: 40, building: 'Academic Block C', equipment: ['Projector', 'Whiteboard'] },
    { id: '5', name: 'Physics Lab', type: 'Lab', capacity: 25, building: 'Science Block', equipment: ['Equipment Sets', 'Whiteboard'] }
  ]);

  const [batches, setBatches] = useState<Batch[]>([
    { id: '1', name: 'CSE-2024-A', program: 'B.Tech Computer Science', year: 1, department: 'Computer Science', studentCount: 50 },
    { id: '2', name: 'CSE-2024-B', program: 'B.Tech Computer Science', year: 1, department: 'Computer Science', studentCount: 48 },
    { id: '3', name: 'ECE-2024-A', program: 'B.Tech Electronics', year: 1, department: 'Electronics', studentCount: 45 },
    { id: '4', name: 'CSE-2023-A', program: 'B.Tech Computer Science', year: 2, department: 'Computer Science', studentCount: 52 },
    { id: '5', name: 'MATH-2024', program: 'B.Sc Mathematics', year: 1, department: 'Mathematics', studentCount: 35 }
  ]);

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
    deleteBatch
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};