import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Layout/Sidebar';
import Header from './components/Layout/Header';
import Dashboard from './pages/Dashboard';
// ---- CHANGE: We will create this new page in the next step ----
import DataManagerPage from './pages/DataManagerPage'; 
import DepartmentDetailPage from './pages/DepartmentDetailPage';
import RegulationDetailPage from './pages/RegulationDetailPage';
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
                    
                    {/* ---- CHANGE: Update routes for the new Data Manager ---- */}
                    <Route path="/data-manager" element={<DataManagerPage />} />
                    <Route path="/departments/:id" element={<DepartmentDetailPage />} />
                    <Route path="/departments/:deptId/regulations/:regId" element={<RegulationDetailPage />} />
                    {/* Redirect old /data route to the new one */}
                    <Route path="/data" element={<Navigate to="/data-manager" replace />} />
                    {/* -------------------------------------------------------- */}
                    
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