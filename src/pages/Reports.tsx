import React, { useState } from 'react';
import { Download, Filter, Calendar, BarChart3, PieChart, Users, MapPin } from 'lucide-react';

const Reports: React.FC = () => {
  const [selectedReport, setSelectedReport] = useState('utilization');
  const [dateRange, setDateRange] = useState('current-semester');

  const reports = [
    { id: 'utilization', label: 'Room Utilization', icon: MapPin },
    { id: 'faculty', label: 'Faculty Workload', icon: Users },
    { id: 'conflicts', label: 'Conflict Analysis', icon: BarChart3 },
    { id: 'attendance', label: 'Class Distribution', icon: PieChart }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-600 mt-1">Analyze timetable performance and utilization metrics</p>
        </div>
        <div className="flex space-x-3">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="current-semester">Current Semester</option>
            <option value="last-semester">Last Semester</option>
            <option value="academic-year">Academic Year</option>
          </select>
          <button className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </button>
        </div>
      </div>

      {/* Report Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex space-x-1 border-b border-gray-200 mb-6">
          {reports.map((report) => (
            <button
              key={report.id}
              onClick={() => setSelectedReport(report.id)}
              className={`flex items-center px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
                selectedReport === report.id
                  ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-700'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <report.icon className="h-4 w-4 mr-2" />
              {report.label}
            </button>
          ))}
        </div>

        {/* Room Utilization Report */}
        {selectedReport === 'utilization' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-blue-50 rounded-lg p-6">
                <div className="text-3xl font-bold text-blue-900">78.5%</div>
                <div className="text-sm text-blue-700">Average Utilization</div>
                <div className="text-xs text-blue-600 mt-1">+5.2% from last semester</div>
              </div>
              <div className="bg-emerald-50 rounded-lg p-6">
                <div className="text-3xl font-bold text-emerald-900">42</div>
                <div className="text-sm text-emerald-700">Active Rooms</div>
                <div className="text-xs text-emerald-600 mt-1">out of 45 total</div>
              </div>
              <div className="bg-amber-50 rounded-lg p-6">
                <div className="text-3xl font-bold text-amber-900">156</div>
                <div className="text-sm text-amber-700">Peak Hour Classes</div>
                <div className="text-xs text-amber-600 mt-1">10:00 AM - 11:00 AM</div>
              </div>
            </div>

            {/* Utilization Chart */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Weekly Room Utilization</h3>
              <div className="space-y-4">
                {[
                  { room: 'A101', util: 85, type: 'Classroom' },
                  { room: 'Lab1', util: 92, type: 'Laboratory' },
                  { room: 'B201', util: 76, type: 'Classroom' },
                  { room: 'Audit', util: 45, type: 'Auditorium' },
                  { room: 'C301', util: 88, type: 'Classroom' }
                ].map((room) => (
                  <div key={room.room} className="flex items-center space-x-4">
                    <div className="w-16 text-sm font-medium text-gray-700">{room.room}</div>
                    <div className="w-20 text-xs text-gray-500">{room.type}</div>
                    <div className="flex-1">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full"
                          style={{ width: `${room.util}%` }}
                        />
                      </div>
                    </div>
                    <div className="w-12 text-sm font-semibold text-gray-900 text-right">{room.util}%</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Faculty Workload Report */}
        {selectedReport === 'faculty' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-purple-50 rounded-lg p-6">
                <div className="text-3xl font-bold text-purple-900">16.2</div>
                <div className="text-sm text-purple-700">Avg Weekly Hours</div>
                <div className="text-xs text-purple-600 mt-1">per faculty member</div>
              </div>
              <div className="bg-indigo-50 rounded-lg p-6">
                <div className="text-3xl font-bold text-indigo-900">78</div>
                <div className="text-sm text-indigo-700">Active Faculty</div>
                <div className="text-xs text-indigo-600 mt-1">across all departments</div>
              </div>
              <div className="bg-teal-50 rounded-lg p-6">
                <div className="text-3xl font-bold text-teal-900">2.1</div>
                <div className="text-sm text-teal-700">Load Variance</div>
                <div className="text-xs text-teal-600 mt-1">well balanced</div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Faculty Workload Distribution</h3>
              <div className="space-y-3">
                {[
                  { name: 'Dr. Smith', dept: 'CSE', hours: 18, max: 20 },
                  { name: 'Dr. Johnson', dept: 'ECE', hours: 16, max: 18 },
                  { name: 'Dr. Wilson', dept: 'MATH', hours: 20, max: 20 },
                  { name: 'Dr. Brown', dept: 'PHY', hours: 14, max: 18 },
                  { name: 'Dr. Davis', dept: 'CHEM', hours: 15, max: 16 }
                ].map((faculty) => (
                  <div key={faculty.name} className="flex items-center justify-between p-3 bg-white rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-32">
                        <div className="font-medium text-gray-900">{faculty.name}</div>
                        <div className="text-xs text-gray-500">{faculty.dept}</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="text-sm font-medium text-gray-700">{faculty.hours}/{faculty.max} hrs</div>
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            (faculty.hours / faculty.max) > 0.9 ? 'bg-red-500' :
                            (faculty.hours / faculty.max) > 0.7 ? 'bg-amber-500' : 'bg-green-500'
                          }`}
                          style={{ width: `${(faculty.hours / faculty.max) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Other reports would be implemented similarly */}
        {selectedReport !== 'utilization' && selectedReport !== 'faculty' && (
          <div className="text-center py-12">
            <div className="text-gray-500">
              <BarChart3 className="h-12 w-12 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Report Coming Soon</h3>
              <p className="text-sm">This report is under development and will be available in the next update.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Reports;