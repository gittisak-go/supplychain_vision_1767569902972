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
  onDateRangeChange: (range: { start: string; end: string }) => void;
  onExport: (format: 'csv' | 'excel' | 'pdf') => void;
}

const FilterControls = ({ 
  onDateModeChange, 
  onMetricChange, 
  onAlertConfigOpen,
  onDateRangeChange,
  onExport 
}: FilterControlsProps) => {
  const [selectedDateMode, setSelectedDateMode] = useState('period-over-period');
  const [selectedMetric, setSelectedMetric] = useState('delivery-performance');
  const [customDateRange, setCustomDateRange] = useState({ start: '', end: '' });
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);

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

  const handleCustomDateRangeChange = (field: 'start' | 'end', value: string) => {
    const newRange = { ...customDateRange, [field]: value };
    setCustomDateRange(newRange);
    if (newRange.start && newRange.end) {
      onDateRangeChange(newRange);
    }
  };

  const handleExport = (format: 'csv' | 'excel' | 'pdf') => {
    onExport(format);
    setShowExportMenu(false);
  };

  return (
    <div className="bg-card rounded-lg p-6 shadow-card mb-6">
      <div className="flex flex-col space-y-4">
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
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className="flex items-center space-x-2 px-4 py-2 border border-border rounded-lg hover:bg-muted/50 transition-smooth"
            >
              <Icon name="FunnelIcon" size={16} />
              <span className="text-sm font-medium">Advanced Filters</span>
            </button>

            <button
              onClick={onAlertConfigOpen}
              className="flex items-center space-x-2 px-4 py-2 bg-warning text-warning-foreground rounded-lg hover:bg-warning/90 transition-smooth"
            >
              <Icon name="BellIcon" size={16} />
              <span className="text-sm font-medium">Alert Config</span>
            </button>
            
            <div className="relative">
              <button 
                onClick={() => setShowExportMenu(!showExportMenu)}
                className="flex items-center space-x-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-smooth"
              >
                <Icon name="ArrowDownTrayIcon" size={16} />
                <span className="text-sm font-medium">Export</span>
              </button>

              {showExportMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-card rounded-lg shadow-lg border border-border z-10">
                  <button
                    onClick={() => handleExport('csv')}
                    className="w-full text-left px-4 py-2 hover:bg-muted/50 transition-smooth text-sm rounded-t-lg"
                  >
                    Export as CSV
                  </button>
                  <button
                    onClick={() => handleExport('excel')}
                    className="w-full text-left px-4 py-2 hover:bg-muted/50 transition-smooth text-sm"
                  >
                    Export as Excel
                  </button>
                  <button
                    onClick={() => handleExport('pdf')}
                    className="w-full text-left px-4 py-2 hover:bg-muted/50 transition-smooth text-sm rounded-b-lg"
                  >
                    Export as PDF
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Advanced Filters Panel */}
        {showAdvancedFilters && (
          <div className="border-t border-border pt-4 space-y-4">
            <h4 className="text-sm font-semibold text-foreground mb-3">Advanced Filtering Options</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Custom Date Range */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Custom Date Range</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="date"
                    value={customDateRange.start}
                    onChange={(e) => handleCustomDateRangeChange('start', e.target.value)}
                    className="flex-1 px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="Start Date"
                  />
                  <span className="text-muted-foreground">to</span>
                  <input
                    type="date"
                    value={customDateRange.end}
                    onChange={(e) => handleCustomDateRangeChange('end', e.target.value)}
                    className="flex-1 px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="End Date"
                  />
                </div>
              </div>

              {/* Quick Date Presets */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Quick Date Presets</label>
                <div className="grid grid-cols-2 gap-2">
                  {['Last 7 Days', 'Last 30 Days', 'Last Quarter', 'Last Year'].map((preset) => (
                    <button
                      key={preset}
                      onClick={() => {
                        const today = new Date();
                        let startDate = new Date();
                        
                        if (preset === 'Last 7 Days') startDate.setDate(today.getDate() - 7);
                        else if (preset === 'Last 30 Days') startDate.setDate(today.getDate() - 30);
                        else if (preset === 'Last Quarter') startDate.setMonth(today.getMonth() - 3);
                        else if (preset === 'Last Year') startDate.setFullYear(today.getFullYear() - 1);

                        const range = {
                          start: startDate.toISOString().split('T')[0],
                          end: today.toISOString().split('T')[0]
                        };
                        setCustomDateRange(range);
                        onDateRangeChange(range);
                      }}
                      className="px-3 py-2 text-xs border border-border rounded-lg hover:bg-muted/50 transition-smooth"
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              {/* Filter Summary */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Active Filters</label>
                <div className="bg-muted/30 rounded-lg p-3 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Date Mode:</span>
                    <span className="font-medium text-foreground">{selectedDateMode}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Metric:</span>
                    <span className="font-medium text-foreground">{selectedMetric}</span>
                  </div>
                  {customDateRange.start && customDateRange.end && (
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Range:</span>
                      <span className="font-medium text-foreground">
                        {customDateRange.start} to {customDateRange.end}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowAdvancedFilters(false)}
                className="text-sm text-primary hover:text-primary/80 font-medium transition-smooth"
              >
                Hide Advanced Filters
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FilterControls;