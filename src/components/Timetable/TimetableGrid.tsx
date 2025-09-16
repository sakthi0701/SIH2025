import React, { useMemo } from 'react';
import { User, MapPin } from 'lucide-react';

interface TimetableGridProps {
  scheduledClasses: any[];
}

const TimetableGrid: React.FC<TimetableGridProps> = ({ scheduledClasses }) => {
  const settings = JSON.parse(localStorage.getItem('timetable-settings') || '{}');
  const academicSettings = settings.academic || { periods: [] };

  const timeSlots = useMemo(() => academicSettings.periods.map(p => `${p.start}-${p.end}`), [academicSettings]);
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  const gridData = useMemo(() => {
    const grid: { [day: string]: { [slot: string]: any[] } } = {};
    days.forEach(day => {
        grid[day] = {};
        timeSlots.forEach(slot => {
            grid[day][slot] = [];
        });
    });

    scheduledClasses.forEach(c => {
        if (grid[c.day] && grid[c.day][c.slot]) {
            grid[c.day][c.slot].push(c);
        }
    });
    return grid;
  }, [scheduledClasses, timeSlots]);

  const getClassStyle = (type: string = 'theory') => {
    switch (type.toLowerCase()) {
      case 'lab': return 'bg-emerald-50 border-l-4 border-emerald-500 text-emerald-900';
      case 'practical': return 'bg-purple-50 border-l-4 border-purple-500 text-purple-900';
      default: return 'bg-blue-50 border-l-4 border-blue-500 text-blue-900';
    }
  };

  return (
    <div className="p-6">
      <div className="overflow-x-auto">
        <div className="min-w-full">
          <div className={`grid grid-cols-6 gap-px bg-gray-200 rounded-lg overflow-hidden`}>
            <div className="bg-gray-100 p-4 font-semibold text-gray-900">Time</div>
            {days.map((day) => (
              <div key={day} className="bg-gray-100 p-4 font-semibold text-gray-900 text-center">{day}</div>
            ))}

            {timeSlots.map((timeSlot) => (
              <React.Fragment key={timeSlot}>
                <div className="bg-white p-4 border-r border-gray-200 font-medium text-gray-700 text-sm">{timeSlot}</div>
                {days.map((day) => (
                  <div key={`${day}-${timeSlot}`} className="bg-white p-2 min-h-[120px] space-y-1">
                    {gridData[day]?.[timeSlot]?.map((classData: any, index: number) => (
                      <div key={index} className={`p-2 rounded-lg h-full ${getClassStyle(classData.course?.type)} cursor-pointer hover:shadow-md transition-shadow`}>
                        <div className="font-semibold text-sm mb-1 truncate">{classData.course?.name}</div>
                        <div className="flex items-center text-xs mb-1 truncate"><User className="h-3 w-3 mr-1" /><span>{classData.faculty?.name}</span></div>
                        <div className="flex items-center text-xs mb-1 truncate"><MapPin className="h-3 w-3 mr-1" /><span>{classData.room?.name}</span></div>
                        <div className="text-xs opacity-75 truncate">{classData.batch?.name}</div>
                      </div>
                    ))}
                  </div>
                ))}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimetableGrid;