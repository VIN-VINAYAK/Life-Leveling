import { useEffect, useRef, useState } from 'react';

const SplashScreen = ({ onComplete }) => {
  const completedRef = useRef(false);
  const timersRef = useRef([]);
  const [isExiting, setIsExiting] = useState(false);

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
    <div
      className={`splash-screen${isExiting ? ' splash-screen--exiting' : ''}`}
      role="presentation"
      onPointerDown={handlePointerDown}
    >
      <div className="splash-screen__wash" />
      <div className="splash-screen__grain" />
      <header className="splash-screen__header">
        <span className="splash-screen__mark">L/L</span>
        <span className="splash-screen__edition">PERSONAL SYSTEM / 001</span>
      </header>
      <div className="splash-screen__title">
        <span className="splash-screen__eyebrow">MAKE THE NEXT MOVE</span>
        <h1>LIFE LEVELING</h1>
        <p>LEVEL UP YOUR LIFE</p>
      </div>
      <div className="splash-screen__footer">
        <span>BUILD YOUR MOMENTUM</span>
        <span className="splash-screen__rule" />
        <span>01</span>
      </div>
    </div>
  );
};

export default SplashScreen;