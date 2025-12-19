import { motion } from 'framer-motion';

const GlassCard = ({ 
  children, 
  className = '', 
  variant = 'default',
  hover = true,
  ...props 
}) => {
  const variants = {
    default: 'glass-card',
    primary: 'glass-card-primary',
    success: 'glass-card-success',
    warning: 'glass-card-warning'
  };

  return (
    <motion.div
      className={`${variants[variant]} ${className}`}
      whileHover={hover ? { y: -4, scale: 1.01 } : {}}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export default GlassCard;