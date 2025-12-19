import { motion } from 'framer-motion';
import { useState } from 'react';

const NeonInput = ({ 
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
  icon: Icon,
  className = '',
  ...props 
}) => {
  const [focused, setFocused] = useState(false);

  return (
    <motion.div 
      className={`relative ${className}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {label && (
        <label className="block text-sm font-medium text-gray-300 mb-2">
          {label}
        </label>
      )}
      
      <div className="relative">
        {Icon && (
          <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
            <Icon size={20} />
          </div>
        )}
        
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className={`neon-input ${Icon ? 'pl-12' : ''} ${
            error ? 'border-red-500 focus:border-red-500 focus:shadow-red-500/20' : ''
          }`}
          {...props}
        />
        
        {focused && (
          <motion.div
            className="absolute inset-0 rounded-2xl border border-neon-purple/50 pointer-events-none"
            initial={{ opacity: 0, scale: 1.02 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            style={{
              boxShadow: '0 0 20px rgba(139, 92, 246, 0.3)'
            }}
          />
        )}
      </div>
      
      {error && (
        <motion.p
          className="mt-2 text-sm text-red-400"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {error}
        </motion.p>
      )}
    </motion.div>
  );
};

export default NeonInput;