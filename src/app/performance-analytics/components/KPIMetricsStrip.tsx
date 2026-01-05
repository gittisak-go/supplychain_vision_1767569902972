'use client';

import React from 'react';
import Icon from '@/components/ui/AppIcon';

interface KPIMetric {
  id: string;
  title: string;
  value: string;
  change: number;
  trend: 'up' | 'down' | 'stable';
  sparklineData: number[];
  color: string;
  icon: string;
}

interface KPIMetricsStripProps {
  metrics: KPIMetric[];
}

const KPIMetricsStrip = ({ metrics }: KPIMetricsStripProps) => {
  const renderSparkline = (data: number[], color: string) => {
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;
    
    const points = data.map((value, index) => {
      const x = (index / (data.length - 1)) * 100;
      const y = 100 - ((value - min) / range) * 100;
      return `${x},${y}`;
    }).join(' ');

    return (
      <svg className="w-16 h-8" viewBox="0 0 100 100" preserveAspectRatio="none">
        <polyline
          fill="none"
          stroke={color}
          strokeWidth="3"
          points={points}
          className="opacity-60"
        />
      </svg>
    );
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return 'ArrowTrendingUpIcon';
      case 'down':
        return 'ArrowTrendingDownIcon';
      default:
        return 'MinusIcon';
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up':
        return 'text-success';
      case 'down':
        return 'text-error';
      default:
        return 'text-muted-foreground';
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {metrics.map((metric) => (
        <div
          key={metric.id}
          className={`bg-gradient-to-br ${metric.color} rounded-xl p-6 text-white shadow-card hover:shadow-modal transition-smooth`}
        >
          <div className="flex items-center justify-between mb-4">
            <div className={`w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center`}>
              <Icon name={metric.icon as any} size={24} className="text-white" />
            </div>
            <div className="flex items-center space-x-2">
              <Icon 
                name={getTrendIcon(metric.trend) as any} 
                size={16} 
                className={getTrendColor(metric.trend)}
              />
              <span className={`text-sm font-medium ${getTrendColor(metric.trend)}`}>
                {metric.change > 0 ? '+' : ''}{metric.change}%
              </span>
            </div>
          </div>
          
          <div className="mb-3">
            <h3 className="text-sm font-medium opacity-90 mb-1">{metric.title}</h3>
            <p className="text-2xl font-bold">{metric.value}</p>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-xs opacity-75">Last 7 days</span>
            {renderSparkline(metric.sparklineData, 'rgba(255,255,255,0.8)')}
          </div>
        </div>
      ))}
    </div>
  );
};

export default KPIMetricsStrip;