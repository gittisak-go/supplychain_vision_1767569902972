import { Reservation } from '@/services/reservationService';
import { Vehicle } from '@/services/vehicleService';

export interface ReservationWithVehicle extends Reservation {
  vehicle?: Vehicle | null;
}

export interface ReservationStats {
  total: number;
  confirmed: number;
  active: number;
  pending: number;
  totalRevenue: number;
}

export const getStatusColor = (status: string): string => {
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

export const getStatusText = (status: string): string => {
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

export const calculateStats = (reservations: ReservationWithVehicle[]): ReservationStats => {
  const total = reservations.length;
  const confirmed = reservations.filter((r) => r.status === 'confirmed').length;
  const active = reservations.filter((r) => r.status === 'active').length;
  const pending = reservations.filter((r) => r.status === 'pending').length;
  const totalRevenue = reservations
    .filter((r) => r.status !== 'cancelled')
    .reduce((sum, r) => sum + Number(r.total_amount || 0), 0);

  return { total, confirmed, active, pending, totalRevenue };
};