// Supply Chain Domain Types

export type ShipmentStatus = 'pending' | 'in-transit' | 'delayed' | 'delivered';
export type ShipmentPriority = 'low' | 'medium' | 'high' | 'critical';
export type PortStatus = 'operational' | 'congested' | 'maintenance' | 'closed';
export type TrackingEventType = 'departure' | 'arrival' | 'customs_clearance' | 'delay' | 'delivery';

export interface Port {
  id: string;
  portCode: string;
  portName: string;
  country: string;
  city: string;
  latitude: number | null;
  longitude: number | null;
  capacity: number;
  currentUtilization: number;
  portStatus: PortStatus;
  averageProcessingTimeHours: number;
  createdAt: string;
  updatedAt: string;
}

export interface Shipment {
  id: string;
  shipmentId: string;
  originPortId: string | null;
  destinationPortId: string | null;
  carrier: string;
  itemsCount: number;
  estimatedArrival: string;
  actualArrival: string | null;
  shipmentStatus: ShipmentStatus;
  shipmentPriority: ShipmentPriority;
  progressPercentage: number;
  lastLocationUpdate: string | null;
  currentLatitude: number | null;
  currentLongitude: number | null;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
  originPort?: Port;
  destinationPort?: Port;
}

export interface TrackingEvent {
  id: string;
  shipmentId: string;
  eventType: TrackingEventType;
  eventDescription: string;
  eventLocation: string | null;
  eventLatitude: number | null;
  eventLongitude: number | null;
  eventTimestamp: string;
  metadata: Record<string, any> | null;
  createdAt: string;
}

export interface PortMetric {
  id: string;
  portId: string;
  metricDate: string;
  vesselsArrived: number;
  vesselsDeparted: number;
  averageWaitTimeHours: number;
  throughputTeu: number;
  congestionLevel: number;
  recordedAt: string;
  port?: Port;
}