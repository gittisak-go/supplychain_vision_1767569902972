'use client';

import React, { useState, useEffect } from 'react';
import { vehicleService, Vehicle } from '@/services/vehicleService';
import { maintenanceService, MaintenanceSchedule } from '@/services/maintenanceService';
import { reservationService, Reservation } from '@/services/reservationService';
import { rentalTermsService, RentalTerm } from '@/services/rentalTermsService';

interface FleetMetrics {
  totalVehicles: number;
  availableVehicles: number;
  inUseVehicles: number;
  maintenanceVehicles: number;
  utilizationRate: number;
  activeReservations: number;
  pendingMaintenance: number;
  overdueMaintenance: number;
  totalRevenue: number;
}

type TabType = 'inventory' | 'maintenance' | 'pricing' | 'analytics';

export default function FleetManagementDashboard() {
  const [activeTab, setActiveTab] = useState<TabType>('inventory');
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [maintenanceSchedules, setMaintenanceSchedules] = useState<MaintenanceSchedule[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [rentalTerms, setRentalTerms] = useState<RentalTerm[]>([]);
  const [metrics, setMetrics] = useState<FleetMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [locationFilter, setLocationFilter] = useState<string>('all');
  
  // Add new filtering state
  const [brandFilter, setBrandFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({
    start: '',
    end: ''
  });
  const [utilizationRange, setUtilizationRange] = useState<{ min: number; max: number }>({
    min: 0,
    max: 100
  });
  const [priceRange, setPriceRange] = useState<{ min: number; max: number }>({
    min: 0,
    max: 10000
  });
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [vehiclesData, maintenanceData, reservationsData, termsData] = await Promise.all([
        vehicleService.getAllVehicles(),
        maintenanceService.getAllMaintenanceSchedules(),
        reservationService.getAllReservations(),
        rentalTermsService.getAllRentalTerms()
      ]);

      setVehicles(vehiclesData);
      setMaintenanceSchedules(maintenanceData);
      setReservations(reservationsData);
      setRentalTerms(termsData);

      calculateMetrics(vehiclesData, maintenanceData, reservationsData);
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const calculateMetrics = (
    vehiclesData: Vehicle[],
    maintenanceData: MaintenanceSchedule[],
    reservationsData: Reservation[]
  ) => {
    const totalVehicles = vehiclesData.length;
    const availableVehicles = vehiclesData.filter(v => v.status === 'available').length;
    const inUseVehicles = vehiclesData.filter(v => v.status === 'in_use').length;
    const maintenanceVehicles = vehiclesData.filter(v => v.status === 'maintenance').length;
    
    const utilizationRate = totalVehicles > 0 
      ? Math.round((inUseVehicles / totalVehicles) * 100) 
      : 0;

    const activeReservations = reservationsData.filter(
      r => r.status === 'confirmed' || r.status === 'active'
    ).length;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const pendingMaintenance = maintenanceData.filter(m => m.status === 'pending').length;
    const overdueMaintenance = maintenanceData.filter(m => {
      if (m.status !== 'pending') return false;
      const scheduledDate = new Date(m.scheduled_date);
      return scheduledDate < today;
    }).length;

    const totalRevenue = reservationsData
      .filter(r => r.status === 'completed')
      .reduce((sum, r) => sum + Number(r.total_amount), 0);

    setMetrics({
      totalVehicles,
      availableVehicles,
      inUseVehicles,
      maintenanceVehicles,
      utilizationRate,
      activeReservations,
      pendingMaintenance,
      overdueMaintenance,
      totalRevenue
    });
  };

  const getFilteredVehicles = () => {
    return vehicles.filter(vehicle => {
      const matchesSearch = 
        vehicle.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
        vehicle.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
        vehicle?.license_plate?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || vehicle.status === statusFilter;
      const matchesBrand = brandFilter === 'all' || vehicle.brand === brandFilter;
      const matchesUtilization = 
        (vehicle.utilization_rate || 0) >= utilizationRange.min &&
        (vehicle.utilization_rate || 0) <= utilizationRange.max;
      const matchesPrice = 
        Number(vehicle.price_per_day) >= priceRange.min &&
        Number(vehicle.price_per_day) <= priceRange.max;

      let matchesDateRange = true;
      if (dateRange.start && dateRange.end && vehicle.next_maintenance_date) {
        const maintenanceDate = new Date(vehicle.next_maintenance_date);
        const startDate = new Date(dateRange.start);
        const endDate = new Date(dateRange.end);
        matchesDateRange = maintenanceDate >= startDate && maintenanceDate <= endDate;
      }
      
      return matchesSearch && matchesStatus && matchesBrand && matchesUtilization && matchesPrice && matchesDateRange;
    });
  };

  const handleExport = (format: 'csv' | 'excel' | 'pdf') => {
    const filteredData = getFilteredVehicles();
    
    if (format === 'csv') {
      const headers = ['Brand', 'Model', 'Year', 'License Plate', 'Status', 'Utilization Rate', 'Price/Day', 'Next Maintenance'];
      const csvContent = [
        headers.join(','),
        ...filteredData.map(v => [
          v.brand,
          v.model,
          v.year,
          v.license_plate || 'N/A',
          v.status,
          `${v.utilization_rate}%`,
          v.price_per_day,
          v.next_maintenance_date || 'Not scheduled'
        ].join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `fleet-data-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } else if (format === 'excel' || format === 'pdf') {
      alert(`${format.toUpperCase()} export will be available soon. For now, please use CSV export.`);
    }
  };

  const resetFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setLocationFilter('all');
    setBrandFilter('all');
    setDateRange({ start: '', end: '' });
    setUtilizationRange({ min: 0, max: 100 });
    setPriceRange({ min: 0, max: 10000 });
  };

  const uniqueBrands = [...new Set(vehicles.map(v => v.brand))];

  const getUrgentMaintenanceAlerts = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return maintenanceSchedules
      .filter(m => {
        if (m.status !== 'pending') return false;
        const scheduledDate = new Date(m.scheduled_date);
        const daysUntil = Math.ceil((scheduledDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        return daysUntil <= 7;
      })
      .sort((a, b) => new Date(a.scheduled_date).getTime() - new Date(b.scheduled_date).getTime())
      .slice(0, 5);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">กำลังโหลดข้อมูลฟลีต...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">จัดการฟลีตรถยนต์</h1>
              <p className="text-sm text-gray-600 mt-1">ระบบจัดการยานพาหนะและการบำรุงรักษา</p>
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="all">ทุกสาขา</option>
                <option value="bangkok">กรุงเทพ</option>
                <option value="chiangmai">เชียงใหม่</option>
                <option value="phuket">ภูเก็ต</option>
                <option value="pattaya">พัทยา</option>
              </select>
              <button className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors">
                + เพิ่มรถใหม่
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Metrics Cards */}
        {metrics && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-600">ฟลีตทั้งหมด</h3>
                <span className="text-2xl">🚗</span>
              </div>
              <p className="text-3xl font-bold text-gray-900">{metrics.totalVehicles}</p>
              <div className="mt-2 flex items-center text-sm">
                <span className="text-green-600 font-medium">{metrics.availableVehicles} พร้อมใช้</span>
                <span className="mx-2 text-gray-400">•</span>
                <span className="text-orange-600">{metrics.inUseVehicles} ใช้งาน</span>
                <span className="mx-2 text-gray-400">•</span>
                <span className="text-red-600">{metrics.maintenanceVehicles} ซ่อม</span>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-600">การแจ้งเตือนซ่อมบำรุง</h3>
                <span className="text-2xl">🔧</span>
              </div>
              <p className="text-3xl font-bold text-gray-900">{metrics.pendingMaintenance}</p>
              <div className="mt-2 text-sm">
                {metrics.overdueMaintenance > 0 ? (
                  <span className="text-red-600 font-medium">
                    ⚠️ {metrics.overdueMaintenance} รายการเกินกำหนด
                  </span>
                ) : (
                  <span className="text-green-600">✓ ทุกรายการตรงเวลา</span>
                )}
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-600">รายได้</h3>
                <span className="text-2xl">💰</span>
              </div>
              <p className="text-3xl font-bold text-gray-900">
                {formatCurrency(metrics.totalRevenue)}
              </p>
              <div className="mt-2 text-sm text-gray-600">
                จากการจองที่เสร็จสมบูรณ์
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-600">อัตราการใช้งาน</h3>
                <span className="text-2xl">📊</span>
              </div>
              <p className="text-3xl font-bold text-gray-900">{metrics.utilizationRate}%</p>
              <div className="mt-2">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-orange-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${metrics.utilizationRate}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Content with Tabs */}
        <div className="bg-white rounded-lg shadow-sm">
          {/* Tab Navigation */}
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              {[
                { id: 'inventory', name: 'คลังรถยนต์', icon: '📋' },
                { id: 'maintenance', name: 'ตารางซ่อมบำรุง', icon: '🔧' },
                { id: 'pricing', name: 'กฎการกำหนดราคา', icon: '💵' },
                { id: 'analytics', name: 'การวิเคราะห์สาขา', icon: '📈' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className={`
                    py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap
                    ${activeTab === tab.id
                      ? 'border-orange-500 text-orange-600' :'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }
                  `}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* Inventory Tab */}
            {activeTab === 'inventory' && (
              <div>
                {/* Enhanced Filter Section */}
                <div className="mb-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 max-w-lg">
                      <input
                        type="text"
                        placeholder="ค้นหารถ (ยี่ห้อ, รุ่น, ทะเบียน)..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                    <div className="flex items-center space-x-3 ml-4">
                      <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      >
                        <option value="all">สถานะทั้งหมด</option>
                        <option value="available">พร้อมใช้งาน</option>
                        <option value="in_use">กำลังใช้งาน</option>
                        <option value="maintenance">ซ่อมบำรุง</option>
                        <option value="offline">ออฟไลน์</option>
                      </select>
                      
                      <button
                        onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                        </svg>
                        <span>ตัวกรองขั้นสูง</span>
                      </button>

                      <div className="relative">
                        <button 
                          className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors flex items-center space-x-2"
                          onClick={() => document.getElementById('exportMenu')?.classList.toggle('hidden')}
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                          <span>ส่งออกข้อมูล</span>
                        </button>
                        <div id="exportMenu" className="hidden absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                          <button
                            onClick={() => handleExport('csv')}
                            className="w-full text-left px-4 py-2 hover:bg-gray-50 transition-colors"
                          >
                            ส่งออกเป็น CSV
                          </button>
                          <button
                            onClick={() => handleExport('excel')}
                            className="w-full text-left px-4 py-2 hover:bg-gray-50 transition-colors"
                          >
                            ส่งออกเป็น Excel
                          </button>
                          <button
                            onClick={() => handleExport('pdf')}
                            className="w-full text-left px-4 py-2 hover:bg-gray-50 transition-colors rounded-b-lg"
                          >
                            ส่งออกเป็น PDF
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Advanced Filters Panel */}
                  {showAdvancedFilters && (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Brand Filter */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">ยี่ห้อ</label>
                          <select
                            value={brandFilter}
                            onChange={(e) => setBrandFilter(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                          >
                            <option value="all">ทุกยี่ห้อ</option>
                            {uniqueBrands.map(brand => (
                              <option key={brand} value={brand}>{brand}</option>
                            ))}
                          </select>
                        </div>

                        {/* Date Range Filter */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">วันที่ซ่อมบำรุง (จาก)</label>
                          <input
                            type="date"
                            value={dateRange.start}
                            onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">วันที่ซ่อมบำรุง (ถึง)</label>
                          <input
                            type="date"
                            value={dateRange.end}
                            onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                          />
                        </div>

                        {/* Utilization Range */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            อัตราการใช้งาน ({utilizationRange.min}% - {utilizationRange.max}%)
                          </label>
                          <div className="flex items-center space-x-2">
                            <input
                              type="range"
                              min="0"
                              max="100"
                              value={utilizationRange.min}
                              onChange={(e) => setUtilizationRange({ ...utilizationRange, min: parseInt(e.target.value) })}
                              className="flex-1"
                            />
                            <input
                              type="range"
                              min="0"
                              max="100"
                              value={utilizationRange.max}
                              onChange={(e) => setUtilizationRange({ ...utilizationRange, max: parseInt(e.target.value) })}
                              className="flex-1"
                            />
                          </div>
                        </div>

                        {/* Price Range */}
                        <div className="lg:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            ราคา/วัน (฿{priceRange.min} - ฿{priceRange.max})
                          </label>
                          <div className="flex items-center space-x-4">
                            <input
                              type="number"
                              value={priceRange.min}
                              onChange={(e) => setPriceRange({ ...priceRange, min: parseInt(e.target.value) || 0 })}
                              className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                              placeholder="ต่ำสุด"
                            />
                            <span className="text-gray-500">-</span>
                            <input
                              type="number"
                              value={priceRange.max}
                              onChange={(e) => setPriceRange({ ...priceRange, max: parseInt(e.target.value) || 10000 })}
                              className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                              placeholder="สูงสุด"
                            />
                          </div>
                        </div>

                        {/* Reset Button */}
                        <div className="flex items-end">
                          <button
                            onClick={resetFilters}
                            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors text-sm font-medium"
                          >
                            รีเซ็ตตัวกรอง
                          </button>
                        </div>
                      </div>

                      {/* Filter Summary */}
                      <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                        <div className="text-sm text-gray-600">
                          แสดง {getFilteredVehicles().length} จาก {vehicles.length} รถ
                        </div>
                        <button
                          onClick={() => setShowAdvancedFilters(false)}
                          className="text-sm text-orange-600 hover:text-orange-700 font-medium"
                        >
                          ซ่อนตัวกรองขั้นสูง
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {getFilteredVehicles().map((vehicle) => (
                    <div key={vehicle.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start space-x-4">
                        <img 
                          src={vehicle.image_url} 
                          alt={`${vehicle.brand} ${vehicle.model}`}
                          className="w-32 h-24 object-cover rounded-lg"
                        />
                        <div className="flex-1 grid grid-cols-12 gap-4">
                          <div className="col-span-3">
                            <h3 className="font-semibold text-gray-900">{vehicle.brand} {vehicle.model}</h3>
                            <p className="text-sm text-gray-600">ปี {vehicle.year}</p>
                            <p className="text-sm text-gray-500 mt-1">ทะเบียน: {vehicle.license_plate || 'N/A'}</p>
                          </div>
                          <div className="col-span-2">
                            <p className="text-sm text-gray-600">สถานะ</p>
                            <span className={`
                              inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-1
                              ${vehicle.status === 'available' ? 'bg-green-100 text-green-800' : ''}
                              ${vehicle.status === 'in_use' ? 'bg-blue-100 text-blue-800' : ''}
                              ${vehicle.status === 'maintenance' ? 'bg-red-100 text-red-800' : ''}
                              ${vehicle.status === 'offline' ? 'bg-gray-100 text-gray-800' : ''}
                            `}>
                              {vehicle.status === 'available' && '✓ พร้อมใช้'}
                              {vehicle.status === 'in_use' && '🚗 กำลังใช้'}
                              {vehicle.status === 'maintenance' && '🔧 ซ่อม'}
                              {vehicle.status === 'offline' && '⊗ ออฟไลน์'}
                            </span>
                          </div>
                          <div className="col-span-2">
                            <p className="text-sm text-gray-600">อัตราการใช้</p>
                            <p className="text-lg font-semibold text-orange-600">{vehicle.utilization_rate}%</p>
                          </div>
                          <div className="col-span-2">
                            <p className="text-sm text-gray-600">ซ่อมบำรุงถัดไป</p>
                            <p className="text-sm font-medium text-gray-900">
                              {vehicle.next_maintenance_date ? formatDate(vehicle.next_maintenance_date) : 'ยังไม่กำหนด'}
                            </p>
                          </div>
                          <div className="col-span-2">
                            <p className="text-sm text-gray-600">ราคา/วัน</p>
                            <p className="text-lg font-bold text-gray-900">{formatCurrency(Number(vehicle.price_per_day))}</p>
                          </div>
                          <div className="col-span-1 flex items-center justify-end">
                            <button className="text-orange-600 hover:text-orange-700">
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Maintenance Tab */}
            {activeTab === 'maintenance' && (
              <div>
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">กำหนดการซ่อมบำรุง</h3>
                  <div className="space-y-3">
                    {maintenanceSchedules
                      .filter(m => m.status === 'pending')
                      .sort((a, b) => new Date(a.scheduled_date).getTime() - new Date(b.scheduled_date).getTime())
                      .map((schedule) => {
                        const vehicle = vehicles.find(v => v.id === schedule.vehicle_id);
                        const scheduledDate = new Date(schedule.scheduled_date);
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        const isOverdue = scheduledDate < today;
                        const daysUntil = Math.ceil((scheduledDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

                        return (
                          <div 
                            key={schedule.id} 
                            className={`border rounded-lg p-4 ${isOverdue ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="flex items-center space-x-3">
                                  {isOverdue && <span className="text-red-600 text-xl">⚠️</span>}
                                  <div>
                                    <h4 className="font-medium text-gray-900">
                                      {vehicle ? `${vehicle.brand} ${vehicle.model}` : 'รถไม่ทราบ'}
                                      {vehicle?.license_plate && ` (${vehicle.license_plate})`}
                                    </h4>
                                    <p className="text-sm text-gray-600">{schedule.service_type}</p>
                                  </div>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className={`font-medium ${isOverdue ? 'text-red-600' : 'text-gray-900'}`}>
                                  {formatDate(schedule.scheduled_date)}
                                </p>
                                <p className="text-sm text-gray-600">
                                  {isOverdue 
                                    ? `เกินกำหนด ${Math.abs(daysUntil)} วัน` 
                                    : daysUntil === 0 
                                      ? 'วันนี้' 
                                      : `อีก ${daysUntil} วัน`
                                  }
                                </p>
                              </div>
                              <div className="ml-6">
                                <p className="text-sm text-gray-600">ค่าใช้จ่ายโดยประมาณ</p>
                                <p className="font-semibold text-gray-900">
                                  {schedule.cost ? formatCurrency(Number(schedule.cost)) : 'ยังไม่ทราบ'}
                                </p>
                              </div>
                              <button className="ml-6 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors">
                                กำหนดเวลา
                              </button>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              </div>
            )}

            {/* Pricing Tab */}
            {activeTab === 'pricing' && (
              <div>
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">กฎการกำหนดราคา</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {rentalTerms
                      .filter(term => term.category === 'pricing' || term.category === 'highlight')
                      .sort((a, b) => (a.display_order || 0) - (b.display_order || 0))
                      .map((term) => (
                        <div key={term.id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-medium text-gray-900">{term.title}</h4>
                            <span className={`
                              px-2 py-1 rounded text-xs font-medium
                              ${term.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}
                            `}>
                              {term.is_active ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">{term.content}</p>
                        </div>
                      ))}
                  </div>
                </div>

                <div className="mt-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">อัตราราคาตามหมวดหมู่</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">หมวดหมู่</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">จำนวนรถ</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ราคาเฉลี่ย/วัน</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ราคาต่ำสุด</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ราคาสูงสุด</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {Object.entries(
                          vehicles.reduce((acc, vehicle) => {
                            const category = vehicle.brand;
                            if (!acc[category]) {
                              acc[category] = [];
                            }
                            acc[category].push(Number(vehicle.price_per_day));
                            return acc;
                          }, {} as Record<string, number[]>)
                        ).map(([category, prices]) => {
                          const avg = prices.reduce((a, b) => a + b, 0) / prices.length;
                          const min = Math.min(...prices);
                          const max = Math.max(...prices);
                          
                          return (
                            <tr key={category}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{category}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{prices.length} คัน</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(avg)}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{formatCurrency(min)}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{formatCurrency(max)}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Analytics Tab */}
            {activeTab === 'analytics' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-6">การวิเคราะห์การดำเนินงาน</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-lg">
                    <h4 className="text-sm font-medium text-orange-900 mb-2">อัตราการใช้งานเฉลี่ย</h4>
                    <p className="text-3xl font-bold text-orange-600">
                      {vehicles.length > 0 
                        ? Math.round(vehicles.reduce((sum, v) => sum + (v.utilization_rate || 0), 0) / vehicles.length)
                        : 0}%
                    </p>
                  </div>

                  <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg">
                    <h4 className="text-sm font-medium text-green-900 mb-2">การจองที่ใช้งานอยู่</h4>
                    <p className="text-3xl font-bold text-green-600">
                      {reservations.filter(r => r.status === 'confirmed' || r.status === 'active').length}
                    </p>
                  </div>

                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg">
                    <h4 className="text-sm font-medium text-blue-900 mb-2">ค่าซ่อมบำรุงรวม</h4>
                    <p className="text-3xl font-bold text-blue-600">
                      {formatCurrency(
                        maintenanceSchedules
                          .filter(m => m.status === 'completed' && m.cost)
                          .reduce((sum, m) => sum + Number(m.cost), 0)
                      )}
                    </p>
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h4 className="font-medium text-gray-900 mb-4">สถิติการใช้งานตามยี่ห้อ</h4>
                  <div className="space-y-4">
                    {Object.entries(
                      vehicles.reduce((acc, vehicle) => {
                        const brand = vehicle.brand;
                        if (!acc[brand]) {
                          acc[brand] = { count: 0, totalUtilization: 0 };
                        }
                        acc[brand].count++;
                        acc[brand].totalUtilization += vehicle.utilization_rate || 0;
                        return acc;
                      }, {} as Record<string, { count: number; totalUtilization: number }>)
                    )
                      .sort((a, b) => b[1].count - a[1].count)
                      .map(([brand, data]) => {
                        const avgUtilization = Math.round(data.totalUtilization / data.count);
                        return (
                          <div key={brand} className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-sm font-medium text-gray-900">{brand}</span>
                                <span className="text-sm text-gray-600">{data.count} คัน • {avgUtilization}%</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-orange-500 h-2 rounded-full"
                                  style={{ width: `${avgUtilization}%` }}
                                ></div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar - Urgent Notifications */}
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2"></div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">🚨 แจ้งเตือนด่วน</h3>
            <div className="space-y-3">
              {getUrgentMaintenanceAlerts().map((schedule) => {
                const vehicle = vehicles.find(v => v.id === schedule.vehicle_id);
                const scheduledDate = new Date(schedule.scheduled_date);
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const daysUntil = Math.ceil((scheduledDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                
                return (
                  <div key={schedule.id} className="border-l-4 border-orange-500 pl-3 py-2">
                    <p className="text-sm font-medium text-gray-900">
                      {vehicle ? `${vehicle.brand} ${vehicle.model}` : 'รถไม่ทราบ'}
                    </p>
                    <p className="text-xs text-gray-600">{schedule.service_type}</p>
                    <p className="text-xs text-orange-600 mt-1">
                      {daysUntil <= 0 ? 'เกินกำหนดแล้ว' : `อีก ${daysUntil} วัน`}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}