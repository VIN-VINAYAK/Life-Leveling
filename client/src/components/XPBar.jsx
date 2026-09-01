import React from 'react';
import { motion } from 'framer-motion';

export const XPBar = ({ currentXP, xpToNextLevel, progress }) => {
  const barProgress = Math.min(100, Math.max(0, Number(progress) || 0));

  return (
    <motion.div
      className="card-surface p-6 soft-ring"
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="text-lg font-bold text-slate-800">Progress to Next Level</h3>
        <motion.span
          key={Math.round(barProgress)}
          initial={{ scale: 0.9, opacity: 0.5 }}
          animate={{ scale: 1, opacity: 1 }}
          className="rounded-full bg-primary-50 px-3 py-1 text-sm font-bold text-primary-700"
        >
          {Math.round(barProgress)}%
        </motion.span>
      </div>
      <div className="relative h-6 overflow-hidden rounded-full bg-slate-200">
        <motion.div
          className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-primary-500 via-primary-600 to-accent-500 shadow-soft"
          animate={{ width: `${barProgress}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
        <motion.div
          className="absolute inset-y-0 left-0 rounded-full bg-white/20"
          animate={{ width: `${Math.max(12, barProgress)}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>
      <p className="mt-3 text-sm font-medium text-slate-600">
        {xpToNextLevel} XP to next level
      </p>
    </motion.div>
  );
};
