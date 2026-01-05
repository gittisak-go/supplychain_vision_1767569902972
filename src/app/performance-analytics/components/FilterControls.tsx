'use client';

import React, { useState } from 'react';
import Icon from '@/components/ui/AppIcon';

interface FilterOption {
  value: string;
  label: string;
}

interface FilterControlsProps {
  onDateModeChange: (mode: string) => void;
  onMetricChange: (metric: string) => void;
  onAlertConfigOpen: () => void;
}

const FilterControls = ({ onDateModeChange, onMetricChange, onAlertConfigOpen }: FilterControlsProps) => {
  const [selectedDateMode, setSelectedDateMode] = useState('period-over-period');
  const [selectedMetric, setSelectedMetric] = useState('delivery-performance');

  const dateModes: FilterOption[] = [
    { value: 'period-over-period', label: 'Period-over-Period' },
    { value: 'year-over-year', label: 'Year-over-Year' },
    { value: 'quarter-comparison', label: 'Quarter Comparison' },
    { value: 'monthly-trends', label: 'Monthly Trends' }
  ];

  const performanceMetrics: FilterOption[] = [
    { value: 'delivery-performance', label: 'Delivery Performance' },
    { value: 'cost-analysis', label: 'Cost Analysis' },
    { value: 'vendor-performance', label: 'Vendor Performance' },
    { value: 'route-efficiency', label: 'Route Efficiency' },
    { value: 'predictive-analytics', label: 'Predictive Analytics' }
  ];

  const handleDateModeChange = (mode: string) => {
    setSelectedDateMode(mode);
    onDateModeChange(mode);
  };

  const handleMetricChange = (metric: string) => {
    setSelectedMetric(metric);
    onMetricChange(metric);
  };

  return (
    <div className="bg-card rounded-lg p-6 shadow-card mb-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
          {/* Date Comparison Mode */}
          <div className="flex flex-col space-y-2">
            <label className="text-sm font-medium text-foreground">Date Comparison</label>
            <div className="relative">
              <select
                value={selectedDateMode}
                onChange={(e) => handleDateModeChange(e.target.value)}
                className="appearance-none bg-muted border border-border rounded-lg px-4 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-smooth"
              >
                {dateModes.map((mode) => (
                  <option key={mode.value} value={mode.value}>
                    {mode.label}
                  </option>
                ))}
              </select>
              <Icon 
                name="ChevronDownIcon" 
                size={16} 
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground pointer-events-none"
              />
            </div>
          </div>

          {/* Performance Metric Selector */}
          <div className="flex flex-col space-y-2">
            <label className="text-sm font-medium text-foreground">Performance Metric</label>
            <div className="relative">
              <select
                value={selectedMetric}
                onChange={(e) => handleMetricChange(e.target.value)}
                className="appearance-none bg-muted border border-border rounded-lg px-4 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-smooth"
              >
                {performanceMetrics.map((metric) => (
                  <option key={metric.value} value={metric.value}>
                    {metric.label}
                  </option>
                ))}
              </select>
              <Icon 
                name="ChevronDownIcon" 
                size={16} 
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground pointer-events-none"
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-3">
          <button
            onClick={onAlertConfigOpen}
            className="flex items-center space-x-2 px-4 py-2 bg-warning text-warning-foreground rounded-lg hover:bg-warning/90 transition-smooth"
          >
            <Icon name="BellIcon" size={16} />
            <span className="text-sm font-medium">Alert Config</span>
          </button>
          
          <button className="flex items-center space-x-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-smooth">
            <Icon name="ArrowDownTrayIcon" size={16} />
            <span className="text-sm font-medium">Export</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilterControls;