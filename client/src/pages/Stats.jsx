import React, { useEffect, useState } from 'react';
import { statsAPI } from '../services/api';
import { Card3D } from '../components/ui/Card3D';
import { AnimatedNumber } from '../components/ui/AnimatedNumber';
import { ProgressRing } from '../components/ui/ProgressRing';
import { PageSkeleton } from '../components/ui/Skeleton';
import { useLanguage } from '../context/LanguageContext';

export const Stats = () => {
  const { t } = useLanguage();
  const [stats, setStats] = useState(null);

  useEffect(()=>{ load(); }, []);

  const load = async () => {
    try { const res = await statsAPI.getStats(); setStats(res.data); } catch (err) { console.error(err); }
  };

  if (!stats) return <PageSkeleton />;

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">{t('Statistics')}</h1>
        <div className="stats-grid">
          <Card3D className="stats-metric-card"><div><h3>{t('Weekly XP')}</h3><p><AnimatedNumber value={stats.weeklyXP} /></p></div><ProgressRing value={Math.min(100, Number(stats.weeklyXP) / 1000 * 100)} label={t('this week')} size={82} strokeWidth={6} /></Card3D>
          <Card3D className="stats-metric-card"><div><h3>{t('Monthly XP')}</h3><p><AnimatedNumber value={stats.monthlyXP} /></p></div><ProgressRing value={Math.min(100, Number(stats.monthlyXP) / 4000 * 100)} label={t('this month')} size={82} strokeWidth={6} /></Card3D>
          <Card3D className="stats-metric-card"><div><h3>{t('Task Completion Rate')}</h3><p><AnimatedNumber value={stats.taskCompletionRate} suffix="%" /></p></div><ProgressRing value={stats.taskCompletionRate} label={t('tasks')} size={82} strokeWidth={6} /></Card3D>
          <Card3D className="stats-metric-card"><div><h3>{t('Habit Completion Rate (today)')}</h3><p><AnimatedNumber value={stats.habitCompletionRate} suffix="%" /></p></div><ProgressRing value={stats.habitCompletionRate} label={t('habits')} size={82} strokeWidth={6} /></Card3D>
        </div>
      </div>
    </div>
  );
};
