'use client';

import React from 'react';

interface ReservationStats {
  total: number;
  confirmed: number;
  active: number;
  pending: number;
  totalRevenue: number;
}

interface SummaryStatsProps {
  stats: ReservationStats;
}

export default function SummaryStats({ stats }: SummaryStatsProps) {
  return (
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
  );
}