'use client';

import React, { useState, useEffect } from 'react';
import { reservationService } from '@/services/reservationService';
import { vehicleService } from '@/services/vehicleService';
import { supabase } from '@/lib/supabase/client';
import { ExclamationCircleIcon, XMarkIcon } from '@heroicons/react/24/outline';
import ReservationFilters from './components/ReservationFilters';
import ReservationCard from './components/ReservationCard';
import SummaryStats from './components/SummaryStats';
import UpcomingAlerts from './components/UpcomingAlerts';
import RecentActivity from './components/RecentActivity';
import CancelReservationModal from './components/CancelReservationModal';
import ModifyReservationModal from './components/ModifyReservationModal';
import EmptyState from './components/EmptyState';
import { ReservationWithVehicle, calculateStats } from './utils/reservationUtils';

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

  const handleClearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setDateRange({ start: '', end: '' });
  };

  const handleModifyReservation = (reservation: ReservationWithVehicle) => {
    setSelectedReservation(reservation);
    setShowModifyModal(true);
  };

  const handleCancelClick = (reservation: ReservationWithVehicle) => {
    setSelectedReservation(reservation);
    setShowCancelModal(true);
  };

  const handleCloseModals = () => {
    setShowModifyModal(false);
    setShowCancelModal(false);
    setSelectedReservation(null);
    setCancelReason('');
  };

  const stats = calculateStats(reservations);

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
            <ReservationFilters
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
              dateRange={dateRange}
              setDateRange={setDateRange}
              filteredCount={filteredReservations.length}
              totalCount={reservations.length}
              onClearFilters={handleClearFilters}
            />

            {/* Reservations List */}
            <div className="space-y-4">
              <EmptyState filteredReservations={filteredReservations} />
              {filteredReservations.map((reservation) => (
                <ReservationCard
                  key={reservation.id}
                  reservation={reservation}
                  onConfirm={(id) => handleUpdateStatus(id, 'confirmed')}
                  onModify={handleModifyReservation}
                  onCancel={handleCancelClick}
                  onViewDetails={setSelectedReservation}
                />
              ))}
            </div>
          </div>

          {/* Sidebar - 4 columns */}
          <div className="lg:col-span-4 space-y-6">
            <SummaryStats stats={stats} />
            <UpcomingAlerts reservations={filteredReservations} />
            <RecentActivity reservations={reservations} />
          </div>
        </div>
      </div>

      {/* Modals */}
      <CancelReservationModal
        isOpen={showCancelModal}
        reservation={selectedReservation}
        cancelReason={cancelReason}
        setCancelReason={setCancelReason}
        onConfirm={handleCancelReservation}
        onClose={handleCloseModals}
      />

      <ModifyReservationModal
        isOpen={showModifyModal}
        reservation={selectedReservation}
        onClose={handleCloseModals}
      />
    </div>
  );
}