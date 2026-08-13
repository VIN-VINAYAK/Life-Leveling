import React from 'react';

export const HabitCard = ({ habit, onComplete, onEdit, onDelete }) => {
  const completedToday = habit.lastCompletedDate && new Date(habit.lastCompletedDate).setHours(0,0,0,0) === new Date().setHours(0,0,0,0);

  return (
    <div className="bg-white rounded-lg shadow p-4 flex flex-col justify-between">
      <div>
        <h4 className="font-bold text-lg">{habit.title}</h4>
        <p className="text-sm text-gray-500">{habit.category}</p>
        <p className="mt-2 text-sm">XP: <span className="font-semibold">{habit.xpReward}</span></p>
        <p className="text-sm text-gray-600">Streak: {habit.currentStreak}</p>
      </div>
      <div className="mt-4 flex gap-2">
        <button
          onClick={onComplete}
          className={`flex-1 py-2 rounded-lg font-bold ${completedToday ? 'bg-gray-300 text-gray-700' : 'bg-green-600 text-white hover:bg-green-700'}`}
          disabled={completedToday}
        >
          {completedToday ? 'Completed' : 'Complete'}
        </button>
        <button onClick={onEdit} className="px-3 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700">Edit</button>
        <button onClick={onDelete} className="px-3 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600">Delete</button>
      </div>
    </div>
  );
};
