import React, { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { achievementsAPI } from '../services/api';
import { useLanguage } from '../context/LanguageContext';

const AchievementCard = ({ achievement, rewardXP, unlocked }) => {
  const { language, t } = useLanguage();
  const reduceMotion = useReducedMotion();
  return (
    <div className="achievement-flip">
      <motion.article
        className={`achievement-flip__inner ${unlocked ? 'achievement-flip__inner--unlocked' : 'achievement-flip__inner--locked'}`}
        whileHover={reduceMotion ? undefined : { rotateY: 180 }}
        transition={{ type: 'spring', stiffness: 180, damping: 22 }}
      >
        <div className="achievement-flip__face achievement-flip__front">
          <div className="flex items-start justify-between gap-3">
            <div><h3 className="font-bold text-white">{t(achievement.name)}</h3><p className="mt-1 text-sm text-slate-400">{t(achievement.description)}</p></div>
            <span className={`rounded-full px-2 py-1 text-xs font-semibold ${unlocked ? 'bg-emerald-400/15 text-emerald-300' : 'bg-slate-800 text-slate-400'}`}>{unlocked ? `+${rewardXP} XP` : t('Locked')}</span>
          </div>
          <p className="mt-3 text-xs text-slate-500">{unlocked ? <>{t('Completed ')}{achievement.unlockedAt ? new Date(achievement.unlockedAt).toLocaleString(language === 'hi' ? 'hi-IN' : undefined) : t('recently')}</> : <>{t('Reward: +')}{rewardXP} XP</>}</p>
        </div>
        <div className="achievement-flip__face achievement-flip__back" aria-hidden="true">
          <span>{unlocked ? t('MILESTONE REACHED') : t('YOUR NEXT MILESTONE')}</span>
          <strong>{t(achievement.name)}</strong>
          <p>{unlocked ? <>{`+${rewardXP}`}{t(' XP added to your journey.')}</> : t(achievement.description)}</p>
        </div>
      </motion.article>
    </div>
  );
};

export const Achievements = () => {
  const { t } = useLanguage();
  const [achievements, setAchievements] = useState([]);
  const [pending, setPending] = useState([]);
  const [rewardXP, setRewardXP] = useState(50);

  useEffect(()=>{ load(); }, []);

  const load = async () => {
    try {
      const res = await achievementsAPI.getAchievements();
      setAchievements(res.data.completed || res.data.achievements || []);
      setPending(res.data.pending || []);
      setRewardXP(res.data.rewardXP || 50);
    } catch (err) { console.error(err); }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div><p className="text-sm font-semibold uppercase tracking-[0.2em] text-violet-400">{t('Milestones')}</p><h1 className="text-3xl font-bold">{t('Achievements')}</h1><p className="mt-1 text-sm text-slate-400">{t('Complete a milestone to earn')} <strong className="text-emerald-300">+{rewardXP} XP</strong>.</p></div>
          <div className="rounded-2xl border border-violet-400/20 bg-violet-400/10 px-4 py-3 text-sm"><span className="text-slate-400">{t('Progress')}</span><strong className="ml-2 text-white">{achievements.length}/{achievements.length + pending.length}</strong></div>
        </div>

        <section>
          <h2 className="mb-3 text-xl font-semibold">{t('Completed achievements')}</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {achievements.length === 0 ? <div className="rounded-2xl border border-dashed border-slate-700 p-6 text-slate-400">{t('No achievements completed yet. Your first milestone is waiting.')}</div> : achievements.map(a => (
              <AchievementCard key={a._id || a.key} achievement={a} rewardXP={rewardXP} unlocked />
            ))}
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold">{t('Pending achievements')}</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {pending.length === 0 ? <div className="rounded-2xl border border-violet-400/20 bg-violet-400/5 p-6 text-violet-200">{t('Every available achievement is complete.')}</div> : pending.map(a => (
              <AchievementCard key={a.key} achievement={a} rewardXP={rewardXP} unlocked={false} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};
