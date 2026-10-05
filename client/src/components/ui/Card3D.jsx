import { useRef } from 'react';
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from 'framer-motion';

export const Card3D = ({ children, className = '', as = 'div', style: elementStyle, ...props }) => {
  const elementRef = useRef(null);
  const reduceMotion = useReducedMotion();
  const rotateXMotion = useMotionValue(0);
  const rotateYMotion = useMotionValue(0);
  const rotateX = useSpring(rotateXMotion, { stiffness: 180, damping: 24, mass: 0.5 });
  const rotateY = useSpring(rotateYMotion, { stiffness: 180, damping: 24, mass: 0.5 });
  const glareOpacity = useTransform(rotateX, [-8, 0, 8], [0.16, 0, 0.16]);
  const MotionElement = motion[as] || motion.div;

  const resetTilt = () => {
    rotateXMotion.set(0);
    rotateYMotion.set(0);
  };

  const handlePointerMove = (event) => {
    if (reduceMotion || event.pointerType === 'touch' || !elementRef.current) return;
    const bounds = elementRef.current.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width;
    const y = (event.clientY - bounds.top) / bounds.height;
    rotateXMotion.set((0.5 - y) * 14);
    rotateYMotion.set((x - 0.5) * 14);
  };

  return (
    <MotionElement
      ref={elementRef}
      className={`depth-card ${className}`}
      onPointerMove={handlePointerMove}
      onPointerLeave={resetTilt}
      style={{
        ...elementStyle,
        rotateX: reduceMotion ? 0 : rotateX,
        rotateY: reduceMotion ? 0 : rotateY,
        transformPerspective: 1000,
        transformStyle: 'preserve-3d'
      }}
      {...props}
    >
      <motion.span className="depth-card__glare" style={{ opacity: reduceMotion ? 0 : glareOpacity }} aria-hidden="true" />
      <div className="depth-card__content">{children}</div>
    </MotionElement>
  );
};
