import React from 'react';
import Icon from '@/components/ui/AppIcon';

interface PortCapacityCardProps {
  title: string;
  value: string;
  percentage: number;
  trend: 'up' | 'down' | 'stable';
  trendValue: string;
  color: 'blue' | 'green' | 'yellow' | 'purple';
  icon: string;
}

const PortCapacityCard = ({ 
  title, 
  value, 
  percentage, 
  trend, 
  trendValue, 
  color, 
  icon 
}: PortCapacityCardProps) => {
  const colorClasses = {
    blue: 'bg-gradient-to-br from-blue-500 to-blue-600',
    green: 'bg-gradient-to-br from-emerald-500 to-emerald-600',
    yellow: 'bg-gradient-to-br from-yellow-400 to-yellow-500',
    purple: 'bg-gradient-to-br from-purple-500 to-purple-600'
  };

  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return 'ArrowTrendingUpIcon';
      case 'down':
        return 'ArrowTrendingDownIcon';
      default:
        return 'MinusIcon';
    }
  };

  const getTrendColor = () => {
    switch (trend) {
      case 'up':
        return 'text-emerald-500';
      case 'down':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  return (
    <div className={`${colorClasses[color]} rounded-xl p-6 text-white relative overflow-hidden`}>
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <path d="M0,50 Q25,30 50,50 T100,50 L100,100 L0,100 Z" fill="currentColor" />
        </svg>
      </div>
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <Icon name={icon as any} size={24} className="text-white/80" />
          <div className={`flex items-center space-x-1 ${getTrendColor()}`}>
            <Icon name={getTrendIcon() as any} size={16} />
            <span className="text-sm font-medium">{trendValue}</span>
          </div>
        </div>
        
        <div className="mb-3">
          <h3 className="text-white/80 text-sm font-medium mb-1">{title}</h3>
          <p className="text-2xl font-bold">{value}</p>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full bg-white/20 rounded-full h-2">
          <div 
            className="bg-white rounded-full h-2 transition-all duration-500"
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </div>
        <div className="flex justify-between items-center mt-2">
          <span className="text-xs text-white/70">Utilization</span>
          <span className="text-xs font-medium">{percentage}%</span>
        </div>
      </div>
    </div>
  );
};

export default PortCapacityCard;