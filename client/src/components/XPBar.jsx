import React from 'react';
import { motion } from 'framer-motion';

export const XPBar = ({ currentXP, xpToNextLevel, progress }) => {
  const barProgress = Math.min(100, Math.max(0, Number(progress) || 0));
  const percentage = Math.round(barProgress);

  return (
    <motion.div
      className="card-surface overflow-hidden p-5 soft-ring"
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-400">
            Level progress
          </p>
          <h3 className="mt-1 text-xl font-bold text-slate-800">Next Level</h3>
        </div>

        <motion.span
          key={percentage}
          initial={{ scale: 0.9, opacity: 0.5 }}
          animate={{ scale: 1, opacity: 1 }}
          className="rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-sm font-bold text-violet-700 shadow-sm"
        >
          {percentage}%
        </motion.span>
      </div>

      <div className="relative h-7 overflow-hidden rounded-full border border-slate-200 bg-slate-200/80 shadow-inner">
        <motion.div
          className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-cyan-400 via-violet-500 to-fuchsia-500 shadow-[0_0_18px_rgba(168,85,247,0.45)]"
          animate={{ width: `${barProgress}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />

        <motion.div
          className="absolute inset-y-0 left-0 rounded-full bg-white/25"
          animate={{ width: `${Math.max(10, barProgress)}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>

      <div className="mt-3 flex items-center justify-between gap-3 text-sm font-medium text-slate-600">
        <span>{currentXP} XP</span>
        <span>{xpToNextLevel} XP to next level</span>
      </div>
    </motion.div>
  );
};
