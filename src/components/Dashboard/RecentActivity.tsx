import React from 'react';
import { Clock, CheckCircle, AlertCircle, Edit, User } from 'lucide-react';

const RecentActivity: React.FC = () => {
  const activities = [
    {
      id: 1,
      type: 'approval',
      message: 'Computer Science timetable approved by Dr. Smith',
      time: '2 hours ago',
      icon: CheckCircle,
      color: 'text-green-600'
    },
    {
      id: 2,
      type: 'edit',
      message: 'Manual edit: Room change for Advanced Mathematics',
      time: '4 hours ago',
      icon: Edit,
      color: 'text-blue-600'
    },
    {
      id: 3,
      type: 'conflict',
      message: 'Scheduling conflict detected in Physics lab',
      time: '6 hours ago',
      icon: AlertCircle,
      color: 'text-red-600'
    },
    {
      id: 4,
      type: 'user',
      message: 'New faculty member added: Prof. Johnson',
      time: '1 day ago',
      icon: User,
      color: 'text-purple-600'
    },
    {
      id: 5,
      type: 'approval',
      message: 'Mathematics department schedule published',
      time: '2 days ago',
      icon: CheckCircle,
      color: 'text-green-600'
    }
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
        <Clock className="h-5 w-5 text-gray-400" />
      </div>
      
      <div className="space-y-4">
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
            <div className={`p-1 rounded-full ${activity.color}`}>
              <activity.icon className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-900">{activity.message}</p>
              <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
            </div>
          </div>
        ))}
      </div>
      
      <button className="w-full mt-4 text-sm text-blue-600 hover:text-blue-800 font-medium">
        View all activity →
      </button>
    </div>
  );
};

export default RecentActivity;