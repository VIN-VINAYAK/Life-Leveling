import React from 'react';
import { Card3D } from './ui/Card3D';
import { PressableButton } from './ui/PressableButton';
import { useLanguage } from '../context/LanguageContext';

export const HabitCard = ({ habit, onComplete, onEdit, onDelete }) => {
  const { t } = useLanguage();
  const completedToday = habit.lastCompletedDate && new Date(habit.lastCompletedDate).setHours(0,0,0,0) === new Date().setHours(0,0,0,0);

  return (
    <Card3D className="habit-card p-4 flex flex-col justify-between">
      <div>
        <h4 className="font-bold text-lg">{habit.title}</h4>
        <p className="text-sm text-gray-500">{habit.category}</p>
        <p className="mt-2 text-sm uppercase tracking-wide text-slate-400">{t((habit.difficulty || 'medium').replace(/^./, (letter) => letter.toUpperCase()))}</p>
        <p className="mt-1 text-sm">XP: <span className="font-semibold">{habit.xpReward || 10}</span></p>
        <p className="text-sm text-gray-600">{t('Streak:')} {habit.currentStreak}</p>
      </div>
      <div className="mt-4 flex gap-2">
        <PressableButton
          onClick={onComplete}
          className={`flex-1 min-h-11 rounded-lg font-bold ${completedToday ? 'habit-button--done' : 'primary-button'}`}
          disabled={completedToday}
        >
          {completedToday ? t('Completed') : t('Complete')}
        </PressableButton>
        <PressableButton onClick={onEdit} className="secondary-button px-3">{t('Edit')}</PressableButton>
        <PressableButton onClick={onDelete} className="secondary-button habit-button--delete px-3">{t('Delete')}</PressableButton>
      </div>
    </Card3D>
  );
};
