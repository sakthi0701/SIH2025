import React, { useState } from 'react';
import { Play, RotateCcw, Settings, Download, AlertCircle, CheckCircle } from 'lucide-react';
import { runOptimization, OptimizerInput, OptimizationResult } from '../lib/optimizer';
import { useData } from '../context/DataContext';

const OptimizerRunner: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<OptimizationResult[]>([]);
  const [progress, setProgress] = useState(0);
  const [targetSemester, setTargetSemester] = useState<number>(1);

  const { departments, rooms, constraints: dataConstraints, setGeneratedTimetable } = useData();

  // In a real app, constraints would also come from context/DB.
  const [constraints, setConstraints] = useState([
    { id: '1', name: 'No Faculty Double Booking', type: 'hard' as const, enabled: true, priority: 10 },
    { id: '2', name: 'Room Capacity Check', type: 'hard' as const, enabled: true, priority: 10 },
    { id: '2a', name: 'No Room Double Booking', type: 'hard' as const, enabled: true, priority: 10 },
    { id: '2b', name: 'No Batch Double Booking', type: 'hard' as const, enabled: true, priority: 10 },
    { id: '2c', name: 'Faculty Workload', type: 'hard' as const, enabled: true, priority: 10 },
    { id: '3', name: 'Faculty Preferred Hours', type: 'soft' as const, enabled: true, priority: 7 },
    { id: '4', name: 'Minimize Student Gaps', type: 'soft' as const, enabled: true, priority: 8 },
  ]);

  const handleRunOptimization = async () => {
    setIsRunning(true);
    setProgress(0);
    setResults([]);

    const optimizerInput: OptimizerInput = {
      departments,
      rooms,
      constraints,
      targetSemester: targetSemester, // Pass the selected semester
    };

    try {
      const optimizationResults = await runOptimization(optimizerInput, setProgress);
      setResults(optimizationResults);
      if (optimizationResults.length > 0) {
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
       {results.length > 0 && !isRunning && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Optimization Complete</h2>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-green-50 rounded-lg p-6 text-center">
                <div className="text-3xl font-bold text-green-900">{results[0].score.toFixed(2)}</div>
                <div className="text-sm text-green-700">Overall Score</div>
              </div>
              <div className="bg-red-50 rounded-lg p-6 text-center">
                <div className="text-3xl font-bold text-red-900">{results[0].conflicts}</div>
                <div className="text-sm text-red-700">Hard Conflicts</div>
              </div>
               <div className="bg-blue-50 rounded-lg p-6 text-center">
                <div className="text-3xl font-bold text-blue-900">View Timetable</div>
                <div className="text-sm text-blue-700">Check the results in the viewer.</div>
              </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default OptimizerRunner;