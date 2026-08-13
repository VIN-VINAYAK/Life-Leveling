import React, { memo } from 'react';

export const TaskCard = memo(({ task, onComplete, completed = false }) => {
  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'hard':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getDifficultyMultiplier = (difficulty) => {
    const multipliers = { easy: 1, medium: 1.5, hard: 2 };
    return multipliers[difficulty] || 1;
  };

  const xpReward = Math.floor(task.xpReward * getDifficultyMultiplier(task.difficulty));

  return (
    <div className={`rounded-lg shadow p-6 ${completed ? 'bg-gray-100 opacity-75' : 'bg-white hover:shadow-lg transition'}`}>
      <div className="flex justify-between items-start mb-3">
        <div>
          <h4 className={`text-lg font-bold ${completed ? 'line-through text-gray-500' : 'text-gray-800'}`}>
            {task.title}
          </h4>
          <p className="text-sm text-gray-600 mt-1">{task.category}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-bold ${getDifficultyColor(task.difficulty)}`}>
          {task.difficulty.charAt(0).toUpperCase() + task.difficulty.slice(1)}
        </span>
      </div>

      {task.description && (
        <p className="text-gray-600 text-sm mb-4">{task.description}</p>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold text-green-600">+{xpReward}</span>
          <span className="text-gray-600 text-sm">XP</span>
        </div>

        {!completed && (
          <button
            onClick={onComplete}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition font-bold"
          >
            Complete
          </button>
        )}

        {completed && (
          <span className="text-green-600 font-bold">✅ Completed</span>
        )}
      </div>

      {completed && task.completedAt && (
        <p className="text-xs text-gray-500 mt-3">
          Completed: {new Date(task.completedAt).toLocaleDateString()}
        </p>
      )}
    </div>
  );
});
