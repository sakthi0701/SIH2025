// src/pages/OptimizerRunner.tsx

import React, { useState } from 'react';
import { Play, RotateCcw, Settings, Download, AlertCircle, CheckCircle, Eye, Trash2 } from 'lucide-react';
import { runOptimization, OptimizerInput, OptimizationResult } from '../lib/optimizer';
import { useData } from '../context/DataContext';
import { useNavigate } from 'react-router-dom';

const OptimizerRunner: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<OptimizationResult[]>([]);
  const [progress, setProgress] = useState(0);
  const { departments, rooms, constraints, setGeneratedTimetable, timetables, addTimetable, deleteTimetable, settings, updateSettings, currentSemester } = useData();
  const navigate = useNavigate();

  const handleRunOptimization = async () => {
    setIsRunning(true);
    setProgress(0);
    setResults([]);

    if (!departments.length || !rooms.length) {
      alert("Cannot run optimizer: Departments and Rooms data is required.");
      setIsRunning(false);
      return;
    }

    const savedSettings = localStorage.getItem('timetable-settings');
    const academicSettings = savedSettings ? JSON.parse(savedSettings).academic : {
        periods: [
            { start: '09:00', end: '10:00' }, { start: '10:00', end: '11:00' },
            { start: '11:15', end: '12:15' }, { start: '12:15', end: '13:15' },
            { start: '14:00', end: '15:00' }, { start: '15:00', end: '16:00' },
            { start: '16:00', end: '17:00' },
        ],
        lunchStartTime: '13:00',
        lunchEndTime: '14:00'
    };

    const optimizerInput: OptimizerInput = {
      departments,
      rooms,
      constraints,
      targetSemester: currentSemester,
      academicSettings,
    };

    try {
      const optimizationResults = await runOptimization(optimizerInput, setProgress);
      setResults(optimizationResults);
      if (optimizationResults.length > 0) {
        // Automatically load the best result
        setGeneratedTimetable(optimizationResults[0]);
        // Save all results to Supabase
        for (const result of optimizationResults) {
            await addTimetable(result);
        }
      }
    } catch (error) {
      console.error("Optimization failed:", error);
      alert(error instanceof Error ? error.message : "An unknown error occurred during optimization.");
    } finally {
      setIsRunning(false);
    }
  };

  const handleLoadTimetable = (timetableResult: OptimizationResult) => {
    setGeneratedTimetable(timetableResult);
    alert(`Timetable "${timetableResult.name}" loaded!`);
    navigate('/timetable');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Optimizer Runner</h1>
          <p className="text-gray-600 mt-1">Generate optimized timetables using constraint solving</p>
        </div>
      </div>

      {/* Optimization Controls */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Target Semester
                </label>
                <select
                    value={currentSemester}
                    onChange={(e) => updateSettings({ activeSemester: parseInt(e.target.value)})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={isRunning}
                >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
                        <option key={sem} value={sem}>Semester {sem}</option>
                    ))}
                </select>
            </div>
        </div>

        <div className="flex space-x-4 border-t border-gray-200 pt-6">
          <button
            onClick={handleRunOptimization}
            disabled={isRunning}
            className="inline-flex items-center px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            <Play className="h-4 w-4 mr-2" />
            {isRunning ? `Optimizing... (${Math.round(progress)}%)` : 'Run Optimization'}
          </button>
        </div>

        {isRunning && (
          <div className="mt-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">Optimization Progress</span>
              <span className="text-sm text-gray-500">{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-600 h-2 rounded-full transition-all duration-200"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Results */}
       {!isRunning && results.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Top 3 Timetable Solutions</h2>
           <div className="space-y-4">
             {results.map((result, index) => (
               <div key={result.id} className="border border-gray-200 rounded-lg p-4 flex justify-between items-center">
                 <div>
                   <h3 className="font-semibold text-gray-800">{result.name} {index === 0 && <span className="text-xs bg-green-100 text-green-800 font-medium ml-2 px-2 py-1 rounded-full">Best</span>}</h3>
                   <div className="flex space-x-4 text-sm mt-2">
                      <div className="flex items-center text-green-600">
                        <CheckCircle className="h-4 w-4 mr-1"/>
                        Score: {result.score.toFixed(2)}
                      </div>
                      <div className={`flex items-center ${result.conflicts.length > 0 ? 'text-red-600' : 'text-gray-600'}`}>
                        <AlertCircle className="h-4 w-4 mr-1"/>
                        Conflicts: {result.conflicts.length}
                      </div>
                   </div>
                 </div>
                 <button onClick={() => handleLoadTimetable(result)} className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
                   <Eye className="h-4 w-4 mr-2" />
                   Load Timetable
                 </button>
               </div>
             ))}
           </div>
        </div>
      )}
      {/* Saved Timetables */}
      {timetables.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Saved Timetables</h2>
              <div className="space-y-4">
                  {timetables.map((timetable) => (
                      <div key={timetable.id} className="border border-gray-200 rounded-lg p-4 flex justify-between items-center">
                          <div>
                              <h3 className="font-semibold text-gray-800">{timetable.name}</h3>
                              <div className="flex space-x-4 text-sm mt-2">
                                  <div className="flex items-center text-green-600">
                                      <CheckCircle className="h-4 w-4 mr-1" />
                                      Score: {timetable.score.toFixed(2)}
                                  </div>
                                  <div className={`flex items-center ${timetable.conflicts.length > 0 ? 'text-red-600' : 'text-gray-600'}`}>
                                      <AlertCircle className="h-4 w-4 mr-1" />
                                      Conflicts: {timetable.conflicts.length}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                      Created: {new Date(timetable.created_at).toLocaleString()}
                                  </div>
                              </div>
                          </div>
                          <div className="flex items-center space-x-2">
                              <button onClick={() => handleLoadTimetable(timetable)} className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
                                  <Eye className="h-4 w-4 mr-2" />
                                  Load
                              </button>
                              <button onClick={() => deleteTimetable(timetable.id)} className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700">
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete
                              </button>
                          </div>
                      </div>
                  ))}
              </div>
          </div>
      )}
    </div>
  );
};

export default OptimizerRunner;