import React, { useState, useMemo } from 'react';
import { Save, Undo, Redo, Copy, Move, AlertTriangle, CheckCircle, Search } from 'lucide-react';
import { useData } from '../context/DataContext';

const TimetableEditor: React.FC = () => {
  const { generatedTimetable, setGeneratedTimetable } = useData();
  const [selectedCell, setSelectedCell] = useState<{ day: string; slot: string } | null>(null);
  const [unsavedChanges, setUnsavedChanges] = useState(false);

  const timeSlots = useMemo(() => [
    '9:00-10:00', '10:00-11:00', '11:00-12:00', '12:00-13:00', 
    '14:00-15:00', '15:00-16:00', '16:00-17:00'
  ], []);

  const days = useMemo(() => ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], []);

  const conflicts = useMemo(() => {
    // In a more advanced version, this could re-calculate conflicts on the fly.
    // For now, we rely on the conflict count from the optimizer result.
    return generatedTimetable?.conflicts ?? 0;
  }, [generatedTimetable]);

  const selectedClass = useMemo(() => {
    if (!selectedCell || !generatedTimetable?.timetable) return null;
    const classesInSlot = generatedTimetable.timetable[selectedCell.day]?.[selectedCell.slot] || [];
    return classesInSlot[0] || null; // Assuming one class per cell for simplicity in the details panel
  }, [selectedCell, generatedTimetable]);


  const saveChanges = () => {
    // Here you would typically save the updated timetable to Supabase
    alert('Timetable changes saved successfully!');
    setUnsavedChanges(false);
  };
  
  if (!generatedTimetable) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center">
        <Search className="h-16 w-16 text-gray-400 mb-4" />
        <h2 className="text-2xl font-semibold text-gray-800">No Timetable Loaded</h2>
        <p className="text-gray-600 mt-2">
          Please generate a timetable from the Optimizer page to begin editing.
        </p>
      </div>
    );
  }

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
          <button onClick={saveChanges} className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors">
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </button>
        </div>
      </div>

      {/* Status Bar */}
      {conflicts > 0 ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <AlertTriangle className="h-5 w-5 text-red-600 mr-3 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-medium text-red-800">
                {conflicts} conflict{conflicts > 1 ? 's' : ''} detected
              </h3>
              <p className="text-sm text-red-700 mt-1">
                This timetable has hard constraint violations. Please resolve them before saving.
              </p>
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

      {/* Timetable Grid */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="overflow-x-auto">
          <div className="min-w-full">
            <div className={`grid grid-cols-6 gap-px bg-gray-200 rounded-lg overflow-hidden`}>
              <div className="bg-gray-100 p-4 font-semibold text-gray-900">Time</div>
              {days.map((day) => (
                <div key={day} className="bg-gray-100 p-4 font-semibold text-gray-900 text-center">{day}</div>
              ))}

              {timeSlots.map((slot) => (
                <React.Fragment key={slot}>
                  <div className="bg-white p-4 font-medium text-gray-700 text-sm">{slot}</div>
                  {days.map((day) => {
                    const isSelected = selectedCell?.day === day && selectedCell?.slot === slot;
                    const classesInSlot = generatedTimetable.timetable[day]?.[slot] || [];
                    const classData = classesInSlot[0]; // Assuming one class per slot for display

                    return (
                      <div
                        key={`${day}-${slot}`}
                        onClick={() => setSelectedCell({ day, slot })}
                        className={`bg-white p-2 min-h-[100px] border-2 cursor-pointer transition-all ${
                          isSelected ? 'border-blue-500 bg-blue-50' : 'border-transparent hover:bg-gray-50'
                        }`}
                      >
                        {classData && (
                          <div className={`bg-blue-50 border-l-4 border-blue-500 p-3 rounded-lg h-full text-xs`}>
                            <div className="font-semibold text-blue-900 mb-1">{classData.course.name}</div>
                            <div className="text-blue-700">🧑‍🏫 {classData.faculty.name}</div>
                            <div className="text-blue-700">📍 {classData.room.name}</div>
                            <div className="text-blue-600">🎓 {classData.batch.name}</div>
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
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Details for {selectedCell.day}, {selectedCell.slot}
          </h3>
          {selectedClass ? (
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Current Assignment</h4>
                  <div className="space-y-2 text-sm">
                    <div><span className="text-gray-600">Course:</span> <span className="font-medium">{selectedClass.course.name}</span></div>
                    <div><span className="text-gray-600">Faculty:</span> <span className="font-medium">{selectedClass.faculty.name}</span></div>
                    <div><span className="text-gray-600">Room:</span> <span className="font-medium">{selectedClass.room.name} (Cap: {selectedClass.room.capacity})</span></div>
                    <div><span className="text-gray-600">Batch:</span> <span className="font-medium">{selectedClass.batch.name}</span></div>
                    <div><span className="text-gray-600">Students:</span> <span className="font-medium">{selectedClass.batch.studentCount}</span></div>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Suggested Actions</h4>
                  <div className="space-y-2">
                    <button className="w-full text-left p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                      <div className="text-sm font-medium flex items-center"><Move className="h-4 w-4 mr-2" /> Move Class</div>
                      <div className="text-xs text-gray-600 ml-6">Find another available slot</div>
                    </button>
                    <button className="w-full text-left p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                      <div className="text-sm font-medium flex items-center"><Copy className="h-4 w-4 mr-2" /> Swap Class</div>
                      <div className="text-xs text-gray-600 ml-6">Exchange with another class</div>
                    </button>
                  </div>
                </div>
              </div>
          ) : (
            <p className="text-gray-500">This time slot is empty. You can assign a class here.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default TimetableEditor;