'use client';

import React, { useState } from 'react';
import Icon from '@/components/ui/AppIcon';

interface PortAnalyticsHeaderProps {
  onPortChange: (port: string) => void;
  onTimeRangeChange: (range: string) => void;
  onAlertsToggle: (enabled: boolean) => void;
}

const PortAnalyticsHeader = ({ 
  onPortChange, 
  onTimeRangeChange, 
  onAlertsToggle 
}: PortAnalyticsHeaderProps) => {
  const [selectedPort, setSelectedPort] = useState('all');
  const [selectedTimeRange, setSelectedTimeRange] = useState('current-shift');
  const [alertsEnabled, setAlertsEnabled] = useState(true);

  const ports = [
    { value: 'all', label: 'All Ports' },
    { value: 'port-la', label: 'Port of Los Angeles' },
    { value: 'port-lb', label: 'Port of Long Beach' },
    { value: 'port-ny', label: 'Port of New York' },
    { value: 'port-sav', label: 'Port of Savannah' },
    { value: 'port-sea', label: 'Port of Seattle' }
  ];

  const timeRanges = [
    { value: 'current-shift', label: 'Current Shift' },
    { value: 'last-24h', label: 'Last 24 Hours' },
    { value: 'last-week', label: 'Last Week' },
    { value: 'last-month', label: 'Last Month' }
  ];

  const handlePortChange = (port: string) => {
    setSelectedPort(port);
    onPortChange(port);
  };

  const handleTimeRangeChange = (range: string) => {
    setSelectedTimeRange(range);
    onTimeRangeChange(range);
  };

  const handleAlertsToggle = () => {
    const newState = !alertsEnabled;
    setAlertsEnabled(newState);
    onAlertsToggle(newState);
  };

  return (
    <div className="mb-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        {/* Title Section */}
        <div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Port Analytics Dashboard</h1>
          <p className="text-muted-foreground">Monitor capacity utilization and operational efficiency across port facilities</p>
        </div>

        {/* Controls Section */}
        <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
          {/* Port Selector */}
          <div className="relative">
            <label className="block text-sm font-medium text-foreground mb-1">Port Selection</label>
            <div className="relative">
              <select
                value={selectedPort}
                onChange={(e) => handlePortChange(e.target.value)}
                className="appearance-none bg-input border border-border rounded-lg px-4 py-2 pr-10 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-smooth min-w-48"
              >
                {ports.map((port) => (
                  <option key={port.value} value={port.value}>
                    {port.label}
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

          {/* Time Range Picker */}
          <div className="relative">
            <label className="block text-sm font-medium text-foreground mb-1">Time Range</label>
            <div className="relative">
              <select
                value={selectedTimeRange}
                onChange={(e) => handleTimeRangeChange(e.target.value)}
                className="appearance-none bg-input border border-border rounded-lg px-4 py-2 pr-10 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-smooth min-w-40"
              >
                {timeRanges.map((range) => (
                  <option key={range.value} value={range.value}>
                    {range.label}
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

          {/* Alerts Toggle */}
          <div className="flex flex-col">
            <label className="block text-sm font-medium text-foreground mb-1">Capacity Alerts</label>
            <button
              onClick={handleAlertsToggle}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-smooth ${
                alertsEnabled
                  ? 'bg-success text-success-foreground border-success'
                  : 'bg-muted text-muted-foreground border-border hover:bg-muted/80'
              }`}
            >
              <Icon 
                name={alertsEnabled ? 'BellIcon' : 'BellSlashIcon'} 
                size={16} 
              />
              <span className="text-sm font-medium">
                {alertsEnabled ? 'Enabled' : 'Disabled'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PortAnalyticsHeader;