export const GlassCard = ({ children, className = '', as: Element = 'section', ...props }) => (
  <Element className={`glass ${className}`} {...props}>
    {children}
  </Element>
);
