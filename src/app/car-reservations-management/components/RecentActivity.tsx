'use client';

import React from 'react';
import { Reservation } from '@/services/reservationService';
import { Vehicle } from '@/services/vehicleService';

interface ReservationWithVehicle extends Reservation {
  vehicle?: Vehicle | null;
}

interface RecentActivityProps {
  reservations: ReservationWithVehicle[];
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'confirmed':
      return 'bg-green-100';
    case 'pending':
      return 'bg-yellow-100';
    case 'active':
      return 'bg-blue-100';
    case 'completed':
      return 'bg-gray-100';
    case 'cancelled':
      return 'bg-red-100';
    default:
      return 'bg-gray-100';
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

export default function RecentActivity({ reservations }: RecentActivityProps) {
  const recentReservations = reservations.slice(0, 5);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">กิจกรรมล่าสุด</h3>
      <div className="space-y-3">
        {recentReservations.map((reservation) => (
          <div key={reservation.id} className="flex items-start gap-3">
            <div className={`w-2 h-2 rounded-full mt-2 ${getStatusColor(reservation.status)}`} />
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
  );
}