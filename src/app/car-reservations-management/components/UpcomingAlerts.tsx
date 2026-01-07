'use client';

import React from 'react';
import { Reservation } from '@/services/reservationService';
import { Vehicle } from '@/services/vehicleService';

interface ReservationWithVehicle extends Reservation {
  vehicle?: Vehicle | null;
}

interface UpcomingAlertsProps {
  reservations: ReservationWithVehicle[];
}

export default function UpcomingAlerts({ reservations }: UpcomingAlertsProps) {
  const upcomingReservations = reservations
    .filter((r) => r.status === 'confirmed' || r.status === 'pending')
    .slice(0, 5);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">การจองที่จะถึง</h3>
      <div className="space-y-3">
        {upcomingReservations.map((reservation) => (
          <div key={reservation.id} className="p-3 bg-orange-50 rounded-lg border border-orange-200">
            <p className="text-sm font-medium text-gray-900">{reservation.customer_name}</p>
            <p className="text-xs text-gray-600 mt-1">
              {new Date(reservation.start_date).toLocaleDateString('th-TH')}
            </p>
          </div>
        ))}
        {upcomingReservations.length === 0 && (
          <p className="text-sm text-gray-600 text-center py-4">ไม่มีการจองที่จะถึง</p>
        )}
      </div>
    </div>
  );
}