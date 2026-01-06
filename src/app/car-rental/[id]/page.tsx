'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { TruckIcon, MapPinIcon, UserIcon, CheckCircleIcon, XMarkIcon, CreditCardIcon } from '@heroicons/react/24/outline';
import { vehicleService } from '@/services/vehicleService';
import { reservationService } from '@/services/reservationService';

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
  fuel_capacity?: number;
  current_mileage?: number;
}

export default function VehicleDetailPage() {
  const router = useRouter();
  const params = useParams();
  const vehicleId = params?.id as string;

  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [bookingData, setBookingData] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    customerIdCard: '',
    startDate: '',
    endDate: '',
    pickupLocation: 'กรุงเทพฯ',
    dropoffLocation: '',
    specialRequests: ''
  });
  const [bookingError, setBookingError] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (vehicleId) {
      loadVehicle();
    }
  }, [vehicleId]);

  const loadVehicle = async () => {
    try {
      setLoading(true);
      const data = await vehicleService.getVehicleById(vehicleId);
      setVehicle(data);
    } catch (err: any) {
      setError(err?.message || 'ไม่สามารถโหลดข้อมูลรถได้');
    } finally {
      setLoading(false);
    }
  };

  const calculateTotalDays = () => {
    if (!bookingData.startDate || !bookingData.endDate) return 0;
    const start = new Date(bookingData.startDate);
    const end = new Date(bookingData.endDate);
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 0;
  };

  const calculateTotal = () => {
    const days = calculateTotalDays();
    return days * (vehicle?.price_per_day || 0);
  };

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setBookingError('');
    setSubmitting(true);

    try {
      if (calculateTotalDays() <= 0) {
        setBookingError('กรุณาเลือกวันที่ให้ถูกต้อง');
        setSubmitting(false);
        return;
      }

      const isAvailable = await reservationService.checkVehicleAvailability(
        vehicleId,
        bookingData.startDate,
        bookingData.endDate
      );

      if (!isAvailable) {
        setBookingError('รถคันนี้ถูกจองในช่วงเวลาดังกล่าวแล้ว กรุณาเลือกวันอื่น');
        setSubmitting(false);
        return;
      }

      await reservationService.createReservation({
        vehicle_id: vehicleId,
        customer_name: bookingData.customerName,
        customer_email: bookingData.customerEmail,
        customer_phone: bookingData.customerPhone,
        customer_id_card: bookingData.customerIdCard,
        start_date: bookingData.startDate,
        end_date: bookingData.endDate,
        pickup_location: bookingData.pickupLocation,
        dropoff_location: bookingData.dropoffLocation || bookingData.pickupLocation,
        special_requests: bookingData.specialRequests
      });

      setBookingSuccess(true);
      setTimeout(() => {
        router.push('/car-rental');
      }, 3000);
    } catch (err: any) {
      setBookingError(err?.message || 'ไม่สามารถจองรถได้ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600">กำลังโหลด...</p>
        </div>
      </div>
    );
  }

  if (error || !vehicle) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <TruckIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            ไม่พบข้อมูลรถ
          </h3>
          <p className="text-gray-500 mb-4">{error}</p>
          <button
            onClick={() => router.push('/car-rental')}
            className="bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700"
          >
            กลับไปหน้ารถให้เช่า
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center space-x-2 cursor-pointer" onClick={() => router.push('/car-rental')}>
            <TruckIcon className="w-8 h-8 text-orange-600" />
            <span className="text-2xl font-bold text-gray-900">เช่ารถไทยแลนด์</span>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <button
          onClick={() => router.back()}
          className="mb-6 text-orange-600 hover:text-orange-700 font-medium"
        >
          ← กลับ
        </button>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Vehicle Info */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="aspect-video bg-gray-200">
                <img
                  src={vehicle.image_url}
                  alt={`${vehicle.brand} ${vehicle.model}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = '/assets/images/no_image.png';
                  }}
                />
              </div>
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                      {vehicle.brand} {vehicle.model}
                    </h1>
                    <p className="text-gray-600">{vehicle.year}</p>
                  </div>
                  {vehicle.is_available && (
                    <span className="bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2">
                      <CheckCircleIcon className="w-5 h-5" />
                      พร้อมให้เช่า
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <UserIcon className="w-6 h-6 text-gray-600 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">ที่นั่ง</p>
                    <p className="font-semibold">{vehicle.seats} ที่</p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">เกียร์</p>
                    <p className="font-semibold">
                      {vehicle.transmission === 'Automatic' ? 'อัตโนมัติ' : 'ธรรมดา'}
                    </p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">เชื้อเพลิง</p>
                    <p className="font-semibold">{vehicle.fuel_type}</p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">ถังน้ำมัน</p>
                    <p className="font-semibold">{vehicle.fuel_capacity || 50}L</p>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">
                    รายละเอียดรถ
                  </h2>
                  <p className="text-gray-600">
                    {vehicle.description || 'รถสภาพดี พร้อมให้บริการ มีประกันภัยครอบคลุม'}
                  </p>
                </div>

                <div className="border-t border-gray-200 pt-6 mt-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">
                    เงื่อนไขการเช่า
                  </h2>
                  <ul className="space-y-2 text-gray-600">
                    <li className="flex items-start gap-2">
                      <CheckCircleIcon className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>รับ-ส่งรถฟรีในเมือง</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircleIcon className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>ประกันภัยชั้น 1 ครอบคลุมเต็มรูปแบบ</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircleIcon className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>ไม่ต้องมีบัตรเครดิต</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircleIcon className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>เติมน้ำมันครบถ้วน</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Booking Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-md p-6 sticky top-4">
              <div className="mb-6">
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-4xl font-bold text-orange-600">
                    ฿{vehicle.price_per_day?.toLocaleString()}
                  </span>
                  <span className="text-gray-600">/วัน</span>
                </div>
                <p className="text-sm text-gray-500">มัดจำ 30% ของค่าเช่าทั้งหมด</p>
              </div>

              <button
                onClick={() => setBookingModalOpen(true)}
                disabled={!vehicle.is_available}
                className="w-full bg-orange-600 text-white py-4 rounded-lg font-semibold hover:bg-orange-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed mb-4"
              >
                {vehicle.is_available ? 'จองเลย' : 'ไม่พร้อมให้เช่า'}
              </button>

              <div className="border-t border-gray-200 pt-4 space-y-3">
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <MapPinIcon className="w-5 h-5" />
                  <span>รับ-ส่งฟรีในเมือง</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <CreditCardIcon className="w-5 h-5" />
                  <span>ไม่ต้องมีบัตรเครดิต</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <CheckCircleIcon className="w-5 h-5" />
                  <span>ประกันภัยครอบคลุม</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      {bookingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">
                จองรถ {vehicle.brand} {vehicle.model}
              </h2>
              <button
                onClick={() => setBookingModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleBooking} className="p-6 space-y-4">
              {bookingError && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                  {bookingError}
                </div>
              )}

              {bookingSuccess && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-600 text-sm">
                  จองรถสำเร็จ! กำลังนำท่านไปยังหน้ารายการจอง...
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ชื่อ-นามสกุล *
                  </label>
                  <input
                    type="text"
                    required
                    value={bookingData.customerName}
                    onChange={(e) => setBookingData({ ...bookingData, customerName: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="กรอกชื่อ-นามสกุล"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    อีเมล *
                  </label>
                  <input
                    type="email"
                    required
                    value={bookingData.customerEmail}
                    onChange={(e) => setBookingData({ ...bookingData, customerEmail: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="your@email.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    เบอร์โทรศัพท์ *
                  </label>
                  <input
                    type="tel"
                    required
                    value={bookingData.customerPhone}
                    onChange={(e) => setBookingData({ ...bookingData, customerPhone: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="08x-xxx-xxxx"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    เลขบัตรประชาชน
                  </label>
                  <input
                    type="text"
                    value={bookingData.customerIdCard}
                    onChange={(e) => setBookingData({ ...bookingData, customerIdCard: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="x-xxxx-xxxxx-xx-x"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    วันรับรถ *
                  </label>
                  <input
                    type="date"
                    required
                    value={bookingData.startDate}
                    onChange={(e) => setBookingData({ ...bookingData, startDate: e.target.value })}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    วันคืนรถ *
                  </label>
                  <input
                    type="date"
                    required
                    value={bookingData.endDate}
                    onChange={(e) => setBookingData({ ...bookingData, endDate: e.target.value })}
                    min={bookingData.startDate || new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    สถานที่รับรถ *
                  </label>
                  <select
                    required
                    value={bookingData.pickupLocation}
                    onChange={(e) => setBookingData({ ...bookingData, pickupLocation: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option value="กรุงเทพฯ">กรุงเทพฯ</option>
                    <option value="เชียงใหม่">เชียงใหม่</option>
                    <option value="ภูเก็ต">ภูเก็ต</option>
                    <option value="พัทยา">พัทยา</option>
                    <option value="หัวหิน">หัวหิน</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    สถานที่คืนรถ
                  </label>
                  <select
                    value={bookingData.dropoffLocation}
                    onChange={(e) => setBookingData({ ...bookingData, dropoffLocation: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option value="">เหมือนที่รับรถ</option>
                    <option value="กรุงเทพฯ">กรุงเทพฯ</option>
                    <option value="เชียงใหม่">เชียงใหม่</option>
                    <option value="ภูเก็ต">ภูเก็ต</option>
                    <option value="พัทยา">พัทยา</option>
                    <option value="หัวหิน">หัวหิน</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  คำขอพิเศษ
                </label>
                <textarea
                  value={bookingData.specialRequests}
                  onChange={(e) => setBookingData({ ...bookingData, specialRequests: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="มีข้อความอะไรถึงเราบ้างไหม..."
                />
              </div>

              {calculateTotalDays() > 0 && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-700">จำนวนวัน:</span>
                    <span className="font-semibold">{calculateTotalDays()} วัน</span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-700">ราคาต่อวัน:</span>
                    <span className="font-semibold">฿{vehicle.price_per_day?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-orange-300">
                    <span className="font-bold text-gray-900">ยอดรวมทั้งหมด:</span>
                    <span className="text-2xl font-bold text-orange-600">
                      ฿{calculateTotal().toLocaleString()}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 mt-2">
                    *มัดจำ 30% (฿{(calculateTotal() * 0.3).toLocaleString()})
                  </p>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setBookingModalOpen(false)}
                  className="flex-1 px-6 py-3 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={submitting || bookingSuccess}
                  className="flex-1 bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-700 transition-colors disabled:bg-gray-400"
                >
                  {submitting ? 'กำลังจอง...' : bookingSuccess ? 'จองสำเร็จ' : 'ยืนยันการจอง'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}