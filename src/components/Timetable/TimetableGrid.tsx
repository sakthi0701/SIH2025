import React from 'react';
import { Clock, MapPin, User, BookOpen } from 'lucide-react';
import { useData } from '../../context/DataContext';

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
  // ---- CHANGE: GET DATA FROM CONTEXT ----
  const { generatedTimetable } = useData();
  // --------------------------------------

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
  
  // ---- CHANGE: USE GENERATED DATA ----
  const timetableData = generatedTimetable ? generatedTimetable.timetable : {};
  // ------------------------------------

  const getClassStyle = (type: string = 'theory') => {
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
          <div className="grid grid-cols-6 gap-px bg-gray-200 rounded-lg overflow-hidden">
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
                  const classesInSlot = timetableData[day]?.[timeSlot] || [];
                  return (
                    <div key={`${day}-${timeSlot}`} className="bg-white p-2 min-h-[120px] space-y-1">
                      {classesInSlot.length > 0 ? (
                        classesInSlot.map((classData: any, index: number) => (
                          <div key={index} className={`p-2 rounded-lg h-full ${getClassStyle(classData.course?.type)} cursor-pointer hover:shadow-md transition-shadow`}>
                            <div className="font-semibold text-sm mb-1">{classData.course?.name}</div>
                            <div className="flex items-center text-xs mb-1">
                              <User className="h-3 w-3 mr-1" />
                              <span>{classData.faculty?.name}</span>
                            </div>
                            <div className="flex items-center text-xs mb-1">
                              <MapPin className="h-3 w-3 mr-1" />
                              <span>{classData.room?.name}</span>
                            </div>
                            <div className="text-xs opacity-75">{classData.batch?.name}</div>
                          </div>
                        ))
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
    </div>
  );
};

export default TimetableGrid;