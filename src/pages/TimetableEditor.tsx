import React, { useState } from 'react';
import { Save, Undo, Redo, Copy, Move, AlertTriangle, CheckCircle } from 'lucide-react';

const TimetableEditor: React.FC = () => {
  const [selectedCell, setSelectedCell] = useState<{ day: number; slot: number } | null>(null);
  const [conflicts, setConflicts] = useState<string[]>([]);
  const [unsavedChanges, setUnsavedChanges] = useState(false);

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

  const saveChanges = () => {
    setUnsavedChanges(false);
    // Save logic here
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Timetable Editor</h1>
          <p className="text-gray-600 mt-1">Make manual adjustments to your timetable</p>
        </div>
        <div className="flex items-center space-x-3">
          {unsavedChanges && (
            <div className="flex items-center space-x-2 text-amber-600">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-sm font-medium">Unsaved changes</span>
            </div>
          )}
          <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors">
            <Undo className="h-4 w-4 mr-2" />
            Undo
          </button>
          <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors">
            <Redo className="h-4 w-4 mr-2" />
            Redo
          </button>
          <button
            onClick={saveChanges}
            className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
          >
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </button>
        </div>
      </div>

      {/* Status Bar */}
      {conflicts.length > 0 ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <AlertTriangle className="h-5 w-5 text-red-600 mr-3 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-medium text-red-800">
                {conflicts.length} conflict{conflicts.length > 1 ? 's' : ''} detected
              </h3>
              <p className="text-sm text-red-700 mt-1">
                Please resolve conflicts before saving the timetable.
              </p>
              <div className="mt-2">
                {conflicts.map((conflict, index) => (
                  <div key={index} className="text-xs text-red-600 bg-red-100 px-2 py-1 rounded inline-block mr-2 mb-1">
                    {conflict}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
            <div>
              <h3 className="text-sm font-medium text-green-800">No conflicts detected</h3>
              <p className="text-sm text-green-700">Your timetable is ready for approval.</p>
            </div>
          </div>
        </div>
      )}

      {/* Editor Tools */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-700">Actions:</span>
            <button className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-lg text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors">
              <Move className="h-3 w-3 mr-1" />
              Move Class
            </button>
            <button className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-lg text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors">
              <Copy className="h-3 w-3 mr-1" />
              Copy Class
            </button>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-700">View:</span>
            <select className="border border-gray-300 rounded px-2 py-1 text-xs">
              <option>All Classes</option>
              <option>Only Conflicts</option>
              <option>Department View</option>
            </select>
          </div>
        </div>
      </div>

      {/* Timetable Grid */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
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

              {/* Time slots */}
              {timeSlots.map((timeSlot, slotIndex) => (
                <React.Fragment key={timeSlot}>
                  <div className="bg-white p-4 border-r border-gray-200 font-medium text-gray-700 text-sm">
                    {timeSlot}
                  </div>
                  {days.map((day, dayIndex) => {
                    const isSelected = selectedCell?.day === dayIndex && selectedCell?.slot === slotIndex;
                    return (
                      <div
                        key={`${day}-${timeSlot}`}
                        onClick={() => setSelectedCell({ day: dayIndex, slot: slotIndex })}
                        className={`bg-white p-2 min-h-[80px] border cursor-pointer transition-all ${
                          isSelected
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-100 hover:border-gray-300'
                        }`}
                      >
                        {/* Sample class - this would be dynamic */}
                        {dayIndex === 0 && slotIndex === 0 && (
                          <div className="bg-blue-50 border-l-4 border-blue-500 p-3 rounded-lg h-full">
                            <div className="font-semibold text-sm text-blue-900 mb-1">Data Structures</div>
                            <div className="text-xs text-blue-700">Dr. Smith</div>
                            <div className="text-xs text-blue-700">Room A101</div>
                            <div className="text-xs text-blue-600">CSE-2024-A</div>
                          </div>
                        )}
                        {dayIndex === 1 && slotIndex === 2 && (
                          <div className="bg-red-50 border-l-4 border-red-500 p-3 rounded-lg h-full">
                            <div className="font-semibold text-sm text-red-900 mb-1">Circuit Theory</div>
                            <div className="text-xs text-red-700">Dr. Johnson</div>
                            <div className="text-xs text-red-700">Room A101</div>
                            <div className="text-xs text-red-600">ECE-2024-A</div>
                            <div className="text-xs text-red-600 font-semibold mt-1">CONFLICT!</div>
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

      {/* Class Details Panel */}
      {selectedCell && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Selected Time Slot</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Current Assignment</h4>
              <div className="space-y-2 text-sm">
                <div><span className="text-gray-600">Course:</span> <span className="font-medium">Data Structures</span></div>
                <div><span className="text-gray-600">Faculty:</span> <span className="font-medium">Dr. Smith</span></div>
                <div><span className="text-gray-600">Room:</span> <span className="font-medium">Room A101</span></div>
                <div><span className="text-gray-600">Batch:</span> <span className="font-medium">CSE-2024-A</span></div>
                <div><span className="text-gray-600">Students:</span> <span className="font-medium">50</span></div>
              </div>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Suggested Alternatives</h4>
              <div className="space-y-2">
                <div className="p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                  <div className="text-sm font-medium">Move to Room B201</div>
                  <div className="text-xs text-gray-600">Available, capacity 60</div>
                </div>
                <div className="p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                  <div className="text-sm font-medium">Swap with 11:00-12:00 slot</div>
                  <div className="text-xs text-gray-600">No conflicts detected</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TimetableEditor;