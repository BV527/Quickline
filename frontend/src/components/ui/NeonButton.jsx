import { motion } from 'framer-motion';

const NeonButton = ({ 
  children, 
  onClick, 
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  ...props 
}) => {
  const variants = {
    primary: 'neon-button',
    secondary: 'bg-dark-card/50 border border-neon-purple/50 text-neon-purple hover:bg-neon-purple/10',
    ghost: 'bg-transparent border border-neon-purple/30 text-neon-purple hover:bg-neon-purple/10'
  };

  const sizes = {
    sm: 'py-2 px-4 text-sm rounded-xl',
    md: 'py-4 px-8 text-base rounded-2xl',
    lg: 'py-5 px-10 text-lg rounded-2xl'
  };

  return (
    <motion.button
      className={`${variants[variant]} ${sizes[size]} ${className} 
                  font-semibold transition-all duration-300 relative overflow-hidden
                  disabled:opacity-50 disabled:cursor-not-allowed`}
      onClick={onClick}
      disabled={disabled}
      whileHover={!disabled ? { scale: 1.05 } : {}}
      whileTap={!disabled ? { scale: 0.95 } : {}}
      {...props}
    >
      <span className="relative z-10">{children}</span>
      {variant === 'primary' && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
          initial={{ x: '-100%' }}
          whileHover={{ x: '100%' }}
          transition={{ duration: 0.7 }}
        />
      )}
    </motion.button>
  );
};

export default NeonButton;