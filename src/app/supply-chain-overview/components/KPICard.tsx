import React from 'react';
import Icon from '@/components/ui/AppIcon';

interface KPICardProps {
  title: string;
  value: string | number;
  change: number;
  changeType: 'increase' | 'decrease';
  icon: string;
  gradient: string;
  subtitle?: string;
}

const KPICard = ({ title, value, change, changeType, icon, gradient, subtitle }: KPICardProps) => {
  const isPositive = changeType === 'increase';
  
  return (
    <div className={`relative overflow-hidden rounded-xl p-6 text-white ${gradient}`}>
      {/* Background Wave Pattern */}
      <div className="absolute inset-0 opacity-20">
        <svg className="absolute bottom-0 left-0 w-full h-20" viewBox="0 0 400 100" preserveAspectRatio="none">
          <path d="M0,50 Q100,20 200,50 T400,50 L400,100 L0,100 Z" fill="currentColor" />
        </svg>
      </div>
      
      {/* Content */}
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="p-2 bg-white/20 rounded-lg">
            <Icon name={icon as any} size={24} className="text-white" />
          </div>
          <div className={`flex items-center space-x-1 text-sm ${isPositive ? 'text-green-200' : 'text-red-200'}`}>
            <Icon 
              name={isPositive ? 'ArrowUpIcon' : 'ArrowDownIcon'} 
              size={16} 
            />
            <span>{Math.abs(change)}%</span>
          </div>
        </div>
        
        <div className="space-y-1">
          <h3 className="text-2xl font-bold">{value}</h3>
          <p className="text-white/80 text-sm">{title}</p>
          {subtitle && (
            <p className="text-white/60 text-xs">{subtitle}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default KPICard;