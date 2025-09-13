import React, { useState } from 'react';
import { Calendar, Grid, Filter, Download, Eye, Users, MapPin, Clock } from 'lucide-react';
import TimetableGrid from '../components/Timetable/TimetableGrid';
import TimetableCalendar from '../components/Timetable/TimetableCalendar';
import FilterPanel from '../components/Timetable/FilterPanel';

const TimetableViewer: React.FC = () => {
  const [viewMode, setViewMode] = useState<'grid' | 'calendar'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    department: '',
    batch: '',
    faculty: '',
    room: '',
    course: ''
  });

  const stats = [
    { label: 'Total Classes', value: '156', icon: Users, color: 'text-blue-600' },
    { label: 'Rooms Utilized', value: '42/45', icon: MapPin, color: 'text-emerald-600' },
    { label: 'Active Faculty', value: '78', icon: Users, color: 'text-purple-600' },
    { label: 'Weekly Hours', value: '1,248', icon: Clock, color: 'text-amber-600' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Timetable Viewer</h1>
          <p className="text-gray-600 mt-1">Browse and analyze your current schedules</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                viewMode === 'grid'
                  ? 'bg-white text-gray-900 shadow'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Grid className="h-4 w-4 mr-2" />
              Grid View
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                viewMode === 'calendar'
                  ? 'bg-white text-gray-900 shadow'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Calendar className="h-4 w-4 mr-2" />
              Calendar View
            </button>
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </button>
          <button className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
            <Download className="h-4 w-4 mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <stat.icon className={`h-8 w-8 ${stat.color}`} />
            </div>
          </div>
        ))}
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <FilterPanel
          filters={filters}
          onFiltersChange={setFilters}
          onClose={() => setShowFilters(false)}
        />
      )}

      {/* Timetable Content */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        {viewMode === 'grid' ? (
          <TimetableGrid filters={filters} />
        ) : (
          <TimetableCalendar filters={filters} />
        )}
      </div>

      {/* Legend */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h3 className="text-sm font-medium text-gray-900 mb-3">Legend</h3>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-blue-100 border-l-4 border-blue-500 rounded"></div>
            <span className="text-sm text-gray-600">Theory Classes</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-emerald-100 border-l-4 border-emerald-500 rounded"></div>
            <span className="text-sm text-gray-600">Lab Sessions</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-purple-100 border-l-4 border-purple-500 rounded"></div>
            <span className="text-sm text-gray-600">Seminars</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-red-100 border-l-4 border-red-500 rounded"></div>
            <span className="text-sm text-gray-600">Conflicts</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimetableViewer;