import React from 'react';
import { BarChart3 } from 'lucide-react';

const UtilizationChart: React.FC = () => {
  const data = [
    { day: 'Mon', usage: 85, capacity: 100 },
    { day: 'Tue', usage: 78, capacity: 100 },
    { day: 'Wed', usage: 92, capacity: 100 },
    { day: 'Thu', usage: 88, capacity: 100 },
    { day: 'Fri', usage: 76, capacity: 100 },
    { day: 'Sat', usage: 45, capacity: 100 }
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Weekly Room Utilization</h3>
        <BarChart3 className="h-5 w-5 text-gray-400" />
      </div>
      
      <div className="space-y-4">
        {data.map((item, index) => (
          <div key={index} className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-600 w-10">{item.day}</span>
            <div className="flex-1 mx-4">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${item.usage}%` }}
                ></div>
              </div>
            </div>
            <span className="text-sm font-semibold text-gray-900 w-12 text-right">
              {item.usage}%
            </span>
          </div>
        ))}
      </div>
      
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <div className="flex justify-between items-center">
          <span className="text-sm text-blue-700">Average Utilization</span>
          <span className="text-lg font-bold text-blue-900">77.3%</span>
        </div>
        <p className="text-xs text-blue-600 mt-1">Target: 85% | Room for improvement</p>
      </div>
    </div>
  );
};

export default UtilizationChart;