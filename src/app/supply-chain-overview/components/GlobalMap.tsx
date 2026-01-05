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
          <p className="text-muted-foreground">Loading global map...</p>
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

  const handlePinClick = (shipment: ShipmentPin) => {
    setSelectedPin(shipment);
    onPinClick?.(shipment);
  };

  return (
    <div className="relative w-full h-96 bg-card rounded-xl overflow-hidden border border-border">
      {/* Map Container */}
      <div className="w-full h-full relative">
        <iframe
          width="100%"
          height="100%"
          loading="lazy"
          title="Global Supply Chain Map"
          referrerPolicy="no-referrer-when-downgrade"
          src="https://www.google.com/maps?q=40.7128,-74.0060&z=2&output=embed"
          className="w-full h-full"
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
        <h4 className="text-sm font-semibold mb-2">Shipment Status</h4>
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full" />
            <span className="text-xs">On Time</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-yellow-500 rounded-full" />
            <span className="text-xs">Delayed</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded-full" />
            <span className="text-xs">Critical</span>
          </div>
        </div>
      </div>

      {/* Tooltip */}
      {selectedPin && (
        <div className="absolute top-4 left-4 bg-white rounded-lg p-4 shadow-lg max-w-xs">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-semibold text-sm">Shipment {selectedPin.shipmentId}</h4>
            <button
              onClick={() => setSelectedPin(null)}
              className="text-gray-400 hover:text-gray-600"
            >
              <Icon name="XMarkIcon" size={16} />
            </button>
          </div>
          <div className="space-y-1 text-xs text-gray-600">
            <p><span className="font-medium">From:</span> {selectedPin.origin}</p>
            <p><span className="font-medium">To:</span> {selectedPin.destination}</p>
            <p><span className="font-medium">ETA:</span> {selectedPin.eta}</p>
            <div className="flex items-center space-x-1 mt-2">
              <div className={`w-2 h-2 rounded-full ${getStatusColor(selectedPin.status)}`} />
              <span className="capitalize">{selectedPin.status}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GlobalMap;