import { motion, useReducedMotion } from 'framer-motion';

export const PageTransition = ({ children }) => {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className="page-transition w-full"
      initial={{ opacity: 0, y: reduceMotion ? 0 : 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: reduceMotion ? 0 : -4 }}
      transition={{ duration: reduceMotion ? 0.12 : 0.3, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
};
