import { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';

const SplashScreen = ({ onComplete }) => {
  const completedRef = useRef(false);
  const timersRef = useRef([]);
  const [isExiting, setIsExiting] = useState(false);
  const reduceMotion = useReducedMotion();
  const { t } = useLanguage();

  const scheduleCompletion = (duration) => {
    const exitDuration = 180;
    timersRef.current = [
      window.setTimeout(() => setIsExiting(true), duration - exitDuration),
      window.setTimeout(onComplete, duration),
    ];
  };

  useEffect(() => {
    scheduleCompletion(1500);

    return () => timersRef.current.forEach((timer) => window.clearTimeout(timer));
  }, []);

  const handlePointerDown = () => {
    if (completedRef.current) return;

    completedRef.current = true;
    timersRef.current.forEach((timer) => window.clearTimeout(timer));
    scheduleCompletion(700);
  };

  return (
    <motion.div
      className={`splash-screen${isExiting ? ' splash-screen--exiting' : ''}`}
      role="presentation"
      onPointerDown={handlePointerDown}
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: reduceMotion ? 0.12 : 0.28, ease: 'easeOut' }}
    >
      <div className="splash-screen__wash" />
      <div className="splash-screen__grain" />
      <header className="splash-screen__header">
        <span className="splash-screen__mark">L/L</span>
        <span className="splash-screen__edition">{t('PERSONAL SYSTEM / 001')}</span>
      </header>
      <div className="splash-screen__title">
        <span className="splash-screen__eyebrow">{t('MAKE THE NEXT MOVE')}</span>
        <h1>LIFE LEVELING</h1>
        <p>{t('LEVEL UP YOUR LIFE')}</p>
      </div>
      <div className="splash-screen__footer">
        <span>{t('BUILD YOUR MOMENTUM')}</span>
        <span className="splash-screen__rule" />
        <span>01</span>
      </div>
    </motion.div>
  );
};

export default SplashScreen;