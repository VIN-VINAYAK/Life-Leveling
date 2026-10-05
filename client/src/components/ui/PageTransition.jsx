import { motion, useReducedMotion } from 'framer-motion';

export const PageTransition = ({ children }) => {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className="page-transition w-full"
      initial={{ opacity: 0, y: reduceMotion ? 0 : 12, rotateX: reduceMotion ? 0 : -1.5, filter: reduceMotion ? 'none' : 'blur(3px)' }}
      animate={{ opacity: 1, y: 0, rotateX: 0, filter: 'blur(0px)' }}
      exit={{ opacity: 0, y: reduceMotion ? 0 : -6, rotateX: 0, filter: 'blur(1px)' }}
      transition={{ duration: reduceMotion ? 0.12 : 0.3, ease: [0.22, 1, 0.36, 1] }}
      style={{ transformOrigin: 'top center', backfaceVisibility: 'hidden' }}
    >
      {children}
    </motion.div>
  );
};
