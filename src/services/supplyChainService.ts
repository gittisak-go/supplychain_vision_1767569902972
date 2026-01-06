import { supabase } from '../lib/supabase';
import { Shipment, Port, TrackingEvent, PortMetric, ShipmentStatus } from '../types/supply-chain.types';

// Helper function to convert snake_case to camelCase
const toCamelCase = (obj: any): any => {
  if (Array.isArray(obj)) {
    return obj.map(toCamelCase);
  } else if (obj !== null && obj?.constructor === Object) {
    return Object.keys(obj).reduce((result, key) => {
      const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
      result[camelKey] = toCamelCase(obj[key]);
      return result;
    }, {} as any);
  }
  return obj;
};

// Helper function to convert camelCase to snake_case
const toSnakeCase = (obj: any): any => {
  if (Array.isArray(obj)) {
    return obj.map(toSnakeCase);
  } else if (obj !== null && obj?.constructor === Object) {
    return Object.keys(obj).reduce((result, key) => {
      const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
      result[snakeKey] = toSnakeCase(obj[key]);
      return result;
    }, {} as any);
  }
  return obj;
};

export const supplyChainService = {
  // ========== SHIPMENTS ==========
  
  async getAllShipments(): Promise<{ data: Shipment[] | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('shipments')
        .select(`
          *,
          origin_port:ports!shipments_origin_port_id_fkey(port_code, port_name, city),
          destination_port:ports!shipments_destination_port_id_fkey(port_code, port_name, city)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return { data: toCamelCase(data), error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  async getShipmentById(id: string): Promise<{ data: Shipment | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('shipments')
        .select(`
          *,
          origin_port:ports!shipments_origin_port_id_fkey(*),
          destination_port:ports!shipments_destination_port_id_fkey(*)
        `)
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return { data: toCamelCase(data), error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  async getShipmentsByStatus(status: ShipmentStatus): Promise<{ data: Shipment[] | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('shipments')
        .select(`
          *,
          origin_port:ports!shipments_origin_port_id_fkey(port_code, port_name),
          destination_port:ports!shipments_destination_port_id_fkey(port_code, port_name)
        `)
        .eq('shipment_status', status)
        .order('estimated_arrival', { ascending: true });
      
      if (error) throw error;
      return { data: toCamelCase(data), error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  async updateShipmentStatus(
    id: string, 
    status: ShipmentStatus, 
    progressPercentage?: number
  ): Promise<{ data: Shipment | null; error: any }> {
    try {
      const updates: any = { shipment_status: status };
      if (progressPercentage !== undefined) {
        updates.progress_percentage = progressPercentage;
      }

      const { data, error } = await supabase
        .from('shipments')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return { data: toCamelCase(data), error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  // ========== PORTS ==========

  async getAllPorts(): Promise<{ data: Port[] | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('ports')
        .select('*')
        .order('port_name', { ascending: true });
      
      if (error) throw error;
      return { data: toCamelCase(data), error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  async getPortById(id: string): Promise<{ data: Port | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('ports')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return { data: toCamelCase(data), error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  // ========== TRACKING EVENTS ==========

  async getTrackingEventsByShipment(shipmentId: string): Promise<{ data: TrackingEvent[] | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('tracking_events')
        .select('*')
        .eq('shipment_id', shipmentId)
        .order('event_timestamp', { ascending: false });
      
      if (error) throw error;
      return { data: toCamelCase(data), error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  async createTrackingEvent(event: Partial<TrackingEvent>): Promise<{ data: TrackingEvent | null; error: any }> {
    try {
      const snakeCaseEvent = toSnakeCase(event);
      
      const { data, error } = await supabase
        .from('tracking_events')
        .insert(snakeCaseEvent)
        .select()
        .single();
      
      if (error) throw error;
      return { data: toCamelCase(data), error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  // ========== PORT METRICS ==========

  async getPortMetrics(portId?: string, startDate?: string, endDate?: string): Promise<{ data: PortMetric[] | null; error: any }> {
    try {
      let query = supabase
        .from('port_metrics')
        .select(`
          *,
          port:ports(port_code, port_name)
        `);

      if (portId) {
        query = query.eq('port_id', portId);
      }

      if (startDate) {
        query = query.gte('metric_date', startDate);
      }

      if (endDate) {
        query = query.lte('metric_date', endDate);
      }

      query = query.order('metric_date', { ascending: false });

      const { data, error } = await query;
      
      if (error) throw error;
      return { data: toCamelCase(data), error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  // ========== REAL-TIME SUBSCRIPTIONS ==========

  subscribeToShipments(callback: (payload: any) => void) {
    const channel = supabase
      .channel('shipments-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'shipments'
        },
        (payload) => {
          callback(toCamelCase(payload));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  },

  subscribeToTrackingEvents(shipmentId: string, callback: (payload: any) => void) {
    const channel = supabase
      .channel(`tracking-events-${shipmentId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tracking_events',
          filter: `shipment_id=eq.${shipmentId}`
        },
        (payload) => {
          callback(toCamelCase(payload));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  },

  subscribeToPortMetrics(callback: (payload: any) => void) {
    const channel = supabase
      .channel('port-metrics-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'port_metrics'
        },
        (payload) => {
          callback(toCamelCase(payload));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }
};