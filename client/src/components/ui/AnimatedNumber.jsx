import { useEffect, useState } from 'react';
import { animate, useMotionValue, useReducedMotion, useSpring, useMotionValueEvent } from 'framer-motion';

export const AnimatedNumber = ({ value = 0, decimals = 0, suffix = '', className = '' }) => {
  const target = Number.isFinite(Number(value)) ? Number(value) : 0;
  const reduceMotion = useReducedMotion();
  const motionValue = useMotionValue(target);
  const springValue = useSpring(motionValue, { stiffness: 90, damping: 24 });
  const [display, setDisplay] = useState(target);

  useMotionValueEvent(springValue, 'change', (latest) => setDisplay(latest));

  useEffect(() => {
    if (reduceMotion) {
      motionValue.set(target);
      return undefined;
    }
    const controls = animate(motionValue, target, { duration: 0.7, ease: 'easeOut' });
    return () => controls.stop();
  }, [motionValue, reduceMotion, target]);

  return (
    <span className={className} aria-label={`${target.toFixed(decimals)}${suffix}`}>
      {display.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}{suffix}
    </span>
  );
};
