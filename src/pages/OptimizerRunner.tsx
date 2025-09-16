import React, { useState } from 'react';
import { Play, RotateCcw, Settings, Download, AlertCircle, CheckCircle } from 'lucide-react';
import { runOptimization, OptimizerInput, OptimizationResult } from '../lib/optimizer';
import { useData } from '../context/DataContext';

const OptimizerRunner: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<OptimizationResult[]>([]);
  const [progress, setProgress] = useState(0);
  const [targetSemester, setTargetSemester] = useState<number>(3); // Default to a common semester

  // Get live data from the context, including the user-defined constraints
  const { departments, rooms, constraints, setGeneratedTimetable } = useData();

  const handleRunOptimization = async () => {
    setIsRunning(true);
    setProgress(0);
    setResults([]);

    if (!departments.length || !rooms.length) {
      alert("Cannot run optimizer: Departments and Rooms data is required.");
      setIsRunning(false);
      return;
    }

    // Load academic settings from localStorage
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
      constraints, // Use the live constraints from the context
      targetSemester: targetSemester,
      academicSettings, // Pass the new settings here
    };

    try {
      const optimizationResults = await runOptimization(optimizerInput, setProgress);
      setResults(optimizationResults);
      if (optimizationResults.length > 0) {
        // Save the best result to the global state
        setGeneratedTimetable(optimizationResults[0]);
      }
    } catch (error) {
      console.error("Optimization failed:", error);
      alert(error instanceof Error ? error.message : "An unknown error occurred during optimization.");
    } finally {
      setIsRunning(false);
    }
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
                    value={targetSemester}
                    onChange={(e) => setTargetSemester(parseInt(e.target.value))}
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
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Optimization Complete</h2>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-green-50 rounded-lg p-6 text-center">
                <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <div className="text-3xl font-bold text-green-900">{results[0].score.toFixed(2)}</div>
                <div className="text-sm text-green-700">Overall Score</div>
              </div>
              <div className="bg-red-50 rounded-lg p-6 text-center">
                <AlertCircle className="h-8 w-8 text-red-600 mx-auto mb-2" />
                <div className="text-3xl font-bold text-red-900">{results[0].conflicts.length}</div>
                <div className="text-sm text-red-700">Hard Conflicts</div>
              </div>
               <div className="bg-blue-50 rounded-lg p-6 text-center">
                <Download className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <div className="text-xl font-bold text-blue-900">Timetable Ready</div>
                <div className="text-sm text-blue-700">Check the results in the viewer.</div>
              </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default OptimizerRunner;