import { motion } from 'framer-motion';

const NeonCard = ({ 
  children, 
  className = '', 
  glowColor = 'neon-purple',
  hover = true,
  ...props 
}) => {
  return (
    <motion.div
      className={`neon-card ${className}`}
      whileHover={hover ? { y: -8, scale: 1.02 } : {}}
      whileTap={hover ? { scale: 0.98 } : {}}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      style={{
        boxShadow: `0 8px 32px rgba(139, 92, 246, 0.1), 0 0 0 1px rgba(255, 255, 255, 0.05)`
      }}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export default NeonCard;