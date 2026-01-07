'use client';

import React from 'react';
import { Reservation } from '@/services/reservationService';
import { Vehicle } from '@/services/vehicleService';

interface ReservationWithVehicle extends Reservation {
  vehicle?: Vehicle | null;
}

interface ModifyReservationModalProps {
  isOpen: boolean;
  reservation: ReservationWithVehicle | null;
  onClose: () => void;
}

export default function ModifyReservationModal({
  isOpen,
  reservation,
  onClose,
}: ModifyReservationModalProps) {
  if (!isOpen || !reservation) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">แก้ไขการจอง</h3>
        <p className="text-sm text-gray-600 mb-4">ฟีเจอร์นี้อยู่ระหว่างการพัฒนา</p>
        <button
          onClick={onClose}
          className="w-full px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm font-medium"
        >
          ปิด
        </button>
      </div>
    </div>
  );
}