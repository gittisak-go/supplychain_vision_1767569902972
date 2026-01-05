'use client';

import React, { useState, useEffect } from 'react';
import PortAnalyticsHeader from './PortAnalyticsHeader';
import PortCapacityCard from './PortCapacityCard';
import CapacityUtilizationChart from './CapacityUtilizationChart';
import CongestionStatusCard from './CongestionStatusCard';
import RegionalFlowVisualization from './RegionalFlowVisualization';

interface UtilizationData {
  hour: string;
  terminal_a: number;
  terminal_b: number;
  terminal_c: number;
  terminal_d: number;
  total_capacity: number;
}

interface CongestionAlert {
  id: string;
  terminal: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  estimatedDelay: string;
  timestamp: string;
}

interface FlowData {
  id: string;
  origin: string;
  destination: string;
  volume: number;
  status: 'normal' | 'congested' | 'critical';
  estimatedTime: string;
  bottleneck?: string;
}

const PortAnalyticsInteractive = () => {
  const [isHydrated, setIsHydrated] = useState(false);
  const [selectedPort, setSelectedPort] = useState('all');
  const [selectedTimeRange, setSelectedTimeRange] = useState('current-shift');
  const [alertsEnabled, setAlertsEnabled] = useState(true);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Mock data for port capacity cards
  const capacityData = [
    {
      title: 'Current Utilization',
      value: '78%',
      percentage: 78,
      trend: 'up' as const,
      trendValue: '+5.2%',
      color: 'blue' as const,
      icon: 'ChartBarIcon'
    },
    {
      title: 'Available Berths',
      value: '31/142',
      percentage: 22,
      trend: 'down' as const,
      trendValue: '-3 berths',
      color: 'green' as const,
      icon: 'BuildingOfficeIcon'
    },
    {
      title: 'Average Dwell Time',
      value: '4.2h',
      percentage: 65,
      trend: 'stable' as const,
      trendValue: '±0.1h',
      color: 'yellow' as const,
      icon: 'ClockIcon'
    },
    {
      title: 'Throughput Efficiency',
      value: '87%',
      percentage: 87,
      trend: 'up' as const,
      trendValue: '+2.1%',
      color: 'purple' as const,
      icon: 'TruckIcon'
    }
  ];

  // Mock data for utilization chart
  const utilizationData: UtilizationData[] = [
    { hour: '00:00', terminal_a: 45, terminal_b: 52, terminal_c: 38, terminal_d: 41, total_capacity: 100 },
    { hour: '02:00', terminal_a: 48, terminal_b: 55, terminal_c: 42, terminal_d: 44, total_capacity: 100 },
    { hour: '04:00', terminal_a: 52, terminal_b: 58, terminal_c: 45, terminal_d: 47, total_capacity: 100 },
    { hour: '06:00', terminal_a: 65, terminal_b: 72, terminal_c: 58, terminal_d: 61, total_capacity: 100 },
    { hour: '08:00', terminal_a: 78, terminal_b: 85, terminal_c: 71, terminal_d: 74, total_capacity: 100 },
    { hour: '10:00', terminal_a: 82, terminal_b: 89, terminal_c: 75, terminal_d: 78, total_capacity: 100 },
    { hour: '12:00', terminal_a: 85, terminal_b: 92, terminal_c: 78, terminal_d: 81, total_capacity: 100 },
    { hour: '14:00', terminal_a: 88, terminal_b: 95, terminal_c: 81, terminal_d: 84, total_capacity: 100 },
    { hour: '16:00', terminal_a: 85, terminal_b: 92, terminal_c: 78, terminal_d: 81, total_capacity: 100 },
    { hour: '18:00', terminal_a: 78, terminal_b: 85, terminal_c: 71, terminal_d: 74, total_capacity: 100 },
    { hour: '20:00', terminal_a: 65, terminal_b: 72, terminal_c: 58, terminal_d: 61, total_capacity: 100 },
    { hour: '22:00', terminal_a: 52, terminal_b: 58, terminal_c: 45, terminal_d: 47, total_capacity: 100 }
  ];

  // Mock data for congestion alerts
  const congestionAlerts: CongestionAlert[] = [
    {
      id: '1',
      terminal: 'Terminal A - Berth 12',
      severity: 'critical',
      message: 'Severe congestion detected. Multiple vessels queued for docking.',
      estimatedDelay: '3-4 hours',
      timestamp: '2 minutes ago'
    },
    {
      id: '2',
      terminal: 'Terminal C - Gate 7',
      severity: 'high',
      message: 'High truck volume causing processing delays at gate entry.',
      estimatedDelay: '45-60 min',
      timestamp: '8 minutes ago'
    },
    {
      id: '3',
      terminal: 'Terminal B - Crane 5',
      severity: 'medium',
      message: 'Equipment maintenance reducing operational capacity by 15%.',
      estimatedDelay: '20-30 min',
      timestamp: '15 minutes ago'
    }
  ];

  // Mock data for regional flow
  const flowData: FlowData[] = [
    {
      id: '1',
      origin: 'Port of Los Angeles',
      destination: 'Port of Long Beach',
      volume: 12500,
      status: 'normal',
      estimatedTime: '6 hours',
    },
    {
      id: '2',
      origin: 'Port of New York',
      destination: 'Port of Savannah',
      volume: 8750,
      status: 'congested',
      estimatedTime: '14 hours',
      bottleneck: 'Weather delays causing 2-hour backup at departure terminal'
    },
    {
      id: '3',
      origin: 'Port of Seattle',
      destination: 'Port of Los Angeles',
      volume: 15200,
      status: 'critical',
      estimatedTime: '18 hours',
      bottleneck: 'Critical equipment failure at destination port causing severe delays'
    },
    {
      id: '4',
      origin: 'Port of Long Beach',
      destination: 'Port of New York',
      volume: 9800,
      status: 'normal',
      estimatedTime: '72 hours',
    }
  ];

  const handlePortChange = (port: string) => {
    setSelectedPort(port);
  };

  const handleTimeRangeChange = (range: string) => {
    setSelectedTimeRange(range);
  };

  const handleAlertsToggle = (enabled: boolean) => {
    setAlertsEnabled(enabled);
  };

  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-background">
        <div className="animate-pulse space-y-6 p-6">
          <div className="h-32 bg-muted rounded-xl"></div>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-40 bg-muted rounded-xl"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 h-96 bg-muted rounded-xl"></div>
            <div className="h-96 bg-muted rounded-xl"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Controls */}
      <PortAnalyticsHeader
        onPortChange={handlePortChange}
        onTimeRangeChange={handleTimeRangeChange}
        onAlertsToggle={handleAlertsToggle}
      />

      {/* Capacity Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {capacityData.map((data, index) => (
          <PortCapacityCard key={index} {...data} />
        ))}
      </div>

      {/* Main Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Capacity Utilization Chart */}
        <div className="lg:col-span-2">
          <CapacityUtilizationChart data={utilizationData} />
        </div>

        {/* Congestion Status */}
        <div>
          <CongestionStatusCard alerts={alertsEnabled ? congestionAlerts : []} />
        </div>
      </div>

      {/* Regional Flow Visualization */}
      <RegionalFlowVisualization flowData={flowData} />
    </div>
  );
};

export default PortAnalyticsInteractive;