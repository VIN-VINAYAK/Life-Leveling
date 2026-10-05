import { motion, useReducedMotion } from 'framer-motion';

export const PressableButton = ({ children, className = '', ...props }) => {
  const reduceMotion = useReducedMotion();
  return (
    <motion.button
      className={className}
      whileHover={reduceMotion ? undefined : { y: -2 }}
      whileTap={reduceMotion ? undefined : { scale: 0.98, y: 1 }}
      transition={{ type: 'spring', stiffness: 420, damping: 28 }}
      {...props}
    >
      {children}
    </motion.button>
  );
};
