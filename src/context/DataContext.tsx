import React, { createContext, useContext, ReactNode, useState } from 'react';

// --- NEW, HIERARCHICAL INTERFACES ---

export interface Course {
  id: string;
  code: string;
  name: string;
  credits: number;
  weeklyHours: number;
  type: 'Theory' | 'Lab' | 'Practical';
}

export interface Semester {
  id: string;
  semesterNumber: number;
  courses: Course[];
}

export interface Regulation {
  id: string;
  name: string; // e.g., "R2021", "R2023"
  year: number;
  semesters: Semester[];
}

export interface Batch {
  id: string;
  name: string; // e.g., "CSE-2024-A"
  regulationId: string; // Links to a specific regulation
  studentCount: number;
}

export interface Faculty {
  id: string;
  name: string;
  email: string;
  maxLoad: number;
  // An array of course IDs they can teach from ANY department
  assignedCourses: string[]; 
}

export interface Department {
  id: string;
  name: string;
  code: string;
  head: string;
  regulations: Regulation[];
  batches: Batch[];
  faculty: Faculty[];
}

// Rooms remain global as they are a shared resource
export interface Room {
  id: string;
  name: string;
  type: 'Classroom' | 'Lab' | 'Auditorium' | 'Seminar Hall';
  capacity: number;
  building: string;
  equipment: string[];
}

// For the final generated timetable
export interface TimetableSolution {
  id: number;
  name: string;
  timetable: any; // Can be refined later
  score: number;
}


// --- CONTEXT TYPE DEFINITION ---

interface DataContextType {
  departments: Department[];
  rooms: Room[];
  
  // Department operations
  addDepartment: (department: Omit<Department, 'id' | 'regulations' | 'batches' | 'faculty'>) => void;
  updateDepartment: (id: string, updates: Partial<Omit<Department, 'id'>>) => void;
  deleteDepartment: (id: string) => void;
  
  // Regulation operations
  addRegulationToDepartment: (departmentId: string, regulation: Omit<Regulation, 'id' | 'semesters'>) => void;
  
  // Course operations
  addCourseToRegulation: (departmentId: string, regulationId: string, semesterNumber: number, course: Omit<Course, 'id'>) => void;

  // Batch operations
  addBatchToDepartment: (departmentId: string, batch: Omit<Batch, 'id'>) => void;

  // Faculty operations
  addFacultyToDepartment: (departmentId: string, faculty: Omit<Faculty, 'id'>) => void;

  // Room operations (remain global)
  addRoom: (room: Omit<Room, 'id'>) => void;
  updateRoom: (id: string, updates: Partial<Room>) => void;
  deleteRoom: (id: string) => void;
  
  // Timetable State
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

  // --- RESTRUCTURED STATE MANAGEMENT ---

  const [departments, setDepartments] = useState<Department[]>([
    { 
      id: 'dept-cse', 
      name: 'Computer Science', 
      code: 'CSE', 
      head: 'Dr. Alan Turing',
      regulations: [
        {
          id: 'reg-cse-2021', name: 'R2021', year: 2021,
          semesters: [
            {
              id: 'sem-cse-2021-1', semesterNumber: 1,
              courses: [
                { id: 'cse101', name: 'Programming Fundamentals', code: 'CSE101', credits: 4, weeklyHours: 3, type: 'Theory' },
                { id: 'cse102', name: 'Programming Fundamentals Lab', code: 'CSE102', credits: 2, weeklyHours: 2, type: 'Lab' },
              ]
            },
            {
              id: 'sem-cse-2021-3', semesterNumber: 3,
              courses: [
                { id: 'cse201', name: 'Data Structures', code: 'CSE201', credits: 4, weeklyHours: 3, type: 'Theory' },
                { id: 'cse202', name: 'Database Systems', code: 'CSE202', credits: 4, weeklyHours: 3, type: 'Theory' },
                { id: 'mat201', name: 'Discrete Mathematics', code: 'MAT201', credits: 3, weeklyHours: 3, type: 'Theory' },
              ]
            }
          ]
        }
      ],
      batches: [
        { id: 'batch-cse-2023', name: 'CSE-2023', regulationId: 'reg-cse-2021', studentCount: 60 },
        { id: 'batch-cse-2024', name: 'CSE-2024', regulationId: 'reg-cse-2021', studentCount: 55 },
      ],
      faculty: [
        { id: 'fac-smith', name: 'Dr. Alice Smith', email: 'alice@uni.edu', maxLoad: 18, assignedCourses: ['cse101', 'cse201'] },
        { id: 'fac-bob', name: 'Prof. Bob Builder', email: 'bob@uni.edu', maxLoad: 16, assignedCourses: ['cse102', 'cse202'] },
      ]
    },
    { 
      id: 'dept-ece', 
      name: 'Electronics', 
      code: 'ECE', 
      head: 'Dr. Marie Curie',
      regulations: [],
      batches: [],
      faculty: [
        { id: 'fac-carol', name: 'Dr. Carol Danvers', email: 'carol@uni.edu', maxLoad: 18, assignedCourses: ['mat201'] },
      ]
    },
  ]);
  
  const [rooms, setRooms] = useState<Room[]>([
    { id: 'room-a101', name: 'Room A101', type: 'Classroom', capacity: 65, building: 'Academic Block A', equipment: ['Projector', 'Whiteboard'] },
    { id: 'room-b202', name: 'Room B202', type: 'Classroom', capacity: 60, building: 'Academic Block B', equipment: ['Projector'] },
    { id: 'room-cslab1', name: 'CS Lab 1', type: 'Lab', capacity: 60, building: 'Tech Park', equipment: ['Computers', 'Projector'] },
  ]);

  const [generatedTimetable, setGeneratedTimetable] = useState<TimetableSolution | null>(null);

  // --- UPDATED CRUD FUNCTIONS ---

  const addDepartment = (dept: Omit<Department, 'id' | 'regulations' | 'batches' | 'faculty'>) => {
    const newDepartment: Department = {
      ...dept,
      id: `dept-${Date.now()}`,
      regulations: [],
      batches: [],
      faculty: []
    };
    setDepartments(prev => [...prev, newDepartment]);
  };
  
  const updateDepartment = (id: string, updates: Partial<Omit<Department, 'id'>>) => {
    setDepartments(prev => prev.map(d => d.id === id ? { ...d, ...updates } : d));
  };

  const deleteDepartment = (id: string) => {
    setDepartments(prev => prev.filter(d => d.id !== id));
  };
  
  const addRegulationToDepartment = (departmentId: string, regulation: Omit<Regulation, 'id' | 'semesters'>) => {
    const newRegulation: Regulation = {
      ...regulation,
      id: `reg-${departmentId}-${Date.now()}`,
      semesters: Array.from({ length: 8 }, (_, i) => ({
        id: `sem-${departmentId}-${regulation.name}-${i + 1}`,
        semesterNumber: i + 1,
        courses: []
      }))
    };
    setDepartments(prev => prev.map(dept => 
      dept.id === departmentId 
        ? { ...dept, regulations: [...dept.regulations, newRegulation] } 
        : dept
    ));
  };

  const addCourseToRegulation = (departmentId: string, regulationId: string, semesterNumber: number, course: Omit<Course, 'id'>) => {
    const newCourse: Course = { ...course, id: `course-${Date.now()}` };
    setDepartments(prev => prev.map(dept => {
      if (dept.id === departmentId) {
        return {
          ...dept,
          regulations: dept.regulations.map(reg => {
            if (reg.id === regulationId) {
              return {
                ...reg,
                semesters: reg.semesters.map(sem => {
                  if (sem.semesterNumber === semesterNumber) {
                    return { ...sem, courses: [...sem.courses, newCourse] };
                  }
                  return sem;
                })
              };
            }
            return reg;
          })
        };
      }
      return dept;
    }));
  };
  
  const addBatchToDepartment = (departmentId: string, batch: Omit<Batch, 'id'>) => {
    const newBatch: Batch = { ...batch, id: `batch-${departmentId}-${Date.now()}` };
    setDepartments(prev => prev.map(dept => 
      dept.id === departmentId 
        ? { ...dept, batches: [...dept.batches, newBatch] } 
        : dept
    ));
  };

  const addFacultyToDepartment = (departmentId: string, faculty: Omit<Faculty, 'id'>) => {
    const newFaculty: Faculty = { ...faculty, id: `faculty-${Date.now()}` };
     setDepartments(prev => prev.map(dept => 
      dept.id === departmentId 
        ? { ...dept, faculty: [...dept.faculty, newFaculty] } 
        : dept
    ));
  };

  // Room operations (can remain the same)
  const addRoom = (room: Omit<Room, 'id'>) => {
    const newRoom = { ...room, id: `room-${Date.now()}` };
    setRooms(prev => [...prev, newRoom]);
  };
  const updateRoom = (id: string, updates: Partial<Room>) => {
    setRooms(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r));
  };
  const deleteRoom = (id: string) => {
    setRooms(prev => prev.filter(r => r.id !== id));
  };

  // --- CONTEXT VALUE ---
  const value = {
    departments,
    rooms,
    addDepartment,
    updateDepartment,
    deleteDepartment,
    addRegulationToDepartment,
    addCourseToRegulation,
    addBatchToDepartment,
    addFacultyToDepartment,
    addRoom,
    updateRoom,
    deleteRoom,
    generatedTimetable,
    setGeneratedTimetable
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};