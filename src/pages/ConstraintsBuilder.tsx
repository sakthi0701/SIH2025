import React, { useState } from 'react';
import { Plus, Save, RotateCcw, Info } from 'lucide-react';
import ConstraintCard from '../components/Constraints/ConstraintCard';
import ConstraintModal from '../components/Constraints/ConstraintModal';
import { useData } from '../context/DataContext';

const ConstraintsBuilder: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  // Get constraints and management functions from the context
  const { constraints, addConstraint, updateConstraint, deleteConstraint } = useData();

  const hardConstraints = constraints.filter(c => c.type === 'hard');
  const softConstraints = constraints.filter(c => c.type === 'soft');

  const handleSaveChanges = async () => {
    try {
      // In a real app, you might batch updates, but here we update on each action.
      // This button can be used for confirmation messages or future batch-saving logic.
      alert('All changes to constraints have been saved automatically!');
    } catch (error) {
      console.error("Error confirming save:", error);
      alert('Could not confirm save. Please check console for errors.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Constraints Builder</h1>
          <p className="text-gray-600 mt-1">Configure scheduling rules and priorities</p>
        </div>
        <div className="flex space-x-3">
          <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors">
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset to Defaults
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Constraint
          </button>
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex">
          <Info className="h-5 w-5 text-blue-600 mr-3 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-medium text-blue-800">Constraint Types</h3>
            <p className="text-sm text-blue-700 mt-1">
              <span className="font-semibold">Hard constraints</span> must be satisfied (violations will be rejected).
              <span className="font-semibold ml-2">Soft constraints</span> are preferred but can be violated with penalty.
            </p>
          </div>
        </div>
      </div>

      {/* Hard Constraints */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Hard Constraints</h2>
          <span className="bg-red-100 text-red-800 text-sm font-medium px-3 py-1 rounded-full">
            {hardConstraints.length} rules
          </span>
        </div>
        <div className="space-y-4">
          {hardConstraints.map((constraint) => (
            <ConstraintCard
              key={constraint.id}
              constraint={constraint}
              onUpdate={updateConstraint}
              onDelete={deleteConstraint}
            />
          ))}
        </div>
      </div>

      {/* Soft Constraints */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Soft Constraints</h2>
          <span className="bg-amber-100 text-amber-800 text-sm font-medium px-3 py-1 rounded-full">
            {softConstraints.length} rules
          </span>
        </div>
        <div className="space-y-4">
          {softConstraints.map((constraint) => (
            <ConstraintCard
              key={constraint.id}
              constraint={constraint}
              onUpdate={updateConstraint}
              onDelete={deleteConstraint}
            />
          ))}
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button 
          onClick={handleSaveChanges}
          className="inline-flex items-center px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
        >
          <Save className="h-4 w-4 mr-2" />
          Save Constraints
        </button>
      </div>

      {/* Modal */}
      {showModal && (
        <ConstraintModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          onAdd={(constraint) => {
            addConstraint(constraint);
            setShowModal(false);
          }}
        />
      )}
    </div>
  );
};

export default ConstraintsBuilder;