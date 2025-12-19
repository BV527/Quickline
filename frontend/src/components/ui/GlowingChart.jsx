import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';

const GlowingChart = ({ 
  data = [], 
  type = 'line', 
  dataKey = 'value',
  xAxisKey = 'name',
  color = '#8B5CF6',
  height = 200,
  showGrid = true,
  animated = true 
}) => {
  const chartProps = {
    data,
    margin: { top: 5, right: 30, left: 20, bottom: 5 }
  };

  const commonProps = {
    stroke: color,
    strokeWidth: 3,
    dot: false,
    activeDot: { 
      r: 6, 
      fill: color,
      stroke: color,
      strokeWidth: 2,
      filter: `drop-shadow(0 0 8px ${color})`
    }
  };

  const renderChart = () => {
    switch (type) {
      case 'area':
        return (
          <AreaChart {...chartProps}>
            {showGrid && (
              <>
                <XAxis 
                  dataKey={xAxisKey} 
                  axisLine={false} 
                  tickLine={false}
                  tick={{ fill: '#666', fontSize: 12 }}
                />
                <YAxis hide />
              </>
            )}
            <defs>
              <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.3}/>
                <stop offset="95%" stopColor={color} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <Area
              type="monotone"
              dataKey={dataKey}
              stroke={color}
              strokeWidth={2}
              fill="url(#colorGradient)"
              style={{ filter: `drop-shadow(0 0 8px ${color}40)` }}
            />
          </AreaChart>
        );
      
      case 'bar':
        return (
          <BarChart {...chartProps}>
            {showGrid && (
              <>
                <XAxis 
                  dataKey={xAxisKey} 
                  axisLine={false} 
                  tickLine={false}
                  tick={{ fill: '#666', fontSize: 12 }}
                />
                <YAxis hide />
              </>
            )}
            <Bar 
              dataKey={dataKey} 
              fill={color}
              radius={[4, 4, 0, 0]}
              style={{ filter: `drop-shadow(0 0 8px ${color}40)` }}
            />
          </BarChart>
        );
      
      default:
        return (
          <LineChart {...chartProps}>
            {showGrid && (
              <>
                <XAxis 
                  dataKey={xAxisKey} 
                  axisLine={false} 
                  tickLine={false}
                  tick={{ fill: '#666', fontSize: 12 }}
                />
                <YAxis hide />
              </>
            )}
            <Line
              type="monotone"
              dataKey={dataKey}
              {...commonProps}
              style={{ filter: `drop-shadow(0 0 8px ${color}40)` }}
            />
          </LineChart>
        );
    }
  };

  return (
    <motion.div
      initial={animated ? { opacity: 0, scale: 0.9 } : {}}
      animate={animated ? { opacity: 1, scale: 1 } : {}}
      transition={{ duration: 0.5 }}
      className="w-full"
      style={{ height }}
    >
      <ResponsiveContainer width="100%" height="100%">
        {renderChart()}
      </ResponsiveContainer>
    </motion.div>
  );
};

export default GlowingChart;