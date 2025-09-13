import React, { useState } from 'react';
import { Play, RotateCcw, Settings, Download, AlertCircle, CheckCircle } from 'lucide-react';
import { runOptimization, OptimizerInput, OptimizationResult } from '../lib/optimizer'; // Import the new optimizer and types
import { useData } from '../context/DataContext'; // To get live data
import { useAuth } from '../context/AuthContext'; // To get user data if needed

const OptimizerRunner: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<OptimizationResult[]>([]);
  const [progress, setProgress] = useState(0);

  // Get live data from our context
  const { courses, faculty, rooms, batches } = useData();
  
  // Get constraints (for now, using local state as in ConstraintsBuilder)
  // In a real app, this would also come from a context or be fetched.
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
      courses,
      faculty,
      rooms,
      batches,
      constraints
    };

    try {
      // Call the real optimizer function and pass the progress updater
      const optimizationResults = await runOptimization(optimizerInput, setProgress);
      setResults(optimizationResults);
    } catch (error) {
      console.error("Optimization failed:", error);
      alert("The optimizer could not find a valid solution with the given data and constraints. Please check your data or relax some constraints.");
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
        {/* ... other header elements */}
      </div>

      {/* Optimization Controls */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        {/* ... parameter selectors (Time Limit, etc.) ... */}
        {/* These are for show in this version, as the algorithm is complex */}
        
        <div className="flex space-x-4">
          <button
            onClick={handleRunOptimization}
            disabled={isRunning}
            className="inline-flex items-center px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            <Play className="h-4 w-4 mr-2" />
            {isRunning ? `Optimizing... (${Math.round(progress)}%)` : 'Run Optimization'}
          </button>
          {/* ... other buttons ... */}
        </div>
        
        {/* Progress Bar */}
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
      {results.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
           {/* ... result display JSX (this part remains the same) ... */}
           {/* It will now show the dynamically generated results */}
        </div>
      )}
      {/* ... Info Panel ... */}
    </div>
  );
};

export default OptimizerRunner;
