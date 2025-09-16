import React, { useState, useMemo } from 'react';
import { Save, AlertTriangle, CheckCircle, Search } from 'lucide-react';
import { useData } from '../context/DataContext';
import { DndContext, useDraggable, useDroppable, UniqueIdentifier } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';

// Helper component for a single draggable class item
const DraggableClass = ({ classData, isConflict }) => {
  const uniqueId = `${classData.course.id}-${classData.batch.id}-${classData.faculty.id}-${classData.day}-${classData.slot}`;
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: uniqueId,
    data: { classData },
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    zIndex: 10, // Ensure dragged item is on top
  };

  const conflictStyle = isConflict ? 'bg-red-200 border-red-500' : 'bg-blue-50 border-blue-500';

  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes} className={`border-l-4 p-3 rounded-lg h-full text-xs cursor-grab ${conflictStyle}`}>
      <div className="font-semibold text-gray-900 mb-1 truncate">{classData.course.name}</div>
      <div className="text-gray-700 truncate">👨‍🏫 {classData.faculty.name}</div>
      <div className="text-gray-700 truncate">🚪 {classData.room.name}</div>
      <div className="text-gray-600 truncate">🎓 {classData.batch.name}</div>
    </div>
  );
};

// Helper component for a grid cell that can receive a class
const DroppableCell = ({ day, slot, children, isConflict }) => {
  const { setNodeRef } = useDroppable({ id: `${day}-${slot}` });
  const conflictStyle = isConflict ? 'bg-red-100' : '';
  return <div ref={setNodeRef} className={`h-full w-full ${conflictStyle}`}>{children}</div>;
};

const TimetableEditor = () => {
  const { generatedTimetable, setGeneratedTimetable, departments } = useData();
  const [selectedCell, setSelectedCell] = useState<{day: string, slot: string} | null>(null);
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState(departments.length > 0 ? departments[0].id : '');

  const timeSlots = useMemo(() => ['9:00-10:00', '10:00-11:00', '11:00-12:00', '12:00-13:00', '14:00-15:00', '15:00-16:00', '16:00-17:00'], []);
  const days = useMemo(() => ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], []);

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
    if (!selectedCell || !generatedTimetable?.timetable) return null;
    const classesInSlot = generatedTimetable.timetable[selectedCell.day]?.[selectedCell.slot] || [];
    return {
      classes: classesInSlot,
      conflicts: conflictMap.get(`${selectedCell.day}-${selectedCell.slot}`) || [],
    };
  }, [selectedCell, generatedTimetable, conflictMap]);

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (!over || !active) return;
  
    const sourceClassData = active.data.current.classData;
    const sourceId = `${sourceClassData.day}-${sourceClassData.slot}`;
    const destinationId = over.id;
  
    if (sourceId === destinationId) return;
  
    const [sourceDay, sourceSlot] = sourceId.split('-');
    const [destDay, destSlot] = destinationId.split('-');
  
    const newTimetable = JSON.parse(JSON.stringify(generatedTimetable!.timetable));
  
    const sourceClasses = newTimetable[sourceDay]?.[sourceSlot] || [];
    const classToMoveIndex = sourceClasses.findIndex(c => 
      c.course.id === sourceClassData.course.id &&
      c.batch.id === sourceClassData.batch.id &&
      c.faculty.id === sourceClassData.faculty.id
    );
  
    if (classToMoveIndex === -1) return;
  
    const [classToMove] = sourceClasses.splice(classToMoveIndex, 1);
  
    classToMove.day = destDay;
    classToMove.slot = destSlot;
  
    if (!newTimetable[destDay]) newTimetable[destDay] = {};
    if (!newTimetable[destDay][destSlot]) newTimetable[destDay][destSlot] = [];
    newTimetable[destDay][destSlot].push(classToMove);
  
    setGeneratedTimetable(prev => prev ? ({ ...prev, timetable: newTimetable }) : null);
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
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Timetable Editor</h1>
            <p className="text-gray-600 mt-1">Drag and drop to make adjustments.</p>
          </div>
          <div className="flex items-center space-x-4">
            <div>
                <label htmlFor="department" className="block text-sm font-medium text-gray-700">Department</label>
                <select id="department" value={selectedDepartment} onChange={e => setSelectedDepartment(e.target.value)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md">
                    {departments.map(dept => <option key={dept.id} value={dept.id}>{dept.name}</option>)}
                </select>
            </div>
            {unsavedChanges && <div className="flex items-center space-x-2 text-amber-600"><AlertTriangle className="h-4 w-4" /><span className="text-sm font-medium">Unsaved</span></div>}
            <button onClick={() => alert("Changes Saved!")} className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700"> <Save className="h-4 w-4 mr-2" /> Save </button>
          </div>
        </div>

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

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl shadow-sm border p-6 xl:col-span-2">
                <div className="overflow-x-auto">
                    <div className="grid grid-cols-6 gap-px bg-gray-200 rounded-lg overflow-hidden min-w-[1000px]">
                        <div className="bg-gray-100 p-4 font-semibold">Time</div>
                        {days.map(day => <div key={day} className="bg-gray-100 p-4 font-semibold text-center">{day}</div>)}
                        {timeSlots.map(slot => (
                        <React.Fragment key={slot}>
                            <div className="bg-white p-4 font-medium text-sm">{slot}</div>
                            {days.map(day => {
                                const classesInSlot = generatedTimetable.timetable[day]?.[slot] || [];
                                const isSelected = selectedCell?.day === day && selectedCell?.slot === slot;
                                const isConflict = conflictMap.has(`${day}-${slot}`);
                                
                                const cellStyle = isSelected ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:bg-gray-50';

                                return (
                                <div key={`${day}-${slot}`} onClick={() => setSelectedCell({ day, slot })} className={`p-1 min-h-[120px] bg-white cursor-pointer transition-all ${cellStyle}`}>
                                    <DroppableCell day={day} slot={slot} isConflict={isConflict}>
                                        <div className="space-y-1">
                                        {classesInSlot.map((classData, index) => {
                                             if (selectedDepartment && classData.department.id !== selectedDepartment) {
                                                return null;
                                            }
                                            return <DraggableClass key={index} classData={classData} isConflict={isConflict} />
                                        })}
                                        </div>
                                    </DroppableCell>
                                </div>
                                );
                            })}
                        </React.Fragment>
                        ))}
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border p-6">
                <h3 className="text-lg font-semibold mb-4">Details</h3>
                {!selectedCell && <p className="text-gray-500">Click on a cell to see details.</p>}
                {selectedCellDetails && (
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
                        {selectedCellDetails.classes.length > 0 ? (
                             selectedCellDetails.classes.map((classData, index) => (
                                <div key={index} className="space-y-2 text-sm mb-4 border-b pb-2">
                                    <div><span className="text-gray-600">Course:</span> <span className="font-medium">{classData.course.name}</span></div>
                                    <div><span className="text-gray-600">Faculty:</span> <span className="font-medium">{classData.faculty.name}</span></div>
                                    <div><span className="text-gray-600">Room:</span> <span className="font-medium">{classData.room.name}</span></div>
                                    <div><span className="text-gray-600">Batch:</span> <span className="font-medium">{classData.batch.name}</span></div>
                                </div>
                             ))
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