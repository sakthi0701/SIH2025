import React, { useState, useMemo } from 'react';
import { Save, AlertTriangle, CheckCircle, Search, Trash2, RefreshCw } from 'lucide-react';
import { useData } from '../context/DataContext';
import { DndContext, useDraggable, useDroppable, UniqueIdentifier } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { timetableToIndividual, getHardConflicts, calculateEnhancedFitness } from '../lib/optimizer';

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
  const { generatedTimetable, setGeneratedTimetable, departments, rooms, constraints, settings, updateTimetableSolution, currentSemester } = useData();
  const [selectedCell, setSelectedCell] = useState<{day: string, slot: string} | null>(null);
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState(departments.length > 0 ? departments[0].id : '');
  
  // Local state for editing
  const [localTimetable, setLocalTimetable] = useState<any>(null);
  const [localConflicts, setLocalConflicts] = useState<any[]>([]);
  const [localScore, setLocalScore] = useState<number>(0);
  const [isRecalculating, setIsRecalculating] = useState(false);

  const timeSlots = useMemo(() => ['9:00-10:00', '10:00-11:00', '11:00-12:00', '12:00-13:00', '14:00-15:00', '15:00-16:00', '16:00-17:00'], []);
  const days = useMemo(() => ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], []);

  // Initialize local state from generated timetable
  React.useEffect(() => {
    if (generatedTimetable?.timetable) {
      setLocalTimetable(JSON.parse(JSON.stringify(generatedTimetable.timetable)));
      setLocalConflicts(generatedTimetable.conflicts || []);
      setLocalScore(generatedTimetable.score || 0);
      setUnsavedChanges(false);
    }
  }, [generatedTimetable]);

  // Recalculate metrics after changes
  const recalculateMetrics = React.useCallback(async (timetable: any) => {
    if (!timetable || !settings) return;
    
    setIsRecalculating(true);
    try {
      const individual = timetableToIndividual(timetable);
      
      const academicSettings = {
        periods: settings.periods,
        lunchStartTime: settings.lunchStartTime,
        lunchEndTime: settings.lunchEndTime
      };
      
      const optimizerInput = {
        departments,
        rooms,
        constraints,
        targetSemester: currentSemester,
        academicSettings
      };
      
      const conflicts = getHardConflicts(individual, optimizerInput);
      const score = calculateEnhancedFitness(individual, optimizerInput);
      
      setLocalConflicts(conflicts);
      setLocalScore(score);
    } catch (error) {
      console.error('Error recalculating metrics:', error);
    } finally {
      setIsRecalculating(false);
    }
  }, [departments, rooms, constraints, currentSemester, settings]);

  const conflictMap = useMemo(() => {
    const map = new Map();
    if (!localConflicts) return map;
    for (const conflict of localConflicts) {
      const key = `${conflict.day}-${conflict.slot}`;
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(conflict.message);
    }
    return map;
  }, [localConflicts]);

  const selectedCellDetails = useMemo(() => {
    if (!selectedCell || !localTimetable) return null;
    const classesInSlot = localTimetable[selectedCell.day]?.[selectedCell.slot] || [];
    return {
      classes: classesInSlot,
      conflicts: conflictMap.get(`${selectedCell.day}-${selectedCell.slot}`) || [],
    };
  }, [selectedCell, localTimetable, conflictMap]);

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (!over || !active) return;
  
    const sourceClassData = active.data.current.classData;
    const sourceId = `${sourceClassData.day}-${sourceClassData.slot}`;
    const destinationId = over.id;
  
    if (sourceId === destinationId) return;
  
    const [sourceDay, sourceSlot] = sourceId.split('-');
    const [destDay, destSlot] = destinationId.split('-');
  
    const newTimetable = JSON.parse(JSON.stringify(localTimetable));
  
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
  
    setLocalTimetable(newTimetable);
    setUnsavedChanges(true);
    recalculateMetrics(newTimetable);
  };

  const handleSave = async () => {
    if (!generatedTimetable || !localTimetable) return;
    
    try {
      await updateTimetableSolution(generatedTimetable.id, {
        timetable: localTimetable,
        conflicts: localConflicts,
        score: localScore,
        quality_metrics: generatedTimetable.quality_metrics
      });
      setUnsavedChanges(false);
    } catch (error) {
      console.error('Error saving timetable:', error);
      alert('Error saving timetable. Please try again.');
    }
  };

  const handleRemoveClass = (classToRemove: any) => {
    if (!localTimetable || !selectedCell) return;
    
    const newTimetable = JSON.parse(JSON.stringify(localTimetable));
    const classesInSlot = newTimetable[selectedCell.day]?.[selectedCell.slot] || [];
    
    const updatedClasses = classesInSlot.filter((c: any) => 
      !(c.course.id === classToRemove.course.id && 
        c.batch.id === classToRemove.batch.id && 
        c.faculty.id === classToRemove.faculty.id)
    );
    
    newTimetable[selectedCell.day][selectedCell.slot] = updatedClasses;
    setLocalTimetable(newTimetable);
    setUnsavedChanges(true);
    recalculateMetrics(newTimetable);
  };

  if (!generatedTimetable || !localTimetable) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center">
        <Search className="h-16 w-16 text-gray-400 mb-4" />
        <h2 className="text-2xl font-semibold">No Timetable Loaded</h2>
        <p className="text-gray-600 mt-2">Please generate a timetable to begin editing.</p>
      </div>
    );
  }

  const conflicts = localConflicts;

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
            <button 
              onClick={handleSave}
              disabled={!unsavedChanges}
              className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            > 
              <Save className="h-4 w-4 mr-2" /> 
              Save Changes
            </button>
          </div>
        </div>

        {conflicts.length > 0 ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-red-800 flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2" /> {conflicts.length} conflict{conflicts.length > 1 ? 's' : ''} detected
              </h3>
              {isRecalculating && (
                <div className="flex items-center text-xs text-red-600">
                  <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                  Recalculating...
                </div>
              )}
            </div>
            <div className="mt-2 text-xs text-red-700">
              <p>• Faculty conflicts: Faculty teaching multiple classes at the same time</p>
              <p>• Room conflicts: Multiple classes scheduled in the same room</p>
              <p>• Batch conflicts: Students having multiple classes simultaneously</p>
            </div>
          </div>
        ) : (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-green-800 flex items-center">
                <CheckCircle className="h-5 w-5 mr-2" /> No conflicts detected
              </h3>
              <div className="text-xs text-green-700">
                Score: {localScore.toFixed(2)}
              </div>
            </div>
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
                                const classesInSlot = localTimetable[day]?.[slot] || [];
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
                                <div key={index} className="space-y-2 text-sm mb-4 border-b pb-2 last:border-b-0">
                                    <div><span className="text-gray-600">Course:</span> <span className="font-medium">{classData.course.name}</span></div>
                                    <div><span className="text-gray-600">Faculty:</span> <span className="font-medium">{classData.faculty.name}</span></div>
                                    <div><span className="text-gray-600">Room:</span> <span className="font-medium">{classData.room.name}</span></div>
                                    <div><span className="text-gray-600">Batch:</span> <span className="font-medium">{classData.batch.name}</span></div>
                                    {selectedCellDetails.conflicts.length > 0 && (
                                      <button
                                        onClick={() => handleRemoveClass(classData)}
                                        className="inline-flex items-center px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                                      >
                                        <Trash2 className="h-3 w-3 mr-1" />
                                        Remove from slot
                                      </button>
                                    )}
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