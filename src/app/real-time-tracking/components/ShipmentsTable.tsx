'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { RealtimePostgresChangesPayload } from '@supabase/supabase-js';
import Icon from '@/components/ui/AppIcon';
import { supplyChainService } from '@/services/supplyChainService';
import { Shipment, ShipmentStatus } from '@/types/supply-chain.types';

interface ShipmentsTableProps {
  searchTerm: string;
  filters: {
    status: string;
    priority: string;
    dateRange: string;
  };
}

const ShipmentsTable = ({ searchTerm, filters }: ShipmentsTableProps) => {
  const [sortField, setSortField] = useState<keyof Shipment>('estimatedArrival');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [selectedShipments, setSelectedShipments] = useState<string[]>([]);
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Load shipments from Supabase
  useEffect(() => {
    loadShipments();
  }, []);

  // Real-time subscription
  useEffect(() => {
    const unsubscribe = supplyChainService.subscribeToShipments((payload: RealtimePostgresChangesPayload<any>) => {
      if (payload.eventType === 'INSERT') {
        setShipments(current => [payload.new as Shipment, ...current]);
      } else if (payload.eventType === 'UPDATE') {
        setShipments(current =>
          current?.map(shipment =>
            shipment?.id === payload?.new?.id ? payload.new as Shipment : shipment
          ) || []
        );
      } else if (payload.eventType === 'DELETE') {
        setShipments(current =>
          current?.filter(shipment => shipment?.id !== payload?.old?.id) || []
        );
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const loadShipments = async (): Promise<void> => {
    try {
      setLoading(true);
      const { data, error } = await supplyChainService.getAllShipments();
      if (error) throw error;
      setShipments(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการโหลดข้อมูล');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: ShipmentStatus) => {
    const statusConfig = {
      'in-transit': { color: 'bg-blue-100 text-blue-800', label: 'กำลังขนส่ง' },
      'delayed': { color: 'bg-red-100 text-red-800', label: 'ล่าช้า' },
      'delivered': { color: 'bg-green-100 text-green-800', label: 'จัดส่งแล้ว' },
      'pending': { color: 'bg-yellow-100 text-yellow-800', label: 'รอดำเนินการ' }
    };

    const config = statusConfig[status];
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const priorityConfig: Record<string, { color: string; label: string }> = {
      'critical': { color: 'bg-red-500', label: 'วิกฤต' },
      'high': { color: 'bg-orange-500', label: 'สูง' },
      'medium': { color: 'bg-yellow-500', label: 'ปานกลาง' },
      'low': { color: 'bg-gray-500', label: 'ต่ำ' }
    };

    const config = priorityConfig[priority] || priorityConfig['medium'];
    return (
      <div className="flex items-center space-x-2">
        <div className={`w-2 h-2 rounded-full ${config.color}`}></div>
        <span className="text-xs text-muted-foreground">{config.label}</span>
      </div>
    );
  };

  const filteredAndSortedShipments = useMemo(() => {
    let filtered = shipments?.filter(shipment => {
      const matchesSearch = searchTerm === '' || 
        shipment?.shipmentId?.toLowerCase()?.includes(searchTerm.toLowerCase()) ||
        shipment?.originPort?.city?.toLowerCase()?.includes(searchTerm.toLowerCase()) ||
        shipment?.destinationPort?.city?.toLowerCase()?.includes(searchTerm.toLowerCase());

      const matchesStatus = filters.status === 'all' || shipment?.shipmentStatus === filters.status;
      const matchesPriority = filters.priority === 'all' || shipment?.shipmentPriority === filters.priority;

      return matchesSearch && matchesStatus && matchesPriority;
    }) || [];

    filtered.sort((a, b) => {
      const aValue = a?.[sortField];
      const bValue = b?.[sortField];
      
      if (sortDirection === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    return filtered;
  }, [shipments, searchTerm, filters, sortField, sortDirection]);

  const handleSort = (field: keyof Shipment) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleSelectShipment = (shipmentId: string) => {
    setSelectedShipments(prev => 
      prev.includes(shipmentId) 
        ? prev.filter(id => id !== shipmentId)
        : [...prev, shipmentId]
    );
  };

  const handleSelectAll = () => {
    if (selectedShipments.length === filteredAndSortedShipments.length) {
      setSelectedShipments([]);
    } else {
      setSelectedShipments(filteredAndSortedShipments.map(s => s.id));
    }
  };

  if (loading) {
    return (
      <div className="bg-card rounded-lg border border-border p-12">
        <div className="flex items-center justify-center">
          <Icon name="ArrowPathIcon" size={32} className="animate-spin text-primary" />
          <span className="ml-3 text-muted-foreground">กำลังโหลดข้อมูล...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-card rounded-lg border border-border p-12">
        <div className="text-center">
          <Icon name="ExclamationTriangleIcon" size={48} className="mx-auto text-red-500 mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">เกิดข้อผิดพลาด</h3>
          <p className="text-muted-foreground mb-4">{error}</p>
          <button 
            onClick={loadShipments}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
          >
            ลองใหม่อีกครั้ง
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-lg border border-border overflow-hidden">
      {/* Table Header Actions */}
      {selectedShipments.length > 0 && (
        <div className="px-6 py-3 bg-primary/5 border-b border-border">
          <div className="flex items-center justify-between">
            <span className="text-sm text-foreground">
              เลือก {selectedShipments.length} รายการ
            </span>
            <div className="flex items-center space-x-2">
              <button className="px-3 py-1.5 text-xs bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-smooth">
                อัพเดทสถานะ
              </button>
              <button className="px-3 py-1.5 text-xs bg-secondary text-secondary-foreground rounded hover:bg-secondary/90 transition-smooth">
                ส่งออกข้อมูล
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              <th className="w-12 px-6 py-4">
                <input
                  type="checkbox"
                  checked={selectedShipments.length === filteredAndSortedShipments.length && filteredAndSortedShipments.length > 0}
                  onChange={handleSelectAll}
                  className="rounded border-border focus:ring-ring"
                />
              </th>
              <th 
                className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer hover:text-foreground transition-smooth"
                onClick={() => handleSort('shipmentId')}
              >
                <div className="flex items-center space-x-1">
                  <span>รหัสการจัดส่ง</span>
                  <Icon name="ChevronUpDownIcon" size={14} />
                </div>
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                ต้นทาง
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                ปลายทาง
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                จำนวนสินค้า
              </th>
              <th 
                className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer hover:text-foreground transition-smooth"
                onClick={() => handleSort('estimatedArrival')}
              >
                <div className="flex items-center space-x-1">
                  <span>เวลาที่คาดว่าจะถึง</span>
                  <Icon name="ChevronUpDownIcon" size={14} />
                </div>
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                สถานะ
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                ความสำคัญ
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                ความคืบหน้า
              </th>
              <th className="px-6 py-4 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                การดำเนินการ
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filteredAndSortedShipments?.map((shipment) => (
              <tr 
                key={shipment?.id} 
                className={`hover:bg-muted/50 transition-smooth ${
                  selectedShipments.includes(shipment?.id) ? 'bg-primary/5' : ''
                }`}
              >
                <td className="px-6 py-4">
                  <input
                    type="checkbox"
                    checked={selectedShipments.includes(shipment?.id)}
                    onChange={() => handleSelectShipment(shipment?.id)}
                    className="rounded border-border focus:ring-ring"
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-foreground">{shipment?.shipmentId}</div>
                  <div className="text-xs text-muted-foreground">{shipment?.carrier}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-foreground">{shipment?.originPort?.city || 'N/A'}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-foreground">{shipment?.destinationPort?.city || 'N/A'}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-foreground">{shipment?.itemsCount?.toLocaleString()}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-foreground">
                    {new Date(shipment?.estimatedArrival).toLocaleDateString('th-TH', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getStatusBadge(shipment?.shipmentStatus)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getPriorityBadge(shipment?.shipmentPriority)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-2">
                    <div className="w-16 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full transition-all duration-300"
                        style={{ width: `${shipment?.progressPercentage}%` }}
                      ></div>
                    </div>
                    <span className="text-xs text-muted-foreground">{shipment?.progressPercentage}%</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <div className="flex items-center justify-end space-x-2">
                    <button 
                      className="p-1 text-muted-foreground hover:text-foreground transition-smooth"
                      title="ดูรายละเอียด"
                    >
                      <Icon name="EyeIcon" size={16} />
                    </button>
                    <button 
                      className="p-1 text-muted-foreground hover:text-foreground transition-smooth"
                      title="ติดตามพัสดุ"
                    >
                      <Icon name="MapPinIcon" size={16} />
                    </button>
                    <button 
                      className="p-1 text-muted-foreground hover:text-foreground transition-smooth"
                      title="ตัวเลือกเพิ่มเติม"
                    >
                      <Icon name="EllipsisVerticalIcon" size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Empty State */}
      {filteredAndSortedShipments.length === 0 && (
        <div className="px-6 py-12 text-center">
          <Icon name="TruckIcon" size={48} className="mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">ไม่พบข้อมูลการจัดส่ง</h3>
          <p className="text-muted-foreground">
            ลองปรับเปลี่ยนเงื่อนไขการค้นหาหรือตัวกรอง
          </p>
        </div>
      )}

      {/* Pagination */}
      {filteredAndSortedShipments.length > 0 && (
        <div className="px-6 py-4 border-t border-border">
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              แสดง {filteredAndSortedShipments.length} จาก {shipments?.length || 0} รายการ
            </div>
            <div className="flex items-center space-x-2">
              <button className="px-3 py-1.5 text-sm border border-border rounded hover:bg-muted transition-smooth">
                ก่อนหน้า
              </button>
              <button className="px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-smooth">
                1
              </button>
              <button className="px-3 py-1.5 text-sm border border-border rounded hover:bg-muted transition-smooth">
                ถัดไป
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShipmentsTable;