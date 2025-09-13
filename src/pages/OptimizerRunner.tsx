import React, { useState } from 'react';
import { Play, RotateCcw, Settings, Download, AlertCircle, CheckCircle } from 'lucide-react';

const OptimizerRunner: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [progress, setProgress] = useState(0);

  const runOptimization = async () => {
    setIsRunning(true);
    setProgress(0);
    setResults([]);

    // Simulate optimization process
    const steps = [
      'Initializing data...',
      'Applying hard constraints...',
      'Optimizing room utilization...',
      'Balancing faculty workload...',
      'Minimizing student gaps...',
      'Finalizing schedules...'
    ];

    for (let i = 0; i < steps.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 800));
      setProgress(((i + 1) / steps.length) * 100);
    }

    // Simulate results
    const mockResults = [
      {
        id: 1,
        name: 'Optimal Schedule A',
        score: 92.5,
        conflicts: 0,
        utilization: 85.2,
        facultyBalance: 8.7,
        studentGaps: 2.3
      },
      {
        id: 2,
        name: 'Optimal Schedule B',
        score: 89.3,
        conflicts: 1,
        utilization: 82.8,
        facultyBalance: 9.1,
        studentGaps: 1.9
      },
      {
        id: 3,
        name: 'Optimal Schedule C',
        score: 87.1,
        conflicts: 2,
        utilization: 79.6,
        facultyBalance: 8.9,
        studentGaps: 1.5
      }
    ];

    setResults(mockResults);
    setIsRunning(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Optimizer Runner</h1>
          <p className="text-gray-600 mt-1">Generate optimized timetables using constraint solving</p>
        </div>
        <div className="flex space-x-3">
          <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors">
            <Settings className="h-4 w-4 mr-2" />
            Configure
          </button>
        </div>
      </div>

      {/* Optimization Controls */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Optimization Parameters</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Time Limit</label>
            <select className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>5 minutes</option>
              <option>10 minutes</option>
              <option>30 minutes</option>
              <option>1 hour</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Solutions to Generate</label>
            <select className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>3 alternatives</option>
              <option>5 alternatives</option>
              <option>10 alternatives</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Focus Priority</label>
            <select className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>Balanced</option>
              <option>Room Utilization</option>
              <option>Faculty Balance</option>
              <option>Student Experience</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Algorithm</label>
            <select className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>Constraint Programming</option>
              <option>Genetic Algorithm</option>
              <option>Simulated Annealing</option>
            </select>
          </div>
        </div>

        <div className="flex space-x-4">
          <button
            onClick={runOptimization}
            disabled={isRunning}
            className="inline-flex items-center px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            <Play className="h-4 w-4 mr-2" />
            {isRunning ? 'Optimizing...' : 'Run Optimization'}
          </button>
          <button
            disabled={isRunning}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset
          </button>
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
                className="bg-green-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Results */}
      {results.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Optimization Results</h2>
            <div className="flex items-center space-x-2 text-sm text-green-600">
              <CheckCircle className="h-4 w-4" />
              <span>Optimization completed successfully</span>
            </div>
          </div>

          <div className="space-y-4">
            {results.map((result) => (
              <div key={result.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-900">{result.name}</h3>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <div className="text-2xl font-bold text-green-600">{result.score}</div>
                      <div className="text-xs text-gray-500">Overall Score</div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className={`text-lg font-semibold ${result.conflicts === 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {result.conflicts}
                    </div>
                    <div className="text-xs text-gray-600">Conflicts</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-lg font-semibold text-blue-600">{result.utilization}%</div>
                    <div className="text-xs text-gray-600">Room Utilization</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-lg font-semibold text-purple-600">{result.facultyBalance}/10</div>
                    <div className="text-xs text-gray-600">Faculty Balance</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-lg font-semibold text-amber-600">{result.studentGaps}</div>
                    <div className="text-xs text-gray-600">Avg Student Gaps</div>
                  </div>
                </div>

                <div className="flex justify-end space-x-3">
                  <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                    Preview
                  </button>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                    Select & Continue
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200 flex justify-between items-center">
            <div className="text-sm text-gray-600">
              Generated {results.length} alternative schedules in 4.2 seconds
            </div>
            <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors">
              <Download className="h-4 w-4 mr-2" />
              Export All Results
            </button>
          </div>
        </div>
      )}

      {/* Info Panel */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex">
          <AlertCircle className="h-5 w-5 text-blue-600 mr-3 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-medium text-blue-800">Optimization Tips</h3>
            <ul className="text-sm text-blue-700 mt-1 space-y-1">
              <li>• Ensure all required data is imported before running optimization</li>
              <li>• Review and adjust constraint weights for better results</li>
              <li>• Consider running multiple optimizations with different parameters</li>
              <li>• Higher time limits generally produce better solutions</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OptimizerRunner;