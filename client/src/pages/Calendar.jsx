import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { CalendarDays, Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { statsAPI } from '../services/api';
import { PageSkeleton } from '../components/ui/Skeleton';
import { GlassCard } from '../components/ui/GlassCard';
import { useLanguage } from '../context/LanguageContext';

const dateKey = (date) => [
  date.getFullYear(),
  String(date.getMonth() + 1).padStart(2, '0'),
  String(date.getDate()).padStart(2, '0')
].join('-');

const monthKey = (date) => date.getFullYear() * 12 + date.getMonth();
const today = new Date();

export const Calendar = () => {
  const { language, t } = useLanguage();
  const locale = language === 'hi' ? 'hi-IN' : undefined;
  const [stats, setStats] = useState(null);
  const [viewDate, setViewDate] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedDate, setSelectedDate] = useState(dateKey(today));

  useEffect(() => {
    const load = async () => {
      try {
        const response = await statsAPI.getStats();
        setStats(response.data);
      } catch (error) {
        console.error('Unable to load calendar data:', error);
      }
    };
    load();
  }, []);

  const historyByDate = useMemo(() => new Map(
    (stats?.streakHistory || []).map((entry) => [dateKey(new Date(entry.date)), entry])
  ), [stats]);

  if (!stats) return <PageSkeleton />;

  const monthStart = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1);
  const leadingDays = (monthStart.getDay() + 6) % 7;
  const calendarStart = new Date(monthStart);
  calendarStart.setDate(monthStart.getDate() - leadingDays);
  const calendarDays = Array.from({ length: 42 }, (_, index) => {
    const date = new Date(calendarStart);
    date.setDate(calendarStart.getDate() + index);
    return date;
  });
  const historyDates = [...historyByDate.keys()].sort();
  const oldestHistoryDate = historyDates.length ? new Date(`${historyDates[0]}T00:00:00`) : today;
  const earliestMonth = monthKey(oldestHistoryDate);
  const latestMonth = monthKey(today);
  const canGoPrevious = monthKey(viewDate) > earliestMonth;
  const canGoNext = monthKey(viewDate) < latestMonth;
  const selectedEntry = historyByDate.get(selectedDate);
  const selectedDateLabel = new Date(`${selectedDate}T00:00:00`).toLocaleDateString(locale, {
    weekday: 'long',
    month: 'long',
    day: 'numeric'
  });

  const changeMonth = (amount) => {
    const nextMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() + amount, 1);
    setViewDate(nextMonth);
    setSelectedDate(dateKey(nextMonth));
  };

  return (
    <main className="page-container calendar-page">
      <header className="page-heading calendar-heading">
        <div>
          <p className="section-eyebrow"><CalendarDays size={15} /> {t('YOUR ACTIVITY')}</p>
          <h1>{t('Calendar')}</h1>
          <p>{t('See your daily habit momentum at a glance.')}</p>
        </div>
      </header>

      <GlassCard className="calendar-panel">
        <div className="calendar-toolbar">
          <div>
            <p className="calendar-toolbar__eyebrow">{t('MONTH VIEW')}</p>
            <h2>{viewDate.toLocaleDateString(locale, { month: 'long', year: 'numeric' })}</h2>
          </div>
          <div className="calendar-toolbar__controls" aria-label={t('Calendar month navigation')}>
            <button
              type="button"
              className="calendar-nav-button"
              onClick={() => changeMonth(-1)}
              disabled={!canGoPrevious}
              aria-label={t('Previous month')}
            >
              <ChevronLeft size={19} />
            </button>
            <button
              type="button"
              className="calendar-nav-button"
              onClick={() => changeMonth(1)}
              disabled={!canGoNext}
              aria-label={t('Next month')}
            >
              <ChevronRight size={19} />
            </button>
          </div>
        </div>

        <div className="calendar-weekdays" aria-hidden="true">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => <span key={day}>{new Date(`2024-01-${({ Mon: '01', Tue: '02', Wed: '03', Thu: '04', Fri: '05', Sat: '06', Sun: '07' })[day]}T00:00:00`).toLocaleDateString(locale, { weekday: 'short' })}</span>)}
        </div>
        <div className="calendar-month-grid" aria-label={viewDate.toLocaleDateString(locale, { month: 'long', year: 'numeric' })}>
          {calendarDays.map((date) => {
            const key = dateKey(date);
            const inMonth = date.getMonth() === viewDate.getMonth();
            const entry = historyByDate.get(key);
            const isToday = key === dateKey(today);
            const isSelected = key === selectedDate;
            const classes = [
              'calendar-date',
              !inMonth && 'calendar-date--outside',
              entry?.allCompleted && 'calendar-date--complete',
              entry && !entry.allCompleted && 'calendar-date--incomplete',
              isToday && 'calendar-date--today',
              isSelected && 'calendar-date--selected'
            ].filter(Boolean).join(' ');

            return (
              <motion.button
                key={key}
                type="button"
                className={classes}
                disabled={!inMonth}
                aria-label={`${date.toLocaleDateString(locale, { month: 'long', day: 'numeric' })}${entry ? entry.allCompleted ? `, ${t('all habits completed')}` : `, ${t('habits not all completed')}` : `, ${t('no activity data')}`}`}
                aria-pressed={isSelected}
                onClick={() => setSelectedDate(key)}
                whileHover={inMonth ? { y: -2 } : undefined}
                whileTap={inMonth ? { scale: 0.97 } : undefined}
              >
                <span className="calendar-date__number">{date.getDate()}</span>
                {entry && (
                  <span className="calendar-date__marker" aria-hidden="true">
                    {entry.allCompleted ? <Check size={12} strokeWidth={3} /> : <span />}
                  </span>
                )}
              </motion.button>
            );
          })}
        </div>

        <div className="calendar-legend" aria-label={t('Calendar legend')}>
          <span><i className="calendar-legend__complete"><Check size={10} /></i> {t('All habits complete')}</span>
          <span><i className="calendar-legend__incomplete" /> {t('Not all complete')}</span>
          <span><i className="calendar-legend__none" /> {t('No history')}</span>
        </div>

        <div className="calendar-selection" aria-live="polite">
          <div className="calendar-selection__date">
            <span className="calendar-selection__icon"><CalendarDays size={18} /></span>
            <div><small>{t('SELECTED DAY')}</small><strong>{selectedDateLabel}</strong></div>
          </div>
          <p>
            {selectedEntry
              ? selectedEntry.allCompleted ? t('All your habits were completed. Great consistency.') : t('You did not complete every habit tracked that day.')
              : t('Activity details are not available for this day.')}
          </p>
        </div>
      </GlassCard>
    </main>
  );
};
