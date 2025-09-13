import React from 'react';
import { Edit2, Trash2, ToggleLeft, ToggleRight, Settings } from 'lucide-react';

interface Constraint {
  id: string;
  name: string;
  type: 'hard' | 'soft';
  description: string;
  priority: number;
  enabled: boolean;
  category: string;
}

interface ConstraintCardProps {
  constraint: Constraint;
  onUpdate: (id: string, updates: Partial<Constraint>) => void;
  onDelete: (id: string) => void;
}

const ConstraintCard: React.FC<ConstraintCardProps> = ({ constraint, onUpdate, onDelete }) => {
  const getTypeColor = (type: string) => {
    return type === 'hard' 
      ? 'bg-red-100 text-red-800' 
      : 'bg-amber-100 text-amber-800';
  };

  const getCategoryColor = (category: string) => {
    const colorMap = {
      'Faculty': 'bg-blue-100 text-blue-800',
      'Room': 'bg-purple-100 text-purple-800',
      'Student': 'bg-emerald-100 text-emerald-800',
      'Course': 'bg-indigo-100 text-indigo-800'
    };
    return colorMap[category as keyof typeof colorMap] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className={`p-4 border rounded-lg transition-all ${
      constraint.enabled ? 'border-gray-200 bg-white' : 'border-gray-100 bg-gray-50'
    }`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <h3 className={`font-medium ${
              constraint.enabled ? 'text-gray-900' : 'text-gray-500'
            }`}>
              {constraint.name}
            </h3>
            <span className={`text-xs font-medium px-2 py-1 rounded-full ${getTypeColor(constraint.type)}`}>
              {constraint.type}
            </span>
            <span className={`text-xs font-medium px-2 py-1 rounded-full ${getCategoryColor(constraint.category)}`}>
              {constraint.category}
            </span>
          </div>
          <p className={`text-sm ${
            constraint.enabled ? 'text-gray-600' : 'text-gray-400'
          } mb-3`}>
            {constraint.description}
          </p>
          {constraint.type === 'soft' && (
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500">Priority:</span>
                <div className="flex items-center space-x-1">
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={constraint.priority}
                    onChange={(e) => onUpdate(constraint.id, { priority: parseInt(e.target.value) })}
                    className="w-20 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    disabled={!constraint.enabled}
                  />
                  <span className={`text-sm font-medium ${
                    constraint.enabled ? 'text-gray-900' : 'text-gray-400'
                  }`}>
                    {constraint.priority}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="flex items-center space-x-2 ml-4">
          <button
            onClick={() => onUpdate(constraint.id, { enabled: !constraint.enabled })}
            className={`transition-colors ${
              constraint.enabled ? 'text-green-600 hover:text-green-800' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            {constraint.enabled ? (
              <ToggleRight className="h-5 w-5" />
            ) : (
              <ToggleLeft className="h-5 w-5" />
            )}
          </button>
          <button className="text-blue-600 hover:text-blue-800 transition-colors">
            <Edit2 className="h-4 w-4" />
          </button>
          <button
            onClick={() => onDelete(constraint.id)}
            className="text-red-600 hover:text-red-800 transition-colors"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConstraintCard;