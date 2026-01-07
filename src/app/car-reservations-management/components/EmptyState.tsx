'use client';

import React from 'react';
import { CalendarIcon } from '@heroicons/react/24/outline';
import { ReservationWithVehicle } from '../utils/reservationUtils';

interface EmptyStateProps {
  filteredReservations: ReservationWithVehicle[];
}

export default function EmptyState({ filteredReservations }: EmptyStateProps) {
  if (filteredReservations.length > 0) return null;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
      <CalendarIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">ไม่พบการจอง</h3>
      <p className="text-gray-600">ไม่มีการจองที่ตรงกับเงื่อนไขที่คุณค้นหา</p>
    </div>
  );
}