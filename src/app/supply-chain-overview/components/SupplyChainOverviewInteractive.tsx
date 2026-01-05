'use client';

import React, { useState, useEffect } from 'react';
import KPICard from './KPICard';
import GlobalMap from './GlobalMap';
import LiveAlertsFeed from './LiveAlertsFeed';
import ShipmentVolumeChart from './ShipmentVolumeChart';
import DashboardControls from './DashboardControls';

interface KPIData {
  activeShipments: { value: number; change: number; changeType: 'increase' | 'decrease' };
  onTimeDelivery: { value: number; change: number; changeType: 'increase' | 'decrease' };
  pendingAlerts: { value: number; change: number; changeType: 'increase' | 'decrease' };
  routePerformance: { value: number; change: number; changeType: 'increase' | 'decrease' };
}

interface ShipmentPin {
  id: string;
  lat: number;
  lng: number;
  status: 'on-time' | 'delayed' | 'critical';
  shipmentId: string;
  origin: string;
  destination: string;
  eta: string;
}

interface Alert {
  id: string;
  type: 'critical' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: string;
  shipmentId?: string;
  location?: string;
}

interface ChartData {
  month: string;
  current: number;
  previous: number;
}

const SupplyChainOverviewInteractive = () => {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Mock KPI Data
  const kpiData: KPIData = {
    activeShipments: { value: 2847, change: 12.5, changeType: 'increase' },
    onTimeDelivery: { value: 94.2, change: 2.1, changeType: 'increase' },
    pendingAlerts: { value: 23, change: 8.3, changeType: 'decrease' },
    routePerformance: { value: 87.6, change: 5.2, changeType: 'increase' }
  };

  // Mock Shipment Pins
  const shipmentPins: ShipmentPin[] = [
    {
      id: '1',
      lat: 40.7128,
      lng: -74.0060,
      status: 'on-time',
      shipmentId: 'SH001',
      origin: 'New York, NY',
      destination: 'Los Angeles, CA',
      eta: 'Nov 22, 2024'
    },
    {
      id: '2',
      lat: 51.5074,
      lng: -0.1278,
      status: 'delayed',
      shipmentId: 'SH002',
      origin: 'London, UK',
      destination: 'Berlin, Germany',
      eta: 'Nov 21, 2024'
    },
    {
      id: '3',
      lat: 35.6762,
      lng: 139.6503,
      status: 'critical',
      shipmentId: 'SH003',
      origin: 'Tokyo, Japan',
      destination: 'Shanghai, China',
      eta: 'Nov 20, 2024'
    },
    {
      id: '4',
      lat: -33.8688,
      lng: 151.2093,
      status: 'on-time',
      shipmentId: 'SH004',
      origin: 'Sydney, Australia',
      destination: 'Melbourne, Australia',
      eta: 'Nov 19, 2024'
    },
    {
      id: '5',
      lat: 55.7558,
      lng: 37.6176,
      status: 'delayed',
      shipmentId: 'SH005',
      origin: 'Moscow, Russia',
      destination: 'St. Petersburg, Russia',
      eta: 'Nov 23, 2024'
    }
  ];

  // Mock Alerts
  const alerts: Alert[] = [
    {
      id: '1',
      type: 'critical',
      title: 'Port Congestion Alert',
      message: 'Severe delays at Port of Los Angeles affecting 15 shipments',
      timestamp: '2 min ago',
      shipmentId: 'SH001',
      location: 'Los Angeles, CA'
    },
    {
      id: '2',
      type: 'warning',
      title: 'Weather Disruption',
      message: 'Storm system may impact deliveries in Northeast region',
      timestamp: '5 min ago',
      location: 'Northeast US'
    },
    {
      id: '3',
      type: 'info',
      title: 'Route Optimization',
      message: 'New route available for Chicago-Detroit corridor saving 2 hours',
      timestamp: '12 min ago',
      location: 'Midwest US'
    },
    {
      id: '4',
      type: 'critical',
      title: 'Vehicle Breakdown',
      message: 'Truck breakdown on I-95, backup vehicle dispatched',
      timestamp: '18 min ago',
      shipmentId: 'SH007',
      location: 'I-95 Corridor'
    },
    {
      id: '5',
      type: 'warning',
      title: 'Customs Delay',
      message: 'Extended processing times at JFK International',
      timestamp: '25 min ago',
      location: 'JFK Airport, NY'
    }
  ];

  // Mock Chart Data
  const chartData: ChartData[] = [
    { month: 'Jan', current: 2400, previous: 2200 },
    { month: 'Feb', current: 2600, previous: 2100 },
    { month: 'Mar', current: 2800, previous: 2300 },
    { month: 'Apr', current: 2700, previous: 2400 },
    { month: 'May', current: 3100, previous: 2600 },
    { month: 'Jun', current: 2900, previous: 2500 },
    { month: 'Jul', current: 3200, previous: 2800 },
    { month: 'Aug', current: 3000, previous: 2700 },
    { month: 'Sep', current: 3300, previous: 2900 },
    { month: 'Oct', current: 3100, previous: 2800 },
    { month: 'Nov', current: 2847, previous: 2650 }
  ];

  const handlePinClick = (shipment: ShipmentPin) => {
    console.log('Shipment clicked:', shipment);
  };

  const handleDateRangeChange = (range: string) => {
    console.log('Date range changed:', range);
  };

  const handleRegionChange = (region: string) => {
    console.log('Region changed:', region);
  };

  const handleRefreshIntervalChange = (interval: number) => {
    console.log('Refresh interval changed:', interval);
  };

  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-background">
        <div className="p-6 space-y-6">
          <div className="h-16 bg-muted rounded-xl animate-pulse" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-muted rounded-xl animate-pulse" />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 h-96 bg-muted rounded-xl animate-pulse" />
            <div className="h-96 bg-muted rounded-xl animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Dashboard Controls */}
      <DashboardControls
        onDateRangeChange={handleDateRangeChange}
        onRegionChange={handleRegionChange}
        onRefreshIntervalChange={handleRefreshIntervalChange}
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          title="การจัดส่งที่ใช้งานอยู่"
          value={kpiData.activeShipments.value.toLocaleString()}
          change={kpiData.activeShipments.change}
          changeType={kpiData.activeShipments.changeType}
          icon="TruckIcon"
          gradient="bg-gradient-to-br from-primary to-purple-700"
          subtitle="กำลังอยู่ระหว่างการขนส่ง"
        />
        <KPICard
          title="การส่งตรงเวลา"
          value={`${kpiData.onTimeDelivery.value}%`}
          change={kpiData.onTimeDelivery.change}
          changeType={kpiData.onTimeDelivery.changeType}
          icon="CheckCircleIcon"
          gradient="bg-gradient-to-br from-accent to-pink-600"
          subtitle="30 วันที่ผ่านมา"
        />
        <KPICard
          title="การแจ้งเตือนที่รอดำเนินการ"
          value={kpiData.pendingAlerts.value}
          change={kpiData.pendingAlerts.change}
          changeType={kpiData.pendingAlerts.changeType}
          icon="ExclamationTriangleIcon"
          gradient="bg-gradient-to-br from-warning to-orange-500"
          subtitle="ต้องการความสนใจ"
        />
        <KPICard
          title="ประสิทธิภาพเส้นทาง"
          value={`${kpiData.routePerformance.value}%`}
          change={kpiData.routePerformance.change}
          changeType={kpiData.routePerformance.changeType}
          icon="MapIcon"
          gradient="bg-gradient-to-br from-success to-green-600"
          subtitle="คะแนนประสิทธิภาพ"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Global Map */}
        <div className="lg:col-span-2">
          <GlobalMap
            shipments={shipmentPins}
            onPinClick={handlePinClick}
          />
        </div>

        {/* Live Alerts Feed */}
        <div className="lg:col-span-1">
          <LiveAlertsFeed alerts={alerts} />
        </div>
      </div>

      {/* Shipment Volume Chart */}
      <ShipmentVolumeChart data={chartData} />
    </div>
  );
};

export default SupplyChainOverviewInteractive;