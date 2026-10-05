import { motion, useReducedMotion } from 'framer-motion';

export const Reveal = ({ children, className = '', delay = 0, ...props }) => {
  const reduceMotion = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: reduceMotion ? 0 : 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.12 }}
      transition={{ duration: reduceMotion ? 0.12 : 0.42, delay, ease: [0.22, 1, 0.36, 1] }}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export const Stagger = ({ children, className = '', ...props }) => (
  <motion.div
    className={className}
    variants={{
      hidden: {},
      visible: { transition: { staggerChildren: 0.07, delayChildren: 0.04 } }
    }}
    initial="hidden"
    animate="visible"
    {...props}
  >
    {children}
  </motion.div>
);

export const StaggerItem = ({ children, className = '', ...props }) => {
  const reduceMotion = useReducedMotion();
  return (
    <motion.div
      className={className}
      variants={{
        hidden: { opacity: 0, y: reduceMotion ? 0 : 12 },
        visible: { opacity: 1, y: 0, transition: { duration: reduceMotion ? 0.12 : 0.35, ease: [0.22, 1, 0.36, 1] } }
      }}
      {...props}
    >
      {children}
    </motion.div>
  );
};
