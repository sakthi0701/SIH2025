import React, { createContext, useContext, useState, ReactNode } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  department?: string;
  status: 'active' | 'inactive' | 'suspended';
  lastLogin?: string;
  permissions?: string[];
}

interface AuthContextType {
  user: User | null;
  users: User[];
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  
  // User management operations
  addUser: (user: Omit<User, 'id'>) => void;
  updateUser: (id: string, updates: Partial<User>) => void;
  deleteUser: (id: string) => void;
  getUserById: (id: string) => User | undefined;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>({
    id: '1',
    name: 'Dr. Selvi',
    email: 'admin@university.edu',
    role: 'Super Admin',
    department: 'Administration',
    status: 'active',
    lastLogin: '2024-01-15 09:30',
    permissions: ['all']
  });

  const [users, setUsers] = useState<User[]>([
    {
      id: '1',
      name: 'Dr. Selvi',
      email: 'Selvi.admin@university.edu',
      role: 'Super Admin',
      department: 'Administration',
      status: 'active',
      lastLogin: '2024-01-15 09:30',
      permissions: ['all']
    },
    {
      id: '2',
      name: 'Dr. John Smith',
      email: 'john.smith@university.edu',
      role: 'Department Admin',
      department: 'Computer Science',
      status: 'active',
      lastLogin: '2024-01-15 08:45',
      permissions: ['manage_department', 'approve_timetables']
    },
    {
      id: '3',
      name: 'Prof. Alice Johnson',
      email: 'alice.johnson@university.edu',
      role: 'Faculty',
      department: 'Electronics',
      status: 'active',
      lastLogin: '2024-01-14 14:20',
      permissions: ['view_schedule', 'set_preferences']
    },
    {
      id: '4',
      name: 'Dr. Bob Wilson',
      email: 'bob.wilson@university.edu',
      role: 'Timetable Admin',
      department: 'Administration',
      status: 'active',
      lastLogin: '2024-01-15 10:15',
      permissions: ['create_timetables', 'run_optimizer', 'manual_edit']
    },
    {
      id: '5',
      name: 'Ms. Carol Brown',
      email: 'carol.brown@university.edu',
      role: 'Student',
      department: 'Computer Science',
      status: 'active',
      lastLogin: '2024-01-15 12:00',
      permissions: ['view_schedule']
    }
  ]);

  const login = async (email: string, password: string) => {
    // Simulate API call
    const foundUser = users.find(u => u.email === email);
    if (foundUser) {
      setUser(foundUser);
    } else {
      throw new Error('Invalid credentials');
    }
  };

  const logout = () => {
    setUser(null);
  };

  const addUser = (userData: Omit<User, 'id'>) => {
    const newUser = { 
      ...userData, 
      id: Date.now().toString(),
      lastLogin: new Date().toISOString().slice(0, 16).replace('T', ' ')
    };
    setUsers(prev => [...prev, newUser]);
  };

  const updateUser = (id: string, updates: Partial<User>) => {
    setUsers(prev => prev.map(user => user.id === id ? { ...user, ...updates } : user));
    // Update current user if it's the same user being updated
    if (user && user.id === id) {
      setUser(prev => prev ? { ...prev, ...updates } : null);
    }
  };

  const deleteUser = (id: string) => {
    setUsers(prev => prev.filter(user => user.id !== id));
    // Logout if current user is being deleted
    if (user && user.id === id) {
      setUser(null);
    }
  };

  const getUserById = (id: string) => {
    return users.find(user => user.id === id);
  };

  const value = {
    user,
    users,
    login,
    logout,
    isAuthenticated: !!user,
    addUser,
    updateUser,
    deleteUser,
    getUserById
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};