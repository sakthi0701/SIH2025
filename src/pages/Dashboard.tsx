// src/pages/Dashboard.tsx

import React, { useMemo } from 'react';
import {
  Users,
  MapPin,
  BookOpen,
  AlertCircle,
  CheckCircle,
  Building
} from 'lucide-react';
import KPICard from '../components/Dashboard/KPICard';
import QuickActions from '../components/Dashboard/QuickActions';
import UtilizationChart from '../components/Dashboard/UtilizationChart';
import RecentActivity from '../components/Dashboard/RecentActivity';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';

const Dashboard: React.FC = () => {
  const { departments, rooms, generatedTimetable } = useData();
  const { users } = useAuth();
  const { notifications } = useNotifications();

  // Calculate KPIs dynamically
  const kpiData = useMemo(() => {
    const totalStudents = departments.flatMap(d => d.batches).reduce((sum, b) => sum + b.studentCount, 0);
    const totalFaculty = departments.flatMap(d => d.faculty).length;
    const totalCourses = departments.flatMap(d => d.regulations).flatMap(r => r.semesters).flatMap(s => s.courses).length;

    return [
      {
        title: 'Total Students',
        value: totalStudents.toLocaleString(),
        change: '',
        changeType: 'neutral' as const,
        icon: Users,
        color: 'blue'
      },
      {
        title: 'Active Faculty',
        value: totalFaculty.toLocaleString(),
        change: '',
        changeType: 'neutral' as const,
        icon: Users,
        color: 'emerald'
      },
      {
        title: 'Total Departments',
        value: departments.length.toLocaleString(),
        change: '',
        changeType: 'neutral' as const,
        icon: Building,
        color: 'purple'
      },
      {
        title: 'Total Courses',
        value: totalCourses.toLocaleString(),
        change: '',
        changeType: 'neutral' as const,
        icon: BookOpen,
        color: 'amber'
      }
    ];
  }, [departments]);

  // Calculate System Health metrics
  const systemHealthData = useMemo(() => {
    const conflicts = generatedTimetable?.conflicts?.length ?? 0;
    // NOTE: Real utilization and load would require a more complex calculation based on the generated timetable.
    // These are placeholders for demonstration.
    const roomUtilization = generatedTimetable ? '78%' : 'N/A';
    const facultyLoad = generatedTimetable ? '82%' : 'N/A';

    return [
      {
        title: 'Room Utilization',
        value: roomUtilization,
        target: '85%',
        icon: MapPin,
        color: 'bg-blue-500'
      },
      {
        title: 'Faculty Load',
        value: facultyLoad,
        target: '90%',
        icon: Users,
        color: 'bg-emerald-500'
      },
      {
        title: 'Schedule Conflicts',
        value: conflicts.toString(),
        target: '0',
        icon: AlertCircle,
        color: conflicts > 0 ? 'bg-red-500' : 'bg-green-500'
      }
    ];
  }, [generatedTimetable]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Overview of your timetable management system</p>
        </div>
        <div className="flex items-center space-x-2 bg-green-50 px-4 py-2 rounded-lg border border-green-200">
          <CheckCircle className="h-5 w-5 text-green-600" />
          <span className="text-sm font-medium text-green-700">System Status: Active</span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiData.map((kpi, index) => (
          <KPICard key={index} {...kpi} />
        ))}
      </div>

      {/* Quick Actions & Utilization */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <QuickActions />
        </div>
        <div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">System Health</h3>
            <div className="space-y-4">
              {systemHealthData.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${item.color}`}>
                      <item.icon className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-sm font-medium text-gray-700">{item.title}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900">{item.value}</p>
                    <p className="text-xs text-gray-500">Target: {item.target}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Charts and Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <UtilizationChart />
        {/* Pass real notification data to RecentActivity */}
        <RecentActivity activities={notifications} />
      </div>
    </div>
  );
};

export default Dashboard;