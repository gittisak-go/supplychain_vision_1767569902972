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

  // Mock Shipment Pins - Thailand Locations
  const shipmentPins: ShipmentPin[] = [
    {
      id: '1',
      lat: 13.7563,
      lng: 100.5018,
      status: 'on-time',
      shipmentId: 'TH001',
      origin: 'กรุงเทพมหานคร',
      destination: 'เชียงใหม่',
      eta: '22 ม.ค. 2567'
    },
    {
      id: '2',
      lat: 7.8804,
      lng: 98.3923,
      status: 'delayed',
      shipmentId: 'TH002',
      origin: 'ภูเก็ต',
      destination: 'กระบี่',
      eta: '21 ม.ค. 2567'
    },
    {
      id: '3',
      lat: 12.9236,
      lng: 100.8825,
      status: 'critical',
      shipmentId: 'TH003',
      origin: 'พัทยา',
      destination: 'ระยอง',
      eta: '20 ม.ค. 2567'
    },
    {
      id: '4',
      lat: 18.7883,
      lng: 98.9853,
      status: 'on-time',
      shipmentId: 'TH004',
      origin: 'เชียงใหม่',
      destination: 'เชียงราย',
      eta: '19 ม.ค. 2567'
    },
    {
      id: '5',
      lat: 15.1168,
      lng: 104.9065,
      status: 'delayed',
      shipmentId: 'TH005',
      origin: 'อุบลราชธานี',
      destination: 'ขอนแก่น',
      eta: '23 ม.ค. 2567'
    },
    {
      id: '6',
      lat: 8.5604,
      lng: 99.9084,
      status: 'on-time',
      shipmentId: 'TH006',
      origin: 'สุราษฎร์ธานี',
      destination: 'นครศรีธรรมราช',
      eta: '22 ม.ค. 2567'
    },
    {
      id: '7',
      lat: 14.3532,
      lng: 100.5698,
      status: 'on-time',
      shipmentId: 'TH007',
      origin: 'อยุธยา',
      destination: 'ลพบุรี',
      eta: '21 ม.ค. 2567'
    }
  ];

  // Mock Alerts - Thailand Specific
  const alerts: Alert[] = [
    {
      id: '1',
      type: 'critical',
      title: 'การจราจรติดขัดบนทางด่วน',
      message: 'การจราจรติดขัดหนักบนทางด่วนเอกมัย-รามอินทรา ส่งผลต่อ 8 เที่ยวจัดส่ง',
      timestamp: '2 นาทีที่แล้ว',
      shipmentId: 'TH001',
      location: 'กรุงเทพมหานคร'
    },
    {
      id: '2',
      type: 'warning',
      title: 'สภาพอากาศไม่เอื้ออำนวย',
      message: 'พายุฝนกำลังเข้าสู่ภาคใต้ อาจส่งผลต่อการจัดส่งในพื้นที่',
      timestamp: '5 นาทีที่แล้ว',
      location: 'ภาคใต้'
    },
    {
      id: '3',
      type: 'info',
      title: 'เส้นทางใหม่ที่มีประสิทธิภาพ',
      message: 'เส้นทางใหม่กรุงเทพฯ-เชียงใหม่ ประหยัดเวลา 45 นาที',
      timestamp: '12 นาทีที่แล้ว',
      location: 'กรุงเทพฯ-เชียงใหม่'
    },
    {
      id: '4',
      type: 'critical',
      title: 'รถเสียกลางทาง',
      message: 'รถบรรทุกเสียบนถนนพหลโยธิน ส่งรถสำรองแล้ว',
      timestamp: '18 นาทีที่แล้ว',
      shipmentId: 'TH004',
      location: 'ถนนพหลโยธิน'
    },
    {
      id: '5',
      type: 'warning',
      title: 'การตรวจสอบที่ด่านศุลกากร',
      message: 'ระยะเวลาการตรวจสอบที่ท่าเรือแหลมฉบัง นานกว่าปกติ',
      timestamp: '25 นาทีที่แล้ว',
      location: 'ท่าเรือแหลมฉบัง ชลบุรี'
    },
    {
      id: '6',
      type: 'info',
      title: 'การจัดส่งสำเร็จ',
      message: 'การจัดส่ง 15 รายการถึงจุดหมายเรียบร้อยแล้ว',
      timestamp: '30 นาทีที่แล้ว',
      location: 'หลายพื้นที่'
    }
  ];

  // Mock Chart Data - Keep existing structure
  const chartData: ChartData[] = [
    { month: 'ม.ค.', current: 2400, previous: 2200 },
    { month: 'ก.พ.', current: 2600, previous: 2100 },
    { month: 'มี.ค.', current: 2800, previous: 2300 },
    { month: 'เม.ย.', current: 2700, previous: 2400 },
    { month: 'พ.ค.', current: 3100, previous: 2600 },
    { month: 'มิ.ย.', current: 2900, previous: 2500 },
    { month: 'ก.ค.', current: 3200, previous: 2800 },
    { month: 'ส.ค.', current: 3000, previous: 2700 },
    { month: 'ก.ย.', current: 3300, previous: 2900 },
    { month: 'ต.ค.', current: 3100, previous: 2800 },
    { month: 'พ.ย.', current: 2847, previous: 2650 }
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