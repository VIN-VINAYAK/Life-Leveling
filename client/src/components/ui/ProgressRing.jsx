import { motion, useReducedMotion } from 'framer-motion';

export const ProgressRing = ({ value = 0, size = 104, strokeWidth = 8, label, className = '' }) => {
  const progress = Math.min(100, Math.max(0, Number(value) || 0));
  const reduceMotion = useReducedMotion();
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className={`progress-ring ${className}`} role="img" aria-label={`${label || 'Progress'}: ${Math.round(progress)}%`} style={{ width: size, height: size }}>
      <svg viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
        <circle className="progress-ring__track" cx={size / 2} cy={size / 2} r={radius} fill="none" strokeWidth={strokeWidth} />
        <motion.circle
          className="progress-ring__value"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={reduceMotion ? false : { strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference * (1 - progress / 100) }}
          transition={reduceMotion ? { duration: 0 } : { duration: 0.8, ease: 'easeOut' }}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <span className="progress-ring__label">
        <strong>{Math.round(progress)}%</strong>
        {label && <small>{label}</small>}
      </span>
    </div>
  );
};
