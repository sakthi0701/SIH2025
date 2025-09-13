import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Clock, MapPin, User } from 'lucide-react';

interface TimetableCalendarProps {
  filters: {
    department: string;
    batch: string;
    faculty: string;
    room: string;
    course: string;
  };
}

const TimetableCalendar: React.FC<TimetableCalendarProps> = ({ filters }) => {
  const [currentWeek, setCurrentWeek] = useState(new Date());

  // Sample events for the week
  const events = [
    {
      id: 1,
      title: 'Data Structures',
      startTime: '9:00',
      endTime: '10:00',
      day: 1, // Monday
      faculty: 'Dr. Smith',
      room: 'A101',
      batch: 'CSE-2024-A',
      type: 'theory'
    },
    {
      id: 2,
      title: 'Programming Lab',
      startTime: '14:00',
      endTime: '16:00',
      day: 1, // Monday
      faculty: 'Dr. Smith',
      room: 'Lab1',
      batch: 'CSE-2024-A',
      type: 'lab'
    },
    {
      id: 3,
      title: 'Mathematics',
      startTime: '10:00',
      endTime: '11:00',
      day: 2, // Tuesday
      faculty: 'Dr. Wilson',
      room: 'B201',
      batch: 'CSE-2024-B',
      type: 'theory'
    }
  ];

  const getWeekDays = (date: Date) => {
    const week = [];
    const startOfWeek = new Date(date);
    startOfWeek.setDate(date.getDate() - date.getDay() + 1); // Start from Monday

    for (let i = 0; i < 5; i++) { // Mon to Fri
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      week.push(day);
    }
    return week;
  };

  const weekDays = getWeekDays(currentWeek);

  const getEventStyle = (type: string) => {
    switch (type) {
      case 'theory':
        return 'bg-blue-100 border-blue-300 text-blue-900';
      case 'lab':
        return 'bg-emerald-100 border-emerald-300 text-emerald-900';
      case 'seminar':
        return 'bg-purple-100 border-purple-300 text-purple-900';
      default:
        return 'bg-gray-100 border-gray-300 text-gray-900';
    }
  };

  const timeSlots = [];
  for (let hour = 9; hour <= 17; hour++) {
    timeSlots.push(`${hour}:00`);
  }

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentWeek);
    newDate.setDate(currentWeek.getDate() + (direction === 'next' ? 7 : -7));
    setCurrentWeek(newDate);
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigateWeek('prev')}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ChevronLeft className="h-5 w-5 text-gray-600" />
          </button>
          <h2 className="text-xl font-semibold text-gray-900">
            Week of {weekDays[0].toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} - {weekDays[4].toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </h2>
          <button
            onClick={() => navigateWeek('next')}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ChevronRight className="h-5 w-5 text-gray-600" />
          </button>
        </div>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
          Today
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        {/* Day Headers */}
        <div className="grid grid-cols-6 border-b border-gray-200">
          <div className="p-4 bg-gray-50 font-medium text-gray-700 text-sm">Time</div>
          {weekDays.map((day, index) => (
            <div key={index} className="p-4 bg-gray-50 text-center">
              <div className="font-medium text-gray-900">
                {day.toLocaleDateString('en-US', { weekday: 'long' })}
              </div>
              <div className="text-sm text-gray-500">
                {day.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </div>
            </div>
          ))}
        </div>

        {/* Time Slots */}
        <div className="relative">
          {timeSlots.map((time, timeIndex) => (
            <div key={time} className="grid grid-cols-6 border-b border-gray-100 min-h-[60px]">
              <div className="p-4 bg-gray-50 border-r border-gray-200 text-sm font-medium text-gray-700">
                {time}
              </div>
              {weekDays.map((day, dayIndex) => (
                <div key={`${time}-${dayIndex}`} className="p-2 border-r border-gray-100 relative">
                  {events
                    .filter(event => event.day === dayIndex + 1 && event.startTime.startsWith(time.split(':')[0]))
                    .map(event => (
                      <div
                        key={event.id}
                        className={`p-2 rounded border-l-4 mb-1 cursor-pointer hover:shadow-md transition-shadow ${getEventStyle(event.type)}`}
                      >
                        <div className="font-medium text-sm">{event.title}</div>
                        <div className="flex items-center text-xs mt-1">
                          <Clock className="h-3 w-3 mr-1" />
                          <span>{event.startTime}-{event.endTime}</span>
                        </div>
                        <div className="flex items-center text-xs">
                          <User className="h-3 w-3 mr-1" />
                          <span className="truncate">{event.faculty}</span>
                        </div>
                        <div className="flex items-center text-xs">
                          <MapPin className="h-3 w-3 mr-1" />
                          <span>{event.room}</span>
                        </div>
                      </div>
                    ))
                  }
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Week Summary */}
      <div className="mt-6 bg-gray-50 rounded-lg p-4">
        <h3 className="font-medium text-gray-900 mb-2">Week Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Total Classes:</span>
            <span className="font-medium text-gray-900 ml-2">18</span>
          </div>
          <div>
            <span className="text-gray-600">Theory Sessions:</span>
            <span className="font-medium text-gray-900 ml-2">12</span>
          </div>
          <div>
            <span className="text-gray-600">Lab Sessions:</span>
            <span className="font-medium text-gray-900 ml-2">6</span>
          </div>
          <div>
            <span className="text-gray-600">Utilization:</span>
            <span className="font-medium text-gray-900 ml-2">72%</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimetableCalendar;