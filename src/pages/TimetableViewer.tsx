import React, { useState, useMemo } from 'react';
import { Calendar, Grid, Filter, Download, Users, MapPin, Clock } from 'lucide-react';
import TimetableGrid from '../components/Timetable/TimetableGrid';
import TimetableCalendar from '../components/Timetable/TimetableCalendar';
import { useData } from '../context/DataContext';

// --- Main Page Component ---

const TimetableViewer: React.FC = () => {
  const { departments, generatedTimetable } = useData();
  const [viewMode, setViewMode] = useState<'grid' | 'calendar'>('grid');
  const [showFilters, setShowFilters] = useState(true); // Default to show filters
  const [filters, setFilters] = useState({
    departmentId: '',
    batchId: '',
  });

  // Create a flattened list of all batches for the filter dropdown
  const allBatches = useMemo(() => departments.flatMap(d => d.batches.map(b => ({ ...b, departmentName: d.name }))), [departments]);

  // Filter the timetable data based on user selections
  const filteredTimetable = useMemo(() => {
    if (!generatedTimetable?.timetable) return null;
    if (!filters.departmentId && !filters.batchId) return generatedTimetable.timetable;

    const newTimetable = JSON.parse(JSON.stringify(generatedTimetable.timetable)); // Deep copy

    for (const day in newTimetable) {
      for (const slot in newTimetable[day]) {
        newTimetable[day][slot] = newTimetable[day][slot].filter((scheduledClass: any) => {
          const departmentMatch = !filters.departmentId || scheduledClass.department.id === filters.departmentId;
          const batchMatch = !filters.batchId || scheduledClass.batch.id === filters.batchId;
          return departmentMatch && batchMatch;
        });
      }
    }
    return newTimetable;
  }, [generatedTimetable, filters]);

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
            <button onClick={() => setViewMode('grid')} className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${viewMode === 'grid' ? 'bg-white text-gray-900 shadow' : 'text-gray-600 hover:text-gray-900'}`}><Grid className="h-4 w-4 mr-2" />Grid View</button>
            <button onClick={() => setViewMode('calendar')} className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${viewMode === 'calendar' ? 'bg-white text-gray-900 shadow' : 'text-gray-600 hover:text-gray-900'}`}><Calendar className="h-4 w-4 mr-2" />Calendar View</button>
          </div>
          <button onClick={() => setShowFilters(!showFilters)} className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"><Filter className="h-4 w-4 mr-2" />Filters</button>
          <button className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"><Download className="h-4 w-4 mr-2" />Export</button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg border border-gray-200 p-4"><div className="flex items-center justify-between"><div><p className="text-sm font-medium text-gray-600">{stat.label}</p><p className="text-2xl font-bold text-gray-900">{stat.value}</p></div><stat.icon className={`h-8 w-8 ${stat.color}`} /></div></div>
        ))}
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Department</label>
              <select value={filters.departmentId} onChange={(e) => setFilters({ ...filters, departmentId: e.target.value, batchId: '' })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
                <option value="">All Departments</option>
                {departments.map(dept => <option key={dept.id} value={dept.id}>{dept.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Batch</label>
              <select value={filters.batchId} onChange={(e) => setFilters({ ...filters, batchId: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" disabled={!filters.departmentId}>
                <option value="">All Batches in Department</option>
                {allBatches.filter(b => b.departmentName === departments.find(d => d.id === filters.departmentId)?.name).map(batch => <option key={batch.id} value={batch.id}>{batch.name}</option>)}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Timetable Content */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        {!generatedTimetable ? (
            <div className="text-center p-12 text-gray-500">
                <h3 className="text-lg font-semibold">No Timetable Generated</h3>
                <p>Please run the optimizer to generate a new schedule.</p>
            </div>
        ) : viewMode === 'grid' ? (
          <TimetableGrid filteredTimetable={filteredTimetable} />
        ) : (
          <TimetableCalendar filteredTimetable={filteredTimetable} />
        )}
      </div>
    </div>
  );
};

export default TimetableViewer;