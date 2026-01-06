'use client';

import React, { useState, useEffect } from 'react';
import Icon from '@/components/ui/AppIcon';

interface ShipmentPin {
  id: string;
  lat: number;
  lng: number;
  status: 'on-time' | 'delayed' | 'critical';
  shipmentId: string;
  origin: string;
  destination: string;
  eta: string;
}

interface GlobalMapProps {
  shipments: ShipmentPin[];
  onPinClick?: (shipment: ShipmentPin) => void;
}

const GlobalMap = ({ shipments, onPinClick }: GlobalMapProps) => {
  const [isHydrated, setIsHydrated] = useState(false);
  const [selectedPin, setSelectedPin] = useState<ShipmentPin | null>(null);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  if (!isHydrated) {
    return (
      <div className="w-full h-96 bg-muted rounded-xl flex items-center justify-center">
        <div className="text-center">
          <Icon name="MapIcon" size={48} className="text-muted-foreground mx-auto mb-2" />
          <p className="text-muted-foreground">กำลังโหลดแผนที่...</p>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'on-time': return 'bg-green-500';
      case 'delayed': return 'bg-yellow-500';
      case 'critical': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'on-time': return 'ตรงเวลา';
      case 'delayed': return 'ล่าช้า';
      case 'critical': return 'วิกฤต';
      default: return 'ไม่ทราบสถานะ';
    }
  };

  const handlePinClick = (shipment: ShipmentPin) => {
    setSelectedPin(shipment);
    onPinClick?.(shipment);
  };

  return (
    <div className="relative w-full h-96 bg-card rounded-xl overflow-hidden border border-border">
      {/* Map Container - Centered on Thailand */}
      <div className="w-full h-full relative">
        <iframe
          width="100%"
          height="100%"
          loading="lazy"
          title="แผนที่โซ่อุปทานประเทศไทย"
          referrerPolicy="no-referrer-when-downgrade"
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15868743.25344543!2d93.22362908125!3d13.756331!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x304d8df747424db1%3A0x9ed72c880757e802!2sThailand!5e0!3m2!1sen!2sth!4v1736155697139!5m2!1sen!2sth"
          className="w-full h-full"
          allowFullScreen
        />
        
        {/* Overlay Pins */}
        <div className="absolute inset-0 pointer-events-none">
          {shipments.map((shipment, index) => (
            <div
              key={shipment.id}
              className="absolute pointer-events-auto cursor-pointer transform -translate-x-1/2 -translate-y-1/2"
              style={{
                left: `${20 + (index % 8) * 10}%`,
                top: `${30 + Math.floor(index / 8) * 15}%`
              }}
              onClick={() => handlePinClick(shipment)}
            >
              <div className={`w-4 h-4 rounded-full ${getStatusColor(shipment.status)} border-2 border-white shadow-lg animate-pulse`} />
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm rounded-lg p-3 shadow-lg">
        <h4 className="text-sm font-semibold mb-2">สถานะการจัดส่ง</h4>
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full" />
            <span className="text-xs">ตรงเวลา</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-yellow-500 rounded-full" />
            <span className="text-xs">ล่าช้า</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded-full" />
            <span className="text-xs">วิกฤต</span>
          </div>
        </div>
      </div>

      {/* Tooltip */}
      {selectedPin && (
        <div className="absolute top-4 left-4 bg-white rounded-lg p-4 shadow-lg max-w-xs">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-semibold text-sm">การจัดส่ง {selectedPin.shipmentId}</h4>
            <button
              onClick={() => setSelectedPin(null)}
              className="text-gray-400 hover:text-gray-600"
            >
              <Icon name="XMarkIcon" size={16} />
            </button>
          </div>
          <div className="space-y-1 text-xs text-gray-600">
            <p><span className="font-medium">จาก:</span> {selectedPin.origin}</p>
            <p><span className="font-medium">ถึง:</span> {selectedPin.destination}</p>
            <p><span className="font-medium">เวลาถึงโดยประมาณ:</span> {selectedPin.eta}</p>
            <div className="flex items-center space-x-1 mt-2">
              <div className={`w-2 h-2 rounded-full ${getStatusColor(selectedPin.status)}`} />
              <span>{getStatusLabel(selectedPin.status)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GlobalMap;