import React from 'react';
import { Play, Upload, FileText, Settings, Calendar, Download } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const QuickActions: React.FC = () => {
  const navigate = useNavigate();

  const actions = [
    {
      title: 'Generate Timetable',
      description: 'Create optimized schedule',
      icon: Play,
      color: 'bg-blue-500 hover:bg-blue-600',
      onClick: () => navigate('/optimizer')
    },
    {
      title: 'Import Data',
      description: 'Upload CSV/Excel files',
      icon: Upload,
      color: 'bg-emerald-500 hover:bg-emerald-600',
      onClick: () => navigate('/data')
    },
    {
      title: 'View Timetable',
      description: 'Browse current schedules',
      icon: Calendar,
      color: 'bg-purple-500 hover:bg-purple-600',
      onClick: () => navigate('/timetable')
    },
    {
      title: 'Export Reports',
      description: 'Download analytics',
      icon: Download,
      color: 'bg-amber-500 hover:bg-amber-600',
      onClick: () => navigate('/reports')
    },
    {
      title: 'Manage Constraints',
      description: 'Configure rules',
      icon: Settings,
      color: 'bg-red-500 hover:bg-red-600',
      onClick: () => navigate('/constraints')
    },
    {
      title: 'Generate Report',
      description: 'Create detailed analysis',
      icon: FileText,
      color: 'bg-indigo-500 hover:bg-indigo-600',
      onClick: () => navigate('/reports')
    }
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {actions.map((action, index) => (
          <button
            key={index}
            onClick={action.onClick}
            className={`${action.color} text-white p-4 rounded-lg text-left hover:shadow-lg transition-all duration-200 transform hover:scale-105`}
          >
            <action.icon className="h-6 w-6 mb-2" />
            <h4 className="font-semibold text-sm">{action.title}</h4>
            <p className="text-xs opacity-90 mt-1">{action.description}</p>
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuickActions;