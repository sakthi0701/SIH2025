// src/pages/TimetableViewer.tsx

import React, { useState, useMemo } from 'react';
import { Calendar, Grid, Filter, Download, Users, MapPin, Clock } from 'lucide-react';
import TimetableGrid from '../components/Timetable/TimetableGrid';
import TimetableCalendar from '../components/Timetable/TimetableCalendar';
import { useData } from '../context/DataContext';

const TimetableViewer: React.FC = () => {
  const { departments, generatedTimetable } = useData();
  const [viewMode, setViewMode] = useState<'grid' | 'calendar'>('grid');
  const [showFilters, setShowFilters] = useState(true);
  const [filters, setFilters] = useState({
    departmentId: departments.length > 0 ? departments[0].id : '',
    batchId: '',
  });

  const allBatches = useMemo(() => departments.flatMap(d => d.batches.map(b => ({ ...b, departmentId: d.id, departmentName: d.name }))), [departments]);

  const filteredTimetableData = useMemo(() => {
    if (!generatedTimetable?.timetable) return null;

    const timetable = generatedTimetable.timetable;
    let allScheduledClasses: any[] = [];
    for (const day in timetable) {
        for (const slot in timetable[day]) {
            allScheduledClasses.push(...timetable[day][slot]);
        }
    }

    if (!filters.departmentId && !filters.batchId) return allScheduledClasses;

    return allScheduledClasses.filter(scheduledClass => {
        const departmentMatch = !filters.departmentId || scheduledClass.department.id === filters.departmentId;
        const batchMatch = !filters.batchId || scheduledClass.batch.id === filters.batchId;
        return departmentMatch && batchMatch;
    });
  }, [generatedTimetable, filters]);
  
  const stats = useMemo(() => {
    if (!filteredTimetableData) {
        return [
            { label: 'Total Classes', value: '0', icon: Users, color: 'text-blue-600' },
            { label: 'Rooms Utilized', value: '0/0', icon: MapPin, color: 'text-emerald-600' },
            { label: 'Active Faculty', value: '0', icon: Users, color: 'text-purple-600' },
            { label: 'Weekly Hours', value: '0', icon: Clock, color: 'text-amber-600' }
        ];
    }
    
    const totalClasses = filteredTimetableData.length;
    const rooms = new Set(filteredTimetableData.map(c => c.room.id));
    const faculty = new Set(filteredTimetableData.map(c => c.faculty.id));
    const weeklyHours = filteredTimetableData.reduce((acc, c) => acc + 1, 0); // Each class is 1 hour
    const totalRooms = departments.flatMap(d => d.faculty).length;


    return [
        { label: 'Total Classes', value: totalClasses, icon: Users, color: 'text-blue-600' },
        { label: 'Rooms Utilized', value: `${rooms.size}/${totalRooms}`, icon: MapPin, color: 'text-emerald-600' },
        { label: 'Active Faculty', value: faculty.size, icon: Users, color: 'text-purple-600' },
        { label: 'Weekly Hours', value: weeklyHours, icon: Clock, color: 'text-amber-600' }
    ];
  }, [filteredTimetableData, departments]);

  return (
    <div className="space-y-6">
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

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg border border-gray-200 p-4"><div className="flex items-center justify-between"><div><p className="text-sm font-medium text-gray-600">{stat.label}</p><p className="text-2xl font-bold text-gray-900">{stat.value}</p></div><stat.icon className={`h-8 w-8 ${stat.color}`} /></div></div>
        ))}
      </div>

      {showFilters && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Department</label>
              <select value={filters.departmentId} onChange={(e) => setFilters({ departmentId: e.target.value, batchId: '' })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
                {departments.map(dept => <option key={dept.id} value={dept.id}>{dept.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Batch</label>
              <select value={filters.batchId} onChange={(e) => setFilters({ ...filters, batchId: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" disabled={!filters.departmentId}>
                <option value="">All Batches in Department</option>
                {allBatches.filter(b => b.departmentId === filters.departmentId).map(batch => <option key={batch.id} value={batch.id}>{batch.name}</option>)}
              </select>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-x-auto">
        {!filteredTimetableData ? (
            <div className="text-center p-12 text-gray-500">
                <h3 className="text-lg font-semibold">No Timetable Generated</h3>
                <p>Please run the optimizer to generate a new schedule.</p>
            </div>
        ) : viewMode === 'grid' ? (
          <TimetableGrid scheduledClasses={filteredTimetableData} />
        ) : (
          <TimetableCalendar scheduledClasses={filteredTimetableData} />
        )}
      </div>
    </div>
  );
};

export default TimetableViewer;