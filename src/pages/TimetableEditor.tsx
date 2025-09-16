import React, { useState, useMemo } from 'react';
import { Save, AlertTriangle, CheckCircle, Search, Move } from 'lucide-react';
import { useData } from '../context/DataContext';
import { DndContext, useDraggable, useDroppable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';

// Helper component for a single draggable class item
const DraggableClass = ({ classData, isConflict }) => {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: `${classData.day}-${classData.slot}`,
    data: { classData },
  });

  const style = {
    transform: CSS.Translate.toString(transform),
  };

  const conflictStyle = isConflict ? 'bg-red-100 border-red-500' : 'bg-blue-50 border-blue-500';

  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes} className={`border-l-4 p-3 rounded-lg h-full text-xs cursor-grab ${conflictStyle}`}>
      <div className="font-semibold text-gray-900 mb-1">{classData.course.name}</div>
      <div className="text-gray-700">🧑‍🏫 {classData.faculty.name}</div>
      <div className="text-gray-700">📍 {classData.room.name}</div>
      <div className="text-gray-600">🎓 {classData.batch.name}</div>
    </div>
  );
};

// Helper component for a grid cell that can receive a class
const DroppableCell = ({ day, slot, children }) => {
  const { setNodeRef } = useDroppable({ id: `${day}-${slot}` });
  return <div ref={setNodeRef} className="h-full w-full">{children}</div>;
};

const TimetableEditor = () => {
  const { generatedTimetable, setGeneratedTimetable, departments } = useData();
  const [selectedCell, setSelectedCell] = useState(null);
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  
  // --- PHASE 1: FILTERING STATE ---
  const [selectedDepartment, setSelectedDepartment] = useState('all');

  const timeSlots = useMemo(() => ['9:00-10:00', '10:00-11:00', '11:00-12:00', '12:00-13:00', '14:00-15:00', '15:00-16:00', '16:00-17:00'], []);
  const days = useMemo(() => ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], []);

  // --- PHASE 3: CONFLICT HIGHLIGHTING ---
  const conflictMap = useMemo(() => {
    const map = new Map();
    if (!generatedTimetable?.conflicts) return map;
    for (const conflict of generatedTimetable.conflicts) {
      const key = `${conflict.day}-${conflict.slot}`;
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(conflict.message);
    }
    return map;
  }, [generatedTimetable]);

  const selectedCellDetails = useMemo(() => {
    if (!selectedCell || !generatedTimetable?.timetable) return { class: null, conflicts: [] };
    const classesInSlot = generatedTimetable.timetable[selectedCell.day]?.[selectedCell.slot] || [];
    return {
      class: classesInSlot[0] || null,
      conflicts: conflictMap.get(`${selectedCell.day}-${selectedCell.slot}`) || [],
    };
  }, [selectedCell, generatedTimetable, conflictMap]);

  // --- PHASE 2: DRAG-AND-DROP HANDLER ---
  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const sourceId = active.id;
    const destinationId = over.id;
    const sourceClass = active.data.current.classData;
    
    const [sourceDay, sourceSlot] = sourceId.split('-');
    const [destDay, destSlot] = destinationId.split('-');
    
    const newTimetable = JSON.parse(JSON.stringify(generatedTimetable.timetable));
    
    const destClasses = newTimetable[destDay]?.[destSlot] || [];
    const destinationClass = destClasses[0] || null;

    // Remove source class from its original slot
    newTimetable[sourceDay][sourceSlot] = [];

    // Place source class in destination slot, updating its day and slot
    sourceClass.day = destDay;
    sourceClass.slot = destSlot;
    newTimetable[destDay][destSlot] = [sourceClass];
    
    // If destination had a class, move it to the source slot (swap)
    if (destinationClass) {
      destinationClass.day = sourceDay;
      destinationClass.slot = sourceSlot;
      newTimetable[sourceDay][sourceSlot] = [destinationClass];
    }
    
    setGeneratedTimetable(prev => ({ ...prev, timetable: newTimetable }));
    setUnsavedChanges(true);
  };

  if (!generatedTimetable) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center">
        <Search className="h-16 w-16 text-gray-400 mb-4" />
        <h2 className="text-2xl font-semibold">No Timetable Loaded</h2>
        <p className="text-gray-600 mt-2">Please generate a timetable to begin editing.</p>
      </div>
    );
  }

  const conflicts = generatedTimetable.conflicts;

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <div className="space-y-6">
        {/* Header and Filters */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Timetable Editor</h1>
            <p className="text-gray-600 mt-1">Drag and drop to make adjustments.</p>
          </div>
          <div className="flex items-center space-x-4">
             {/* PHASE 1: Filter UI */}
            <div>
                <label htmlFor="department" className="block text-sm font-medium text-gray-700">Department</label>
                <select id="department" value={selectedDepartment} onChange={e => setSelectedDepartment(e.target.value)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md">
                    <option value="all">All Departments</option>
                    {departments.map(dept => <option key={dept.id} value={dept.id}>{dept.name}</option>)}
                </select>
            </div>
            {unsavedChanges && <div className="flex items-center space-x-2 text-amber-600"><AlertTriangle className="h-4 w-4" /><span className="text-sm font-medium">Unsaved</span></div>}
            <button onClick={() => alert("Changes Saved!")} className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700"> <Save className="h-4 w-4 mr-2" /> Save </button>
          </div>
        </div>

        {/* Status Bar */}
        {conflicts.length > 0 ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-red-800 flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2" /> {conflicts.length} conflict{conflicts.length > 1 ? 's' : ''} detected
            </h3>
          </div>
        ) : (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
             <h3 className="text-sm font-medium text-green-800 flex items-center">
                <CheckCircle className="h-5 w-5 mr-2" /> No conflicts detected
             </h3>
          </div>
        )}

        {/* Timetable Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl shadow-sm border p-6 xl:col-span-2">
                <div className="overflow-x-auto">
                    <div className={`grid grid-cols-6 gap-px bg-gray-200 rounded-lg overflow-hidden`}>
                        <div className="bg-gray-100 p-4 font-semibold">Time</div>
                        {days.map(day => <div key={day} className="bg-gray-100 p-4 font-semibold text-center">{day}</div>)}
                        {timeSlots.map(slot => (
                        <React.Fragment key={slot}>
                            <div className="bg-white p-4 font-medium text-sm">{slot}</div>
                            {days.map(day => {
                                const classesInSlot = generatedTimetable.timetable[day]?.[slot] || [];
                                const classData = classesInSlot[0];
                                const isSelected = selectedCell?.day === day && selectedCell?.slot === slot;
                                const isConflict = conflictMap.has(`${day}-${slot}`);
                                
                                // PHASE 1: Apply filtering
                                if (classData && selectedDepartment !== 'all' && classData.department.id !== selectedDepartment) {
                                    return <div key={`${day}-${slot}`} className="bg-white min-h-[100px]"></div>;
                                }
                                
                                const cellStyle = isSelected ? 'border-blue-500 bg-blue-50' : isConflict ? 'border-red-500 bg-red-50' : 'border-transparent hover:bg-gray-50';

                                return (
                                <div key={`${day}-${slot}`} onClick={() => setSelectedCell({ day, slot })} className={`p-1 min-h-[100px] border-2 cursor-pointer transition-all ${cellStyle}`}>
                                    <DroppableCell day={day} slot={slot}>
                                        {classData && <DraggableClass classData={classData} isConflict={isConflict} />}
                                    </DroppableCell>
                                </div>
                                );
                            })}
                        </React.Fragment>
                        ))}
                    </div>
                </div>
            </div>

            {/* Details Panel */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
                <h3 className="text-lg font-semibold mb-4">Details</h3>
                {!selectedCell && <p className="text-gray-500">Click on a cell to see details.</p>}
                {selectedCell && (
                    <div>
                        <h4 className="font-medium text-gray-900 mb-3">{selectedCell.day}, {selectedCell.slot}</h4>
                        {selectedCellDetails.conflicts.length > 0 && (
                            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-4 rounded-r-lg">
                                <p className="font-bold">Conflicts in this slot:</p>
                                <ul className="list-disc list-inside text-sm mt-1">
                                    {selectedCellDetails.conflicts.map((msg, i) => <li key={i}>{msg}</li>)}
                                </ul>
                            </div>
                        )}
                        {selectedCellDetails.class ? (
                             <div className="space-y-2 text-sm">
                                <div><span className="text-gray-600">Course:</span> <span className="font-medium">{selectedCellDetails.class.course.name}</span></div>
                                <div><span className="text-gray-600">Faculty:</span> <span className="font-medium">{selectedCellDetails.class.faculty.name}</span></div>
                                <div><span className="text-gray-600">Room:</span> <span className="font-medium">{selectedCellDetails.class.room.name}</span></div>
                                <div><span className="text-gray-600">Batch:</span> <span className="font-medium">{selectedCellDetails.class.batch.name}</span></div>
                            </div>
                        ) : (
                            <p className="text-gray-500">This time slot is empty.</p>
                        )}
                    </div>
                )}
            </div>
        </div>
      </div>
    </DndContext>
  );
};

export default TimetableEditor;