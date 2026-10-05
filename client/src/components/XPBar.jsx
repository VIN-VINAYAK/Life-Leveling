import React from 'react';
import { motion } from 'framer-motion';
import { Card3D } from './ui/Card3D';
import { AnimatedNumber } from './ui/AnimatedNumber';
import { useLanguage } from '../context/LanguageContext';

export const XPBar = ({ currentXP, xpToNextLevel, progress }) => {
  const { t } = useLanguage();
  const barProgress = Math.min(100, Math.max(0, Number(progress) || 0));
  const percentage = Math.round(barProgress);

  return (
    <Card3D className="xp-card overflow-hidden p-5 glow-ring">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-400">
            {t('Level progress')}
          </p>
          <h3 className="mt-1 text-xl font-bold text-slate-800">{t('Next Level')}</h3>
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
        <motion.span
          className="xp-bar-fill"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: barProgress / 100 }}
          transition={{ type: 'spring', stiffness: 75, damping: 18 }}
          style={{ transformOrigin: 'left' }}
        />

        <span className="xp-bar-shimmer" aria-hidden="true" />
      </div>

      <div className="mt-3 flex items-center justify-between gap-3 text-sm font-medium text-slate-600">
        <span><AnimatedNumber value={currentXP} /> XP</span>
        <span>{xpToNextLevel} {t('XP to next level')}</span>
      </div>
    </Card3D>
  );
};
