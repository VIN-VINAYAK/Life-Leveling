import { useEffect } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { X } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export const ModalDrawer = ({ open, onClose, title, children, side = 'right' }) => {
  const reduceMotion = useReducedMotion();
  const { t } = useLanguage();

  useEffect(() => {
    if (!open) return undefined;
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="modal-layer" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: reduceMotion ? 0.1 : 0.2 }}>
          <button className="modal-backdrop" type="button" onClick={onClose} aria-label={t('Close dialog')} />
          <motion.section
            className={`modal-panel modal-panel--${side}`}
            role="dialog"
            aria-modal="true"
            aria-label={title}
            initial={reduceMotion ? { opacity: 0 } : side === 'bottom' ? { y: '100%' } : { x: side === 'left' ? '-100%' : '100%' }}
            animate={reduceMotion ? { opacity: 1 } : side === 'bottom' ? { y: 0 } : { x: 0 }}
            exit={reduceMotion ? { opacity: 0 } : side === 'bottom' ? { y: '100%' } : { x: side === 'left' ? '-100%' : '100%' }}
            transition={reduceMotion ? { duration: 0.12 } : { type: 'spring', stiffness: 320, damping: 32 }}
          >
            <header className="modal-panel__header">
              <h2>{title}</h2>
              <button type="button" className="modal-close" onClick={onClose} aria-label={t('Close dialog')}><X size={18} /></button>
            </header>
            <div className="modal-panel__content">{children}</div>
          </motion.section>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
