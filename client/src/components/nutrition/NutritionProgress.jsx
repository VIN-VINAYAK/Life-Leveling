import React from 'react';

export const NutritionProgress = ({ value, label }) => {
  return (
    <div className="relative inline-flex h-72 w-72 items-center justify-center">
      <svg viewBox="0 0 200 200" className="h-full w-full">
        <circle cx="100" cy="100" r="90" className="fill-none stroke-slate-200 stroke-[18]" />
        <circle
          cx="100"
          cy="100"
          r="90"
          className="fill-none stroke-blue-600 stroke-[18] transition-all duration-700"
          strokeDasharray={`${Math.PI * 2 * 90}`}
          strokeDashoffset={`${Math.PI * 2 * 90 * (1 - value / 100)}`}
          strokeLinecap="round"
          transform="rotate(-90 100 100)"
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center px-6">
        <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Daily Goal</p>
        <p className="mt-3 text-4xl font-bold text-slate-900">{value}%</p>
        <p className="mt-2 text-sm text-slate-500">{label}</p>
      </div>
    </div>
  );
};
