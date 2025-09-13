import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Layout/Sidebar';
import Header from './components/Layout/Header';
import Dashboard from './pages/Dashboard';
// ---- CHANGE: Import new Department pages ----
import DepartmentsPage from './pages/DepartmentsPage';
import DepartmentDetailPage from './pages/DepartmentDetailPage';
// ---- CHANGE: Remove old DataManager import ----
// import DataManager from './pages/DataManager'; 
import ConstraintsBuilder from './pages/ConstraintsBuilder';
import OptimizerRunner from './pages/OptimizerRunner';
import TimetableViewer from './pages/TimetableViewer';
import TimetableEditor from './pages/TimetableEditor';
import ApprovalWorkflow from './pages/ApprovalWorkflow';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import UserManagement from './pages/UserManagement';
import { AuthProvider } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import { NotificationProvider } from './context/NotificationContext';

function App() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <AuthProvider>
      <DataProvider>
        <NotificationProvider>
          <Router>
            <div className="flex h-screen bg-gray-50">
              <Sidebar collapsed={sidebarCollapsed} />
              <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarCollapsed ? 'ml-16' : 'ml-64'}`}>
                <Header 
                  sidebarCollapsed={sidebarCollapsed}
                  setSidebarCollapsed={setSidebarCollapsed}
                />
                <main className="flex-1 overflow-auto p-6">
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    {/* ---- CHANGE: Update routes for Departments ---- */}
                    <Route path="/departments" element={<DepartmentsPage />} />
                    <Route path="/departments/:id" element={<DepartmentDetailPage />} />
                    {/* <Route path="/data" element={<DataManager />} /> */} {/* <-- Remove this line */}
                    {/* ------------------------------------------- */}
                    <Route path="/constraints" element={<ConstraintsBuilder />} />
                    <Route path="/optimizer" element={<OptimizerRunner />} />
                    <Route path="/timetable" element={<TimetableViewer />} />
                    <Route path="/editor" element={<TimetableEditor />} />
                    <Route path="/approval" element={<ApprovalWorkflow />} />
                    <Route path="/reports" element={<Reports />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="/users" element={<UserManagement />} />
                  </Routes>
                </main>
              </div>
            </div>
          </Router>
        </NotificationProvider>
      </DataProvider>
    </AuthProvider>
  );
}

export default App;