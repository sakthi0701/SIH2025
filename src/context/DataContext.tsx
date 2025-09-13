import React, { createContext, useContext, ReactNode } from 'react';

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
  // Sample data
  const departments: Department[] = [
    { id: '1', name: 'Computer Science', code: 'CSE', head: 'Dr. Smith', facultyCount: 25, studentCount: 300 },
    { id: '2', name: 'Electronics', code: 'ECE', head: 'Dr. Johnson', facultyCount: 20, studentCount: 250 },
    { id: '3', name: 'Mathematics', code: 'MATH', head: 'Dr. Wilson', facultyCount: 15, studentCount: 200 },
    { id: '4', name: 'Physics', code: 'PHY', head: 'Dr. Brown', facultyCount: 12, studentCount: 180 },
    { id: '5', name: 'Chemistry', code: 'CHEM', head: 'Dr. Davis', facultyCount: 10, studentCount: 150 }
  ];

  const courses: Course[] = [
    { id: '1', code: 'CSE101', name: 'Programming Fundamentals', department: 'Computer Science', credits: 4, type: 'Theory', duration: 60, weeklyHours: 3 },
    { id: '2', code: 'CSE102', name: 'Data Structures', department: 'Computer Science', credits: 4, type: 'Theory', duration: 60, weeklyHours: 3 },
    { id: '3', code: 'CSE103', name: 'Programming Lab', department: 'Computer Science', credits: 2, type: 'Lab', duration: 120, weeklyHours: 2 },
    { id: '4', code: 'ECE101', name: 'Circuit Theory', department: 'Electronics', credits: 3, type: 'Theory', duration: 60, weeklyHours: 3 },
    { id: '5', code: 'MATH101', name: 'Calculus I', department: 'Mathematics', credits: 4, type: 'Theory', duration: 60, weeklyHours: 4 }
  ];

  const faculty: Faculty[] = [
    { id: '1', name: 'Dr. Alice Smith', email: 'alice@uni.edu', department: 'Computer Science', maxLoad: 18, courses: ['CSE101', 'CSE102'], availability: ['Mon-Fri 9-17'], preferences: ['Morning slots'] },
    { id: '2', name: 'Prof. Bob Johnson', email: 'bob@uni.edu', department: 'Electronics', maxLoad: 16, courses: ['ECE101'], availability: ['Mon-Fri 10-16'], preferences: ['Afternoon slots'] },
    { id: '3', name: 'Dr. Carol Wilson', email: 'carol@uni.edu', department: 'Mathematics', maxLoad: 20, courses: ['MATH101'], availability: ['Mon-Fri 9-18'], preferences: ['Morning slots'] },
    { id: '4', name: 'Dr. David Brown', email: 'david@uni.edu', department: 'Physics', maxLoad: 15, courses: [], availability: ['Mon-Fri 9-17'], preferences: ['No preference'] },
    { id: '5', name: 'Dr. Eva Davis', email: 'eva@uni.edu', department: 'Chemistry', maxLoad: 14, courses: [], availability: ['Mon-Fri 10-16'], preferences: ['Afternoon slots'] }
  ];

  const rooms: Room[] = [
    { id: '1', name: 'Room A101', type: 'Classroom', capacity: 60, building: 'Academic Block A', equipment: ['Projector', 'Whiteboard', 'AC'] },
    { id: '2', name: 'Lab B201', type: 'Lab', capacity: 30, building: 'Academic Block B', equipment: ['Computers', 'Projector', 'AC'] },
    { id: '3', name: 'Auditorium', type: 'Auditorium', capacity: 200, building: 'Main Building', equipment: ['Projector', 'Sound System', 'AC'] },
    { id: '4', name: 'Room C301', type: 'Classroom', capacity: 40, building: 'Academic Block C', equipment: ['Projector', 'Whiteboard'] },
    { id: '5', name: 'Physics Lab', type: 'Lab', capacity: 25, building: 'Science Block', equipment: ['Equipment Sets', 'Whiteboard'] }
  ];

  const batches: Batch[] = [
    { id: '1', name: 'CSE-2024-A', program: 'B.Tech Computer Science', year: 1, department: 'Computer Science', studentCount: 50 },
    { id: '2', name: 'CSE-2024-B', program: 'B.Tech Computer Science', year: 1, department: 'Computer Science', studentCount: 48 },
    { id: '3', name: 'ECE-2024-A', program: 'B.Tech Electronics', year: 1, department: 'Electronics', studentCount: 45 },
    { id: '4', name: 'CSE-2023-A', program: 'B.Tech Computer Science', year: 2, department: 'Computer Science', studentCount: 52 },
    { id: '5', name: 'MATH-2024', program: 'B.Sc Mathematics', year: 1, department: 'Mathematics', studentCount: 35 }
  ];

  const value = {
    departments,
    courses,
    faculty,
    rooms,
    batches
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};