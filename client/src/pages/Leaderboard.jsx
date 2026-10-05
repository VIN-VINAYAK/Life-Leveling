import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import { leaderboardAPI } from '../services/api';
import { motion } from 'framer-motion';
import { Skeleton } from '../components/ui/Skeleton';
import { GlassCard } from '../components/ui/GlassCard';
import { useLanguage } from '../context/LanguageContext';

export const Leaderboard = () => {
  const navigate = useNavigate();
  const { language, t } = useLanguage();
  const [leaderboard, setLeaderboard] = useState([]);
  const [rankData, setRankData] = useState(null);
  const [loading, setLoading] = useState(true);
  const podium = leaderboard.slice(0, 3);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const globalRes = await leaderboardAPI.getGlobal();
        const rankedUsers = globalRes.data.leaderboard || [];
        const currentIndex = rankedUsers.findIndex((entry) => entry.isCurrentUser);
        setLeaderboard(rankedUsers);
        setRankData(currentIndex < 0 ? null : {
          currentUser: rankedUsers[currentIndex],
          nearbyUsers: rankedUsers.slice(Math.max(0, currentIndex - 5), currentIndex + 6),
          totalUsers: globalRes.data.totalUsers ?? rankedUsers.length
        });
      } catch (error) {
        toast.error(t('Unable to load leaderboard'));
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  return (
    <div className="leaderboard-page">
      <Toaster position="top-right" />
      <div className="leaderboard-content">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <p className="section-eyebrow">{t('LEVEL & XP')}</p>
            <h1>{t('Every level. Every player.')}</h1>
            <p className="leaderboard-subtitle">{t('See how your progress compares across the whole community.')}</p>
          </div>
          <button onClick={() => navigate('/dashboard')} className="secondary-button">{t('Back to dashboard')}</button>
        </div>

        {rankData && (
          <GlassCard className="leaderboard-you-card">
            <div className="leaderboard-you-card__rank">#{rankData.currentUser?.rank || '—'}</div>
            <div className="leaderboard-you-card__details">
              <small>{t('YOUR CURRENT RANK')}</small>
              <h2>{t(rankData.currentUser?.title || 'Novice')} · {rankData.currentUser?.username}</h2>
              <p>{t('Level')} {rankData.currentUser?.level} <span>·</span> {rankData.currentUser?.xp} XP <span>·</span> {t('Streak')} {rankData.currentUser?.streak}</p>
            </div>
            <div className="leaderboard-you-card__count">{rankData.totalUsers ?? leaderboard.length} {t('players ranked')}</div>
          </GlassCard>
        )}

        {!loading && podium.length >= 3 && (
          <div className="leaderboard-podium" aria-label={t('Top three players')}>
            {podium.map((entry, index) => (
              <motion.article
                key={`${entry.rank}-${entry.username}`}
                className={`leaderboard-podium__place leaderboard-podium__place--${index + 1}`}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.08, duration: 0.35 }}
              >
                <span className="leaderboard-podium__rank">#{entry.rank}</span>
                <strong>{entry.username}</strong>
                <small>{t('Level')} {entry.level} · {entry.xp} XP</small>
              </motion.article>
            ))}
          </div>
        )}

        <GlassCard className="leaderboard-table-card">
          <div className="leaderboard-table-heading">
            <div><h2>{t('All players')}</h2><p>{t('Ranked by total experience points')}</p></div>
            <span>{leaderboard.length} {t('accounts')}</span>
          </div>
          {loading ? <div className="mt-4 space-y-3">{[1,2,3].map((idx)=><Skeleton key={idx} className="h-14 rounded-2xl" />)}</div> : (
            <div className="leaderboard-table-wrap">
              <table className="leaderboard-table">
                <thead>
                  <tr>
                    <th>{t('Rank')}</th>
                    <th>{t('Player')}</th>
                    <th>{t('Title')}</th>
                    <th>{t('Level')}</th>
                    <th>{t('XP')}</th>
                    <th>{t('Streak')}</th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboard.map((entry) => (
                    <tr key={`${entry.rank}-${entry.username}`} className={entry.isCurrentUser ? 'leaderboard-current-row' : ''}>
                      <td className="leaderboard-rank">#{entry.rank}</td>
                      <td><span className="leaderboard-player-name">{entry.username}</span>{entry.isCurrentUser && <span className="leaderboard-you-badge">{t('YOU')}</span>}</td>
                      <td>{t(entry.title)}</td>
                      <td>{entry.level}</td>
                      <td className="leaderboard-xp">{entry.xp.toLocaleString(language === 'hi' ? 'hi-IN' : 'en-IN')}</td>
                      <td>{entry.streak} 🔥</td>
                    </tr>
                  ))}
                  {!leaderboard.length && <tr><td colSpan="6" className="leaderboard-empty">{t('No accounts to rank yet.')}</td></tr>}
                </tbody>
              </table>
            </div>
          )}
        </GlassCard>

        {rankData?.nearbyUsers?.length > 0 && (
          <GlassCard className="leaderboard-nearby">
            <h3>{t('Your nearby ranks')}</h3>
            <div className="leaderboard-nearby__list">
              {rankData.nearbyUsers.map((nearbyUser) => <div key={`${nearbyUser.rank}-${nearbyUser.username}`} className={nearbyUser.isCurrentUser ? 'is-current' : ''}>#{nearbyUser.rank}<strong>{nearbyUser.username}</strong><span>{t(nearbyUser.title)}</span></div>)}
            </div>
          </GlassCard>
        )}
      </div>
    </div>
  );
};
