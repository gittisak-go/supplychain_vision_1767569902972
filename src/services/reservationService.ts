import { supabase } from '@/lib/supabase/client';

export interface Reservation {
  id: string;
  vehicle_id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  customer_id_card?: string | null;
  start_date: string;
  end_date: string;
  total_days: number;
  daily_rate: number;
  total_amount: number;
  deposit_amount?: number | null;
  pickup_location: string;
  dropoff_location?: string | null;
  special_requests?: string | null;
  status: 'pending' | 'confirmed' | 'active' | 'completed' | 'cancelled';
  created_at?: string;
  updated_at?: string;
}

export interface CreateReservationData {
  vehicle_id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  customer_id_card?: string;
  start_date: string;
  end_date: string;
  pickup_location: string;
  dropoff_location?: string;
  special_requests?: string;
}

export const reservationService = {
  async createReservation(data: CreateReservationData): Promise<Reservation> {
    try {
      const startDate = new Date(data.start_date);
      const endDate = new Date(data.end_date);
      const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

      const { data: vehicle, error: vehicleError } = await supabase
        .from('vehicles')
        .select('price_per_day')
        .eq('id', data.vehicle_id)
        .single();

      if (vehicleError) {
        throw vehicleError;
      }

      const dailyRate = vehicle?.price_per_day || 0;
      const totalAmount = dailyRate * totalDays;
      const depositAmount = totalAmount * 0.3;

      const reservationData = {
        vehicle_id: data.vehicle_id,
        customer_name: data.customer_name,
        customer_email: data.customer_email,
        customer_phone: data.customer_phone,
        customer_id_card: data.customer_id_card || null,
        start_date: data.start_date,
        end_date: data.end_date,
        total_days: totalDays,
        daily_rate: dailyRate,
        total_amount: totalAmount,
        deposit_amount: depositAmount,
        pickup_location: data.pickup_location,
        dropoff_location: data.dropoff_location || null,
        special_requests: data.special_requests || null,
        status: 'pending'
      };

      const { data: reservation, error } = await supabase
        .from('reservations')
        .insert([reservationData])
        .select()
        .single();

      if (error) {
        throw error;
      }

      return reservation;
    } catch (error: any) {
      throw error;
    }
  },

  async getReservationById(id: string): Promise<Reservation | null> {
    try {
      const { data, error } = await supabase
        .from('reservations')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error: any) {
      throw error;
    }
  },

  async getReservationsByEmail(email: string): Promise<Reservation[]> {
    try {
      const { data, error } = await supabase
        .from('reservations')
        .select('*')
        .eq('customer_email', email)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error: any) {
      throw error;
    }
  },

  async getAllReservations(): Promise<Reservation[]> {
    try {
      const { data, error } = await supabase
        .from('reservations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error: any) {
      throw error;
    }
  },

  async updateReservationStatus(
    id: string, 
    status: 'pending' | 'confirmed' | 'active' | 'completed' | 'cancelled'
  ): Promise<Reservation> {
    try {
      const { data, error } = await supabase
        .from('reservations')
        .update({ status })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error: any) {
      throw error;
    }
  },

  async cancelReservation(id: string): Promise<Reservation> {
    try {
      const { data, error } = await supabase
        .from('reservations')
        .update({ status: 'cancelled' })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error: any) {
      throw error;
    }
  },

  async checkVehicleAvailability(
    vehicleId: string, 
    startDate: string, 
    endDate: string
  ): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('reservations')
        .select('id')
        .eq('vehicle_id', vehicleId)
        .in('status', ['confirmed', 'active'])
        .or(`start_date.lte.${endDate},end_date.gte.${startDate}`);

      if (error) {
        throw error;
      }

      return (data?.length || 0) === 0;
    } catch (error: any) {
      throw error;
    }
  },

  async getUpcomingReservations(): Promise<Reservation[]> {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('reservations')
        .select('*')
        .gte('start_date', today)
        .in('status', ['pending', 'confirmed'])
        .order('start_date', { ascending: true });

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error: any) {
      throw error;
    }
  },

  async getActiveReservations(): Promise<Reservation[]> {
    try {
      const { data, error } = await supabase
        .from('reservations')
        .select('*')
        .eq('status', 'active')
        .order('end_date', { ascending: true });

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error: any) {
      throw error;
    }
  }
};