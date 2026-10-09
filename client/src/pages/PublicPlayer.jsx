import React, { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Check, Copy, Download, Share2 } from 'lucide-react';
import { playerAPI } from '../services/api';

const formatStat = (value) => Number(value || 0).toLocaleString();
const shortText = (value, maxLength = 28) => (
  value.length > maxLength ? `${value.slice(0, maxLength - 1)}…` : value
);

export const PublicPlayer = () => {
  const { id } = useParams();
  const cardRef = useRef(null);
  const [player, setPlayer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [actionError, setActionError] = useState('');

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');

    playerAPI.getCard(id)
      .then(({ data }) => {
        if (active) setPlayer(data.player);
      })
      .catch((requestError) => {
        if (active) setError(requestError.response?.data?.message || 'Could not load this player card.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => { active = false; };
  }, [id]);

  const getCardImage = async () => {
    if (!cardRef.current) throw new Error('Player card is not ready yet.');

    const svgMarkup = new XMLSerializer().serializeToString(cardRef.current);
    const svgUrl = URL.createObjectURL(new Blob([svgMarkup], { type: 'image/svg+xml;charset=utf-8' }));
    const image = new Image();

    try {
      await new Promise((resolve, reject) => {
        image.onload = resolve;
        image.onerror = () => reject(new Error('Could not render the player card image.'));
        image.src = svgUrl;
      });

      const canvas = document.createElement('canvas');
      canvas.width = 1080;
      canvas.height = 1920;
      const context = canvas.getContext('2d');
      if (!context) throw new Error('Image export is not supported in this browser.');
      context.drawImage(image, 0, 0, canvas.width, canvas.height);

      return await new Promise((resolve, reject) => {
        canvas.toBlob((blob) => {
          if (blob) resolve(blob);
          else reject(new Error('Could not export the player card image.'));
        }, 'image/png');
      });
    } finally {
      URL.revokeObjectURL(svgUrl);
    }
  };

  const shareLink = async () => {
    setActionError('');
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({
          title: `${player.username}'s Life Leveling card`,
          text: `Check out ${player.username}'s progress in Life Leveling!`,
          url
        });
        return;
      }
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch (shareError) {
      if (shareError.name !== 'AbortError') {
        setActionError('Could not share the link. You can copy it from your browser address bar.');
      }
    }
  };

  const downloadStory = async () => {
    setActionError('');
    try {
      const blob = await getCardImage();
      const imageUrl = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = imageUrl;
      anchor.download = `life-leveling-${player.username}-story.png`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.setTimeout(() => URL.revokeObjectURL(imageUrl), 1000);
    } catch (downloadError) {
      setActionError(downloadError.message || 'Could not download the story image.');
    }
  };

  const shareCard = async () => {
    setActionError('');
    if (navigator.share && navigator.canShare) {
      try {
        const blob = await getCardImage();
        const file = new File([blob], `life-leveling-${player.username}-story.png`, { type: 'image/png' });
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: `${player.username}'s Life Leveling card`,
            text: `Check out ${player.username}'s progress in Life Leveling!`,
            url: window.location.href,
            files: [file]
          });
          return;
        }
      } catch (shareError) {
        if (shareError.name === 'AbortError') return;
        setActionError(shareError.message || 'Could not share the player card.');
        return;
      }
    }
    await shareLink();
  };

  if (loading) {
    return <main className="flex min-h-screen items-center justify-center bg-[#09100f] text-white">Loading player card…</main>;
  }

  if (error || !player) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#09100f] px-6 text-center text-white">
        <h1 className="text-2xl font-bold">Player card unavailable</h1>
        <p className="text-slate-300">{error || 'This player card could not be found.'}</p>
        <Link to="/register" className="rounded-xl bg-amber-400 px-5 py-3 font-bold text-slate-950">Start your own journey</Link>
      </main>
    );
  }

  const featuredAchievements = player.achievements?.length
    ? player.achievements
    : [{ key: 'journey', name: 'The journey starts here' }];

  return (
    <main className="min-h-screen bg-[#09100f] px-4 py-8 text-white sm:px-6">
      <div className="mx-auto grid max-w-5xl items-center gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
        <section className="mx-auto w-full max-w-[360px]">
          <svg
            ref={cardRef}
            viewBox="0 0 1080 1920"
            role="img"
            aria-label={`${player.username}, level ${player.level}, ${player.medal} medal`}
            className="h-auto w-full overflow-hidden rounded-[28px] shadow-[0_30px_100px_rgba(0,0,0,0.5)]"
            width="1080"
            height="1920"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient id="story-bg" x1="0" y1="0" x2="1" y2="1">
                <stop stopColor="#101d1b" />
                <stop offset="0.52" stopColor="#172922" />
                <stop offset="1" stopColor="#07100f" />
              </linearGradient>
              <linearGradient id="story-medal" x1="0" y1="0" x2="0.9" y2="1">
                <stop stopColor="#ffe6a6" />
                <stop offset="0.5" stopColor="#e6a047" />
                <stop offset="1" stopColor="#a14e2d" />
              </linearGradient>
              <linearGradient id="story-card" x1="0" y1="0" x2="1" y2="1">
                <stop stopColor="#21352e" />
                <stop offset="1" stopColor="#111d1a" />
              </linearGradient>
            </defs>
            <rect width="1080" height="1920" fill="url(#story-bg)" />
            <circle cx="950" cy="180" r="330" fill="#d89040" opacity="0.12" />
            <circle cx="65" cy="1440" r="360" fill="#70b88b" opacity="0.08" />
            <path d="M0 690C220 610 360 760 540 690s330-160 540-70v18c-210-90-360 10-540 80S220 650 0 710z" fill="#c8a266" opacity="0.14" />
            <text x="540" y="160" textAnchor="middle" fill="#d9ae68" fontFamily="Arial, sans-serif" fontSize="30" fontWeight="700" letterSpacing="12">LIFE LEVELING</text>
            <text x="540" y="255" textAnchor="middle" fill="#f5f1e5" fontFamily="Arial, sans-serif" fontSize="24" letterSpacing="6">PLAYER PROFILE</text>

            <circle cx="540" cy="570" r="205" fill="#0a1311" stroke="#d9a457" strokeWidth="5" />
            <circle cx="540" cy="570" r="176" fill="url(#story-medal)" />
            <circle cx="540" cy="570" r="148" fill="#12201c" stroke="#fff2d0" strokeOpacity="0.68" strokeWidth="3" />
            <text x="540" y="520" textAnchor="middle" fill="#d8b877" fontFamily="Arial, sans-serif" fontSize="28" fontWeight="700" letterSpacing="6">LEVEL</text>
            <text x="540" y="660" textAnchor="middle" fill="#fff8e8" fontFamily="Arial, sans-serif" fontSize="142" fontWeight="700">{formatStat(player.level)}</text>

            <text x="540" y="900" textAnchor="middle" fill="#fff8e8" fontFamily="Arial, sans-serif" fontSize="72" fontWeight="700">{shortText(player.username, 22)}</text>
            <text x="540" y="962" textAnchor="middle" fill="#d7b576" fontFamily="Arial, sans-serif" fontSize="30" fontWeight="700" letterSpacing="5">{player.medal.toUpperCase()} MEDAL</text>
            <text x="540" y="1020" textAnchor="middle" fill="#aebdb2" fontFamily="Arial, sans-serif" fontSize="30">{shortText(player.title, 30)}</text>

            <rect x="100" y="1100" width="880" height="245" rx="34" fill="url(#story-card)" stroke="#d7b576" strokeOpacity="0.28" strokeWidth="2" />
            <text x="245" y="1190" textAnchor="middle" fill="#d7b576" fontFamily="Arial, sans-serif" fontSize="24" fontWeight="700" letterSpacing="3">TOTAL XP</text>
            <text x="245" y="1270" textAnchor="middle" fill="#fff8e8" fontFamily="Arial, sans-serif" fontSize="56" fontWeight="700">{formatStat(player.xp)}</text>
            <path d="M390 1145v155" stroke="#d7b576" strokeOpacity="0.25" strokeWidth="2" />
            <text x="540" y="1190" textAnchor="middle" fill="#d7b576" fontFamily="Arial, sans-serif" fontSize="24" fontWeight="700" letterSpacing="3">DAY STREAK</text>
            <text x="540" y="1270" textAnchor="middle" fill="#fff8e8" fontFamily="Arial, sans-serif" fontSize="56" fontWeight="700">{formatStat(player.streak)}</text>
            <path d="M690 1145v155" stroke="#d7b576" strokeOpacity="0.25" strokeWidth="2" />
            <text x="835" y="1190" textAnchor="middle" fill="#d7b576" fontFamily="Arial, sans-serif" fontSize="24" fontWeight="700" letterSpacing="2">TASKS DONE</text>
            <text x="835" y="1270" textAnchor="middle" fill="#fff8e8" fontFamily="Arial, sans-serif" fontSize="56" fontWeight="700">{formatStat(player.completedTasks)}</text>

            <text x="120" y="1450" fill="#e8d8b7" fontFamily="Arial, sans-serif" fontSize="27" fontWeight="700" letterSpacing="4">RECENT MEDALS &amp; MILESTONES</text>
            {featuredAchievements.slice(0, 3).map((achievement, index) => (
              <g key={achievement.key}>
                <circle cx="150" cy={1535 + (index * 100)} r="18" fill="#e6a047" />
                <path d={`M142 ${1535 + (index * 100)}l6 7 12-15`} fill="none" stroke="#17231e" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                <text x="200" y={1545 + (index * 100)} fill="#f5f1e5" fontFamily="Arial, sans-serif" fontSize="34">{shortText(achievement.name, 34)}</text>
              </g>
            ))}
            <path d="M110 1770h860" stroke="#d7b576" strokeOpacity="0.25" strokeWidth="2" />
            <text x="540" y="1830" textAnchor="middle" fill="#c7d2c8" fontFamily="Arial, sans-serif" fontSize="27">Build your real-life stats. Level up every day.</text>
            <text x="540" y="1880" textAnchor="middle" fill="#d9ae68" fontFamily="Arial, sans-serif" fontSize="24" fontWeight="700" letterSpacing="4">JOIN THE JOURNEY</text>
          </svg>
        </section>

        <section className="mx-auto w-full max-w-md space-y-5">
          <Link to="/" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-300 transition hover:text-white">
            <ArrowLeft size={17} aria-hidden="true" /> Life Leveling
          </Link>
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.24em] text-amber-300">A life worth leveling</p>
            <h1 className="mt-2 text-3xl font-bold leading-tight sm:text-4xl">Look at {player.username}&apos;s progress.</h1>
            <p className="mt-3 text-slate-300">Level {player.level} · {player.title} · {player.medal} medal</p>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[
              ['XP', formatStat(player.xp)],
              ['Streak', formatStat(player.streak)],
              ['Tasks', formatStat(player.completedTasks)]
            ].map(([label, value]) => (
              <div key={label} className="rounded-2xl border border-white/10 bg-white/[0.06] p-4 text-center">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{label}</p>
                <p className="mt-1 text-xl font-bold text-white">{value}</p>
              </div>
            ))}
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <button onClick={shareCard} className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-400 px-4 py-3 font-bold text-slate-950 transition hover:bg-amber-300">
              <Share2 size={18} aria-hidden="true" /> Share player card
            </button>
            <button onClick={downloadStory} className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/[0.08] px-4 py-3 font-bold text-white transition hover:bg-white/[0.14]">
              <Download size={18} aria-hidden="true" /> Download story image
            </button>
            <button onClick={shareLink} className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 px-4 py-3 font-semibold text-slate-200 transition hover:bg-white/[0.08] sm:col-span-2">
              {copied ? <Check size={18} aria-hidden="true" /> : <Copy size={18} aria-hidden="true" />}
              {copied ? 'Link copied' : 'Share link'}
            </button>
          </div>
          {actionError && <p role="alert" className="text-sm text-rose-300">{actionError}</p>}
          <p className="text-xs leading-relaxed text-slate-500">This card shares your username, level, title, XP, streak, completed tasks, and up to three recent achievements. It never shows your email or private account details.</p>
          <Link to="/register" className="inline-flex font-semibold text-amber-300 hover:text-amber-200">Start leveling up yourself <span className="ml-1" aria-hidden="true">→</span></Link>
        </section>
      </div>
    </main>
  );
};
