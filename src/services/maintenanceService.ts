import { supabase } from '@/lib/supabase/client';
import { Vehicle } from './vehicleService';

export interface MaintenanceSchedule {
  id: string;
  vehicle_id: string;
  service_type: string;
  scheduled_date: string;
  completed_date?: string | null;
  status: string;
  cost?: number | null;
  technician_name?: string | null;
  notes?: string | null;
  created_at?: string;
  updated_at?: string;
  vehicle?: Vehicle;
}

export const maintenanceService = {
  async getAllMaintenanceSchedules(): Promise<MaintenanceSchedule[]> {
    try {
      const { data, error } = await supabase
        .from('maintenance_schedules')
        .select(`
          *,
          vehicle:vehicles(*)
        `)
        .order('scheduled_date', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error: any) {
      throw error;
    }
  },

  async getMaintenanceSchedulesByVehicle(vehicleId: string): Promise<MaintenanceSchedule[]> {
    try {
      const { data, error } = await supabase
        .from('maintenance_schedules')
        .select('*')
        .eq('vehicle_id', vehicleId)
        .order('scheduled_date', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error: any) {
      throw error;
    }
  },

  async getPendingMaintenance(): Promise<MaintenanceSchedule[]> {
    try {
      const { data, error } = await supabase
        .from('maintenance_schedules')
        .select(`
          *,
          vehicle:vehicles(*)
        `)
        .eq('status', 'pending')
        .order('scheduled_date', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error: any) {
      throw error;
    }
  },

  async getOverdueMaintenance(): Promise<MaintenanceSchedule[]> {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('maintenance_schedules')
        .select(`
          *,
          vehicle:vehicles(*)
        `)
        .eq('status', 'pending')
        .lt('scheduled_date', today)
        .order('scheduled_date', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error: any) {
      throw error;
    }
  },

  async createMaintenanceSchedule(
    schedule: Omit<MaintenanceSchedule, 'id' | 'created_at' | 'updated_at'>
  ): Promise<MaintenanceSchedule> {
    try {
      const { data, error } = await supabase
        .from('maintenance_schedules')
        .insert([schedule])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error: any) {
      throw error;
    }
  },

  async updateMaintenanceSchedule(
    id: string,
    updates: Partial<MaintenanceSchedule>
  ): Promise<MaintenanceSchedule> {
    try {
      const { data, error } = await supabase
        .from('maintenance_schedules')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error: any) {
      throw error;
    }
  },

  async completeMaintenance(
    id: string,
    completedDate: string,
    cost?: number,
    notes?: string
  ): Promise<MaintenanceSchedule> {
    try {
      const { data, error } = await supabase
        .from('maintenance_schedules')
        .update({
          status: 'completed',
          completed_date: completedDate,
          cost,
          notes
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error: any) {
      throw error;
    }
  },

  async deleteMaintenanceSchedule(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('maintenance_schedules')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error: any) {
      throw error;
    }
  }
};