'use client';

import React, { useState, useEffect } from 'react';
import { reservationService, Reservation } from '@/services/reservationService';
import { vehicleService, Vehicle } from '@/services/vehicleService';
import { supabase } from '@/lib/supabase/client';
import { MagnifyingGlassIcon, CalendarIcon, MapPinIcon, ClockIcon, CurrencyDollarIcon, XMarkIcon, PencilIcon, CheckCircleIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';

interface ReservationWithVehicle extends Reservation {
  vehicle?: Vehicle | null;
}

export default function CarReservationsManagement() {
  const [reservations, setReservations] = useState<ReservationWithVehicle[]>([]);
  const [filteredReservations, setFilteredReservations] = useState<ReservationWithVehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [selectedReservation, setSelectedReservation] = useState<ReservationWithVehicle | null>(null);
  const [showModifyModal, setShowModifyModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  useEffect(() => {
    loadReservations();
    setupRealtimeSubscription();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [reservations, searchTerm, statusFilter, dateRange]);

  const loadReservations = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await reservationService.getAllReservations();
      
      const reservationsWithVehicles = await Promise.all(
        data?.map(async (reservation) => {
          try {
            const vehicle = await vehicleService.getVehicleById(reservation.vehicle_id);
            return { ...reservation, vehicle };
          } catch (err) {
            return { ...reservation, vehicle: null };
          }
        }) || []
      );

      setReservations(reservationsWithVehicles);
    } catch (err: any) {
      setError(err?.message || 'Failed to load reservations');
    } finally {
      setLoading(false);
    }
  };

  const setupRealtimeSubscription = () => {
    const subscription = supabase
      .channel('reservations_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'reservations'
        },
        () => {
          loadReservations();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  };

  const applyFilters = () => {
    let filtered = [...reservations];

    if (searchTerm) {
      filtered = filtered.filter(
        (r) =>
          r.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          r.customer_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          r.id?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter((r) => r.status === statusFilter);
    }

    if (dateRange.start) {
      filtered = filtered.filter((r) => r.start_date >= dateRange.start);
    }

    if (dateRange.end) {
      filtered = filtered.filter((r) => r.end_date <= dateRange.end);
    }

    setFilteredReservations(filtered);
  };

  const handleCancelReservation = async (id: string) => {
    try {
      setError(null);
      await reservationService.cancelReservation(id);
      setShowCancelModal(false);
      setSelectedReservation(null);
      setCancelReason('');
      loadReservations();
    } catch (err: any) {
      setError(err?.message || 'Failed to cancel reservation');
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: 'pending' | 'confirmed' | 'active' | 'completed' | 'cancelled') => {
    try {
      setError(null);
      await reservationService.updateReservationStatus(id, newStatus);
      loadReservations();
    } catch (err: any) {
      setError(err?.message || 'Failed to update reservation status');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'active':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'ยืนยันแล้ว';
      case 'pending':
        return 'รอดำเนินการ';
      case 'active':
        return 'กำลังใช้งาน';
      case 'completed':
        return 'เสร็จสิ้น';
      case 'cancelled':
        return 'ยกเลิก';
      default:
        return status;
    }
  };

  const calculateStats = () => {
    const total = reservations.length;
    const confirmed = reservations.filter((r) => r.status === 'confirmed').length;
    const active = reservations.filter((r) => r.status === 'active').length;
    const pending = reservations.filter((r) => r.status === 'pending').length;
    const totalRevenue = reservations
      .filter((r) => r.status !== 'cancelled')
      .reduce((sum, r) => sum + Number(r.total_amount || 0), 0);

    return { total, confirmed, active, pending, totalRevenue };
  };

  const stats = calculateStats();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">กำลังโหลดข้อมูลการจอง...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">จัดการการจองรถยนต์</h1>
              <p className="text-sm text-gray-600 mt-1">ดู แก้ไข และยกเลิกการจองของคุณ</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-gray-600">การจองทั้งหมด</p>
                <p className="text-2xl font-bold text-orange-600">{stats.total}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
            <ExclamationCircleIcon className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-red-800">{error}</p>
            </div>
            <button onClick={() => setError(null)} className="text-red-600 hover:text-red-800">
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Content - 8 columns */}
          <div className="lg:col-span-8 space-y-6">
            {/* Filters */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Search */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">ค้นหา</label>
                  <div className="relative">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="ชื่อลูกค้า, อีเมล, รหัสการจอง..."
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Status Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">สถานะ</label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option value="all">ทั้งหมด</option>
                    <option value="pending">รอดำเนินการ</option>
                    <option value="confirmed">ยืนยันแล้ว</option>
                    <option value="active">กำลังใช้งาน</option>
                    <option value="completed">เสร็จสิ้น</option>
                    <option value="cancelled">ยกเลิก</option>
                  </select>
                </div>

                {/* Date Range */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">วันที่</label>
                  <input
                    type="date"
                    value={dateRange.start}
                    onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
              </div>

              {(searchTerm || statusFilter !== 'all' || dateRange.start || dateRange.end) && (
                <div className="mt-4 flex items-center justify-between pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-600">
                    พบ {filteredReservations.length} รายการจากทั้งหมด {reservations.length} รายการ
                  </p>
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setStatusFilter('all');
                      setDateRange({ start: '', end: '' });
                    }}
                    className="text-sm text-orange-600 hover:text-orange-700 font-medium"
                  >
                    ล้างตัวกรอง
                  </button>
                </div>
              )}
            </div>

            {/* Reservations List */}
            <div className="space-y-4">
              {filteredReservations.length === 0 ? (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                  <CalendarIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">ไม่พบการจอง</h3>
                  <p className="text-gray-600">ไม่มีการจองที่ตรงกับเงื่อนไขที่คุณค้นหา</p>
                </div>
              ) : (
                filteredReservations.map((reservation) => (
                  <div
                    key={reservation.id}
                    className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
                  >
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start gap-4 flex-1">
                          {reservation.vehicle?.image_url && (
                            <img
                              src={reservation.vehicle.image_url}
                              alt={`${reservation.vehicle.brand} ${reservation.vehicle.model}`}
                              className="w-24 h-24 rounded-lg object-cover"
                            />
                          )}
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-lg font-semibold text-gray-900">
                                {reservation.vehicle ? `${reservation.vehicle.brand} ${reservation.vehicle.model}` : 'Loading...'}
                              </h3>
                              <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(reservation.status)}`}>
                                {getStatusText(reservation.status)}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 mb-1">รหัสการจอง: {reservation.id}</p>
                            <p className="text-sm text-gray-600">ผู้จอง: {reservation.customer_name}</p>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div className="flex items-start gap-2">
                          <CalendarIcon className="w-5 h-5 text-gray-400 mt-0.5" />
                          <div>
                            <p className="text-xs text-gray-600">วันรับรถ</p>
                            <p className="text-sm font-medium text-gray-900">
                              {new Date(reservation.start_date).toLocaleDateString('th-TH')}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start gap-2">
                          <CalendarIcon className="w-5 h-5 text-gray-400 mt-0.5" />
                          <div>
                            <p className="text-xs text-gray-600">วันคืนรถ</p>
                            <p className="text-sm font-medium text-gray-900">
                              {new Date(reservation.end_date).toLocaleDateString('th-TH')}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start gap-2">
                          <ClockIcon className="w-5 h-5 text-gray-400 mt-0.5" />
                          <div>
                            <p className="text-xs text-gray-600">จำนวนวัน</p>
                            <p className="text-sm font-medium text-gray-900">{reservation.total_days} วัน</p>
                          </div>
                        </div>

                        <div className="flex items-start gap-2">
                          <CurrencyDollarIcon className="w-5 h-5 text-gray-400 mt-0.5" />
                          <div>
                            <p className="text-xs text-gray-600">ราคารวม</p>
                            <p className="text-sm font-medium text-orange-600">
                              ฿{Number(reservation.total_amount).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-start gap-2 mb-4">
                        <MapPinIcon className="w-5 h-5 text-gray-400 mt-0.5" />
                        <div>
                          <p className="text-xs text-gray-600">สถานที่รับ-คืนรถ</p>
                          <p className="text-sm font-medium text-gray-900">
                            {reservation.pickup_location}
                            {reservation.dropoff_location && ` → ${reservation.dropoff_location}`}
                          </p>
                        </div>
                      </div>

                      {reservation.special_requests && (
                        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                          <p className="text-xs text-gray-600 mb-1">คำขอพิเศษ</p>
                          <p className="text-sm text-gray-900">{reservation.special_requests}</p>
                        </div>
                      )}

                      <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
                        {reservation.status === 'pending' && (
                          <button
                            onClick={() => handleUpdateStatus(reservation.id, 'confirmed')}
                            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                          >
                            <CheckCircleIcon className="w-4 h-4" />
                            ยืนยันการจอง
                          </button>
                        )}

                        {(reservation.status === 'pending' || reservation.status === 'confirmed') && (
                          <>
                            <button
                              onClick={() => {
                                setSelectedReservation(reservation);
                                setShowModifyModal(true);
                              }}
                              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                            >
                              <PencilIcon className="w-4 h-4" />
                              แก้ไข
                            </button>
                            <button
                              onClick={() => {
                                setSelectedReservation(reservation);
                                setShowCancelModal(true);
                              }}
                              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                            >
                              <XMarkIcon className="w-4 h-4" />
                              ยกเลิก
                            </button>
                          </>
                        )}

                        <button
                          onClick={() => setSelectedReservation(reservation)}
                          className="ml-auto text-sm text-orange-600 hover:text-orange-700 font-medium"
                        >
                          ดูรายละเอียด →
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Sidebar - 4 columns */}
          <div className="lg:col-span-4 space-y-6">
            {/* Summary Stats */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">สรุปการจอง</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">ยืนยันแล้ว</span>
                  <span className="text-lg font-semibold text-green-600">{stats.confirmed}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">กำลังใช้งาน</span>
                  <span className="text-lg font-semibold text-blue-600">{stats.active}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">รอดำเนินการ</span>
                  <span className="text-lg font-semibold text-yellow-600">{stats.pending}</span>
                </div>
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">รายได้รวม</span>
                    <span className="text-lg font-semibold text-orange-600">
                      ฿{stats.totalRevenue.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Upcoming Alerts */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">การจองที่จะถึง</h3>
              <div className="space-y-3">
                {filteredReservations
                  .filter((r) => r.status === 'confirmed' || r.status === 'pending')
                  .slice(0, 5)
                  .map((reservation) => (
                    <div key={reservation.id} className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                      <p className="text-sm font-medium text-gray-900">{reservation.customer_name}</p>
                      <p className="text-xs text-gray-600 mt-1">
                        {new Date(reservation.start_date).toLocaleDateString('th-TH')}
                      </p>
                    </div>
                  ))}
                {filteredReservations.filter((r) => r.status === 'confirmed' || r.status === 'pending').length === 0 && (
                  <p className="text-sm text-gray-600 text-center py-4">ไม่มีการจองที่จะถึง</p>
                )}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">กิจกรรมล่าสุด</h3>
              <div className="space-y-3">
                {reservations
                  .slice(0, 5)
                  .map((reservation) => (
                    <div key={reservation.id} className="flex items-start gap-3">
                      <div className={`w-2 h-2 rounded-full mt-2 ${getStatusColor(reservation.status).split(' ')[0]}`} />
                      <div className="flex-1">
                        <p className="text-sm text-gray-900">{reservation.customer_name}</p>
                        <p className="text-xs text-gray-600">
                          {getStatusText(reservation.status)} •{' '}
                          {reservation.created_at && new Date(reservation.created_at).toLocaleDateString('th-TH')}
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cancel Modal */}
      {showCancelModal && selectedReservation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">ยกเลิกการจอง</h3>
            <p className="text-sm text-gray-600 mb-4">
              คุณแน่ใจหรือไม่ว่าต้องการยกเลิกการจองนี้? การดำเนินการนี้ไม่สามารถย้อนกลับได้
            </p>
            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="เหตุผลในการยกเลิก (ไม่บังคับ)"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent mb-4"
              rows={3}
            />
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  setShowCancelModal(false);
                  setSelectedReservation(null);
                  setCancelReason('');
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
              >
                ยกเลิก
              </button>
              <button
                onClick={() => handleCancelReservation(selectedReservation.id)}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
              >
                ยืนยันการยกเลิก
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modify Modal Placeholder */}
      {showModifyModal && selectedReservation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">แก้ไขการจอง</h3>
            <p className="text-sm text-gray-600 mb-4">ฟีเจอร์นี้อยู่ระหว่างการพัฒนา</p>
            <button
              onClick={() => {
                setShowModifyModal(false);
                setSelectedReservation(null);
              }}
              className="w-full px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm font-medium"
            >
              ปิด
            </button>
          </div>
        </div>
      )}
    </div>
  );
}