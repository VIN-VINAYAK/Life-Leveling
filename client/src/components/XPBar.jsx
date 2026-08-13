import React from 'react';

export const XPBar = ({ currentXP, xpToNextLevel, progress }) => {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-bold text-gray-800">Progress to Next Level</h3>
        <span className="text-sm font-bold text-gray-600">
          {Math.round(progress)}%
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-6 overflow-hidden">
        <div
          className="bg-gradient-to-r from-blue-500 to-purple-500 h-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="text-sm text-gray-600 mt-3">
        {xpToNextLevel} XP to next level
      </p>
    </div>
  );
};
