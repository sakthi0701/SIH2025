import React from 'react';
import { 
  Users, 
  Calendar, 
  MapPin, 
  BookOpen, 
  TrendingUp, 
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react';
import KPICard from '../components/Dashboard/KPICard';
import QuickActions from '../components/Dashboard/QuickActions';
import UtilizationChart from '../components/Dashboard/UtilizationChart';
import RecentActivity from '../components/Dashboard/RecentActivity';

const Dashboard: React.FC = () => {
  const kpiData = [
    {
      title: 'Total Students',
      value: '2,486',
      change: '+12%',
      changeType: 'positive' as const,
      icon: Users,
      color: 'blue'
    },
    {
      title: 'Active Faculty',
      value: '187',
      change: '+3%',
      changeType: 'positive' as const,
      icon: Users,
      color: 'emerald'
    },
    {
      title: 'Rooms Available',
      value: '45',
      change: '0%',
      changeType: 'neutral' as const,
      icon: MapPin,
      color: 'purple'
    },
    {
      title: 'Courses Scheduled',
      value: '156',
      change: '+8%',
      changeType: 'positive' as const,
      icon: BookOpen,
      color: 'amber'
    }
  ];

  const utilizationData = [
    {
      title: 'Room Utilization',
      value: '78%',
      target: '85%',
      icon: MapPin,
      color: 'bg-blue-500'
    },
    {
      title: 'Faculty Load',
      value: '82%',
      target: '90%',
      icon: Users,
      color: 'bg-emerald-500'
    },
    {
      title: 'Schedule Conflicts',
      value: '3',
      target: '0',
      icon: AlertCircle,
      color: 'bg-red-500'
    }
  ];

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
              {utilizationData.map((item, index) => (
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
        <RecentActivity />
      </div>
    </div>
  );
};

export default Dashboard;