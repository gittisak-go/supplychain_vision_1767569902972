'use client';

import React from 'react';
import { CalendarIcon, MapPinIcon, ClockIcon, CurrencyDollarIcon, CheckCircleIcon, PencilIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { Reservation } from '@/services/reservationService';
import { Vehicle } from '@/services/vehicleService';

interface ReservationWithVehicle extends Reservation {
  vehicle?: Vehicle | null;
}

interface ReservationCardProps {
  reservation: ReservationWithVehicle;
  onConfirm: (id: string) => void;
  onModify: (reservation: ReservationWithVehicle) => void;
  onCancel: (reservation: ReservationWithVehicle) => void;
  onViewDetails: (reservation: ReservationWithVehicle) => void;
}

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

export default function ReservationCard({
  reservation,
  onConfirm,
  onModify,
  onCancel,
  onViewDetails,
}: ReservationCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
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
              onClick={() => onConfirm(reservation.id)}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
            >
              <CheckCircleIcon className="w-4 h-4" />
              ยืนยันการจอง
            </button>
          )}

          {(reservation.status === 'pending' || reservation.status === 'confirmed') && (
            <>
              <button
                onClick={() => onModify(reservation)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                <PencilIcon className="w-4 h-4" />
                แก้ไข
              </button>
              <button
                onClick={() => onCancel(reservation)}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
              >
                <XMarkIcon className="w-4 h-4" />
                ยกเลิก
              </button>
            </>
          )}

          <button
            onClick={() => onViewDetails(reservation)}
            className="ml-auto text-sm text-orange-600 hover:text-orange-700 font-medium"
          >
            ดูรายละเอียด →
          </button>
        </div>
      </div>
    </div>
  );
}