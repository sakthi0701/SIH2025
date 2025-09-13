import React from 'react';
import { Clock, MapPin, User, BookOpen } from 'lucide-react';

interface TimetableGridProps {
  filters: {
    department: string;
    batch: string;
    faculty: string;
    room: string;
    course: string;
  };
}

const TimetableGrid: React.FC<TimetableGridProps> = ({ filters }) => {
  const timeSlots = [
    '9:00-10:00',
    '10:00-11:00',
    '11:00-12:00',
    '12:00-13:00',
    '14:00-15:00',
    '15:00-16:00',
    '16:00-17:00'
  ];

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  // Sample timetable data
  const timetableData = {
    'Monday': {
      '9:00-10:00': { course: 'Data Structures', faculty: 'Dr. Smith', room: 'A101', batch: 'CSE-2024-A', type: 'theory' },
      '10:00-11:00': { course: 'Mathematics', faculty: 'Dr. Wilson', room: 'B201', batch: 'CSE-2024-B', type: 'theory' },
      '11:00-12:00': null,
      '12:00-13:00': null,
      '14:00-15:00': { course: 'Programming Lab', faculty: 'Dr. Smith', room: 'Lab1', batch: 'CSE-2024-A', type: 'lab' },
      '15:00-16:00': { course: 'Programming Lab', faculty: 'Dr. Smith', room: 'Lab1', batch: 'CSE-2024-A', type: 'lab' },
      '16:00-17:00': null
    },
    'Tuesday': {
      '9:00-10:00': { course: 'Physics', faculty: 'Dr. Brown', room: 'C301', batch: 'ECE-2024-A', type: 'theory' },
      '10:00-11:00': { course: 'Electronics', faculty: 'Dr. Johnson', room: 'D401', batch: 'ECE-2024-A', type: 'theory' },
      '11:00-12:00': { course: 'Data Structures', faculty: 'Dr. Smith', room: 'A102', batch: 'CSE-2024-B', type: 'theory' },
      '12:00-13:00': null,
      '14:00-15:00': { course: 'Circuit Lab', faculty: 'Dr. Johnson', room: 'ELab1', batch: 'ECE-2024-A', type: 'lab' },
      '15:00-16:00': { course: 'Circuit Lab', faculty: 'Dr. Johnson', room: 'ELab1', batch: 'ECE-2024-A', type: 'lab' },
      '16:00-17:00': null
    }
    // Add more days and data as needed
  };

  const getClassStyle = (type: string) => {
    switch (type) {
      case 'theory':
        return 'bg-blue-50 border-l-4 border-blue-500 text-blue-900';
      case 'lab':
        return 'bg-emerald-50 border-l-4 border-emerald-500 text-emerald-900';
      case 'seminar':
        return 'bg-purple-50 border-l-4 border-purple-500 text-purple-900';
      default:
        return 'bg-gray-50 border-l-4 border-gray-500 text-gray-900';
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Weekly Timetable Grid</h2>
        <div className="text-sm text-gray-500">
          Academic Year 2024-25 | Semester I
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-full">
          <div className="grid grid-cols-8 gap-px bg-gray-200 rounded-lg overflow-hidden">
            {/* Header */}
            <div className="bg-gray-100 p-4 font-semibold text-gray-900">Time</div>
            {days.map((day) => (
              <div key={day} className="bg-gray-100 p-4 font-semibold text-gray-900 text-center">
                {day}
              </div>
            ))}

            {/* Time slots and classes */}
            {timeSlots.map((timeSlot) => (
              <React.Fragment key={timeSlot}>
                <div className="bg-white p-4 border-r border-gray-200 font-medium text-gray-700 text-sm">
                  {timeSlot}
                </div>
                {days.map((day) => {
                  const classData = timetableData[day as keyof typeof timetableData]?.[timeSlot];
                  return (
                    <div key={`${day}-${timeSlot}`} className="bg-white p-2 min-h-[80px]">
                      {classData ? (
                        <div className={`p-3 rounded-lg h-full ${getClassStyle(classData.type)} cursor-pointer hover:shadow-md transition-shadow`}>
                          <div className="font-semibold text-sm mb-1">{classData.course}</div>
                          <div className="flex items-center text-xs mb-1">
                            <User className="h-3 w-3 mr-1" />
                            <span>{classData.faculty}</span>
                          </div>
                          <div className="flex items-center text-xs mb-1">
                            <MapPin className="h-3 w-3 mr-1" />
                            <span>{classData.room}</span>
                          </div>
                          <div className="text-xs opacity-75">{classData.batch}</div>
                        </div>
                      ) : (
                        <div className="h-full flex items-center justify-center text-gray-400 text-xs">
                          Free
                        </div>
                      )}
                    </div>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Classes Scheduled</span>
            <span className="text-lg font-bold text-gray-900">24</span>
          </div>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Utilization Rate</span>
            <span className="text-lg font-bold text-gray-900">68.6%</span>
          </div>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Free Slots</span>
            <span className="text-lg font-bold text-gray-900">11</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimetableGrid;