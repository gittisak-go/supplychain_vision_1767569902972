'use client';

import React from 'react';

import { Reservation } from '@/services/reservationService';
import { Vehicle } from '@/services/vehicleService';

interface ReservationWithVehicle extends Reservation {
  vehicle?: Vehicle | null;
}

interface CancelReservationModalProps {
  isOpen: boolean;
  reservation: ReservationWithVehicle | null;
  cancelReason: string;
  setCancelReason: (value: string) => void;
  onConfirm: (id: string) => void;
  onClose: () => void;
}

export default function CancelReservationModal({
  isOpen,
  reservation,
  cancelReason,
  setCancelReason,
  onConfirm,
  onClose,
}: CancelReservationModalProps) {
  if (!isOpen || !reservation) return null;

  return (
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
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
          >
            ยกเลิก
          </button>
          <button
            onClick={() => onConfirm(reservation.id)}
            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
          >
            ยืนยันการยกเลิก
          </button>
        </div>
      </div>
    </div>
  );
}