import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Database, 
  Settings, 
  Play, 
  Calendar,
  Edit3,
  CheckCircle,
  BarChart3,
  Users,
  Sliders,
  GraduationCap,
} from 'lucide-react';

interface SidebarProps {
  collapsed: boolean;
}

const navItems = [
  { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
  // ---- CHANGE: Revert to a single "Data Manager" link ----
  { path: '/data-manager', icon: Database, label: 'Data Manager' },
  // ----------------------------------------------------
  { path: '/constraints', icon: Sliders, label: 'Constraints' },
  { path: '/optimizer', icon: Play, label: 'Optimizer' },
  { path: '/timetable', icon: Calendar, label: 'Timetable View' },
  { path: '/editor', icon: Edit3, label: 'Editor' },
  { path: '/approval', icon: CheckCircle, label: 'Approvals' },
  { path: '/reports', icon: BarChart3, label: 'Reports' },
  { path: '/users', icon: Users, label: 'Users' },
  { path: '/settings', icon: Settings, label: 'Settings' },
];

const Sidebar: React.FC<SidebarProps> = ({ collapsed }) => {
  const location = useLocation();

  return (
    <aside 
      className={`fixed left-0 top-0 h-full bg-white border-r border-gray-200 transition-all duration-300 z-40 ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      <div className="flex items-center justify-center h-16 border-b border-gray-200 bg-blue-600">
        <div className="flex items-center space-x-3">
          <GraduationCap className="h-8 w-8 text-white" />
          {!collapsed && (
            <span className="text-xl font-bold text-white">Scheduleit.ai</span>
          )}
        </div>
      </div>
      
      <nav className="mt-6">
        <div className="px-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname.startsWith(item.path) && item.path !== '/' || location.pathname === item.path;
            
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon className={`h-5 w-5 ${collapsed ? 'mx-auto' : 'mr-3'}`} />
                {!collapsed && <span>{item.label}</span>}
              </NavLink>
            );
          })}
        </div>
      </nav>
    </aside>
  );
};

export default Sidebar;