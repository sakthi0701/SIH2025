import React from 'react';
import { Clock, CheckCircle, AlertCircle, Edit, User, HelpCircle, Bell } from 'lucide-react';

// This interface should match the one in NotificationContext.tsx
interface Activity {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  timestamp: Date;
  read: boolean;
}

interface RecentActivityProps {
  activities: Activity[];
}

const RecentActivity: React.FC<RecentActivityProps> = ({ activities }) => {
  const getActivityIcon = (type: Activity['type']) => {
    switch (type) {
      case 'success': return { Icon: CheckCircle, color: 'text-green-600' };
      case 'error': return { Icon: AlertCircle, color: 'text-red-600' };
      case 'warning': return { Icon: AlertCircle, color: 'text-amber-600' };
      case 'info': return { Icon: Bell, color: 'text-blue-600' };
      default: return { Icon: HelpCircle, color: 'text-gray-600' };
    }
  };

  const timeSince = (date: Date) => {
    // Ensure date is a valid Date object before processing
    if (!(date instanceof Date) || isNaN(date.getTime())) {
        return "a few moments ago";
    }
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " minutes ago";
    return Math.floor(seconds) + " seconds ago";
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
        <Clock className="h-5 w-5 text-gray-400" />
      </div>
      
      <div className="space-y-4">
        {activities.length > 0 ? (
            activities.slice(0, 5).map((activity) => { // Show latest 5 activities
            const { Icon, color } = getActivityIcon(activity.type);
            return (
                <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <div className={`mt-1`}>
                    <Icon className={`h-4 w-4 ${color}`} />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800">{activity.title}</p>
                    <p className="text-sm text-gray-600">{activity.message}</p>
                    <p className="text-xs text-gray-500 mt-1">{timeSince(activity.timestamp)}</p>
                </div>
                </div>
            );
            })
        ) : (
            <div className="text-center py-10">
                <p className="text-gray-500">No recent activity.</p>
            </div>
        )}
      </div>
      
      {activities.length > 5 && (
        <button className="w-full mt-4 text-sm text-blue-600 hover:text-blue-800 font-medium">
          View all activity →
        </button>
      )}
    </div>
  );
};

export default RecentActivity;
