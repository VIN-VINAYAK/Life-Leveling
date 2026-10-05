import React, { memo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check } from 'lucide-react';
import toast from 'react-hot-toast';
import { Card3D } from './ui/Card3D';
import { PressableButton } from './ui/PressableButton';
import { useLanguage } from '../context/LanguageContext';

export const TaskCard = memo(({ task, onComplete, completed = false }) => {
  const { language, t } = useLanguage();
  const [completing, setCompleting] = useState(false);
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

  const xpReward = task.xpReward || 10;
  const handleComplete = async () => {
    setCompleting(true);
    try {
      await onComplete();
    } catch (error) {
      setCompleting(false);
      toast.error(error.response?.data?.message || t('Could not complete this task'));
    }
  };

  return (
    <Card3D className={`task-card p-5 ${completed ? 'task-card--completed' : ''}`} layout>
      <div className="flex justify-between items-start mb-3">
        <div>
          <h4 className={`text-lg font-bold ${completed ? 'line-through text-gray-500' : 'text-gray-800'}`}>
            {task.title}
          </h4>
          <p className="text-sm text-gray-600 mt-1">{task.category}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-bold ${getDifficultyColor(task.difficulty)}`}>
          {t(task.difficulty.charAt(0).toUpperCase() + task.difficulty.slice(1))}
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
          <PressableButton
            onClick={handleComplete}
            disabled={completing}
            className={`primary-button task-complete-button${completing ? ' is-completing' : ''}`}
          >
            <motion.span animate={{ scale: completing ? [1, 0.7, 1] : 1 }} transition={{ duration: 0.24 }}>
              <Check size={16} />
            </motion.span>
            {completing ? t('Done') : t('Complete')}
            <AnimatePresence>
              {completing && <motion.span className="floating-xp-chip" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: -22 }} exit={{ opacity: 0 }} transition={{ duration: 0.35 }}>+{xpReward} XP</motion.span>}
            </AnimatePresence>
          </PressableButton>
        )}

        {completed && (
          <span className="text-green-600 font-bold">{t('✅ Completed')}</span>
        )}
      </div>

      {completed && task.completedAt && (
        <p className="text-xs text-gray-500 mt-3">
          {t('Completed:')} {new Date(task.completedAt).toLocaleDateString(language === 'hi' ? 'hi-IN' : undefined)}
        </p>
      )}
    </Card3D>
  );
});
