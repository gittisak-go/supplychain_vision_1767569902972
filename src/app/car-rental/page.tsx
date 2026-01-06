'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  TruckIcon,
  MapPinIcon,
  CreditCardIcon,
  UserIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { vehicleService } from '@/services/vehicleService';

interface Vehicle {
  id: string;
  brand: string;
  model: string;
  year: number;
  price_per_day: number;
  seats: number;
  transmission: string;
  fuel_type: string;
  image_url: string;
  description: string | null;
  is_available: boolean;
  status: string;
}

export default function CarRentalPage() {
  const router = useRouter();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTransmission, setFilterTransmission] = useState<string>('');
  const [filterFuelType, setFilterFuelType] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadVehicles();
  }, []);

  const loadVehicles = async () => {
    try {
      setLoading(true);
      const data = await vehicleService.getAvailableVehicles();
      setVehicles(data || []);
    } catch (err: any) {
      setError(err?.message || 'ไม่สามารถโหลดข้อมูลรถได้');
    } finally {
      setLoading(false);
    }
  };

  const filteredVehicles = vehicles.filter((vehicle) => {
    const matchesSearch = searchQuery === '' || 
      vehicle.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vehicle.model.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesTransmission = filterTransmission === '' || vehicle.transmission === filterTransmission;
    const matchesFuelType = filterFuelType === '' || vehicle.fuel_type === filterFuelType;

    return matchesSearch && matchesTransmission && matchesFuelType;
  });

  const handleVehicleClick = (vehicleId: string) => {
    router.push(`/car-rental/${vehicleId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2 cursor-pointer" onClick={() => router.push('/landing-page')}>
              <TruckIcon className="w-8 h-8 text-orange-600" />
              <span className="text-2xl font-bold text-gray-900">เช่ารถไทยแลนด์</span>
            </div>
            <div className="flex items-center space-x-4">
              <button className="text-gray-700 hover:text-orange-600 font-medium">
                <UserIcon className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Search and Filter Bar */}
      <div className="bg-white shadow-sm py-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="ค้นหายี่ห้อหรือรุ่นรถ..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <FunnelIcon className="w-5 h-5" />
              <span>ตัวกรอง</span>
            </button>
          </div>

          {showFilters && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ระบบเกียร์
                </label>
                <select
                  value={filterTransmission}
                  onChange={(e) => setFilterTransmission(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                >
                  <option value="">ทั้งหมด</option>
                  <option value="Automatic">เกียร์อัตโนมัติ</option>
                  <option value="Manual">เกียร์ธรรมดา</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ประเภทเชื้อเพลิง
                </label>
                <select
                  value={filterFuelType}
                  onChange={(e) => setFilterFuelType(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                >
                  <option value="">ทั้งหมด</option>
                  <option value="Gasoline">เบนซิน</option>
                  <option value="Diesel">ดีเซล</option>
                  <option value="Hybrid">ไฮบริด</option>
                  <option value="Electric">ไฟฟ้า</option>
                </select>
              </div>
              <div className="flex items-end">
                <button
                  onClick={() => {
                    setFilterTransmission('');
                    setFilterFuelType('');
                    setSearchQuery('');
                  }}
                  className="w-full px-4 py-2 text-orange-600 border border-orange-600 rounded-lg hover:bg-orange-50 transition-colors"
                >
                  ล้างตัวกรอง
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Vehicles Grid */}
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            รถให้เช่าทั้งหมด
          </h1>
          <p className="text-gray-600">
            พบ {filteredVehicles?.length || 0} คัน
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
            {error}
          </div>
        )}

        {loading ? (
          <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="bg-white rounded-xl shadow-md animate-pulse">
                <div className="aspect-video bg-gray-200 rounded-t-xl" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-gray-200 rounded" />
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-6 bg-gray-200 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredVehicles?.length === 0 ? (
          <div className="text-center py-16">
            <TruckIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              ไม่พบรถที่ค้นหา
            </h3>
            <p className="text-gray-500">
              ลองเปลี่ยนเงื่อนไขการค้นหาหรือล้างตัวกรอง
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredVehicles.map((vehicle) => (
              <div
                key={vehicle.id}
                onClick={() => handleVehicleClick(vehicle.id)}
                className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all cursor-pointer group"
              >
                <div className="relative aspect-video bg-gray-200 rounded-t-xl overflow-hidden">
                  <img
                    src={vehicle.image_url}
                    alt={`${vehicle.brand} ${vehicle.model}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    onError={(e) => {
                      e.currentTarget.src = '/assets/images/no_image.png';
                    }}
                  />
                  {vehicle.is_available && (
                    <div className="absolute top-2 right-2 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                      <CheckCircleIcon className="w-4 h-4" />
                      พร้อมให้เช่า
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-bold text-gray-900 mb-1">
                    {vehicle.brand} {vehicle.model}
                  </h3>
                  <p className="text-sm text-gray-500 mb-3">
                    {vehicle.year}
                  </p>
                  <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
                    <span className="flex items-center gap-1">
                      <UserIcon className="w-4 h-4" />
                      {vehicle.seats} ที่นั่ง
                    </span>
                    <span>{vehicle.transmission === 'Automatic' ? 'อัตโนมัติ' : 'ธรรมดา'}</span>
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <div>
                      <span className="text-2xl font-bold text-orange-600">
                        ฿{vehicle.price_per_day?.toLocaleString()}
                      </span>
                      <span className="text-sm text-gray-500">/วัน</span>
                    </div>
                    <button className="bg-orange-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-orange-700 transition-colors">
                      เช่าเลย
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Benefits Section */}
      <div className="bg-white py-16 mt-8">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            ทำไมต้องเช่ากับเรา
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 rounded-full mb-4">
                <TruckIcon className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                รับ-ส่งฟรี
              </h3>
              <p className="text-gray-600">
                บริการรับ-ส่งรถฟรีทั้งสนามบินและในเมือง
              </p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 rounded-full mb-4">
                <CreditCardIcon className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                ไม่ต้องมีบัตรเครดิต
              </h3>
              <p className="text-gray-600">
                เช่ารถง่ายๆ เพียงแค่มีบัตรประชาชน
              </p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 rounded-full mb-4">
                <MapPinIcon className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                ครอบคลุมทั่วไทย
              </h3>
              <p className="text-gray-600">
                บริการทุกจังหวัดในประเทศไทย
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}