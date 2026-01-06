import { supabase } from '@/lib/supabase/client';

export interface Vehicle {
  id: string;
  brand: string;
  model: string;
  year: number;
  price_per_day: number;
  seats: number;
  transmission: string;
  fuel_type: string;
  image_url: string;
  description: string | null;
  license_plate: string | null;
  is_available: boolean;
  status: string;
  current_mileage?: number;
  fuel_level?: number;
  fuel_capacity?: number;
  last_maintenance_date?: string;
  next_maintenance_date?: string;
  created_at?: string;
  updated_at?: string;
}

export const vehicleService = {
  async getAvailableVehicles(): Promise<Vehicle[]> {
    try {
      const { data, error } = await supabase
        .from('vehicles')
        .select('*')
        .eq('is_available', true)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error: any) {
      throw error;
    }
  },

  async getVehicleById(id: string): Promise<Vehicle | null> {
    try {
      const { data, error } = await supabase
        .from('vehicles')
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

  async getAllVehicles(): Promise<Vehicle[]> {
    try {
      const { data, error } = await supabase
        .from('vehicles')
        .select('*')
        .order('brand', { ascending: true });

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error: any) {
      throw error;
    }
  },

  async searchVehicles(query: string): Promise<Vehicle[]> {
    try {
      const { data, error } = await supabase
        .from('vehicles')
        .select('*')
        .or(`brand.ilike.%${query}%,model.ilike.%${query}%`)
        .eq('is_available', true);

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error: any) {
      throw error;
    }
  },

  async filterVehicles(filters: {
    transmission?: string;
    fuel_type?: string;
    min_price?: number;
    max_price?: number;
    seats?: number;
  }): Promise<Vehicle[]> {
    try {
      let query = supabase
        .from('vehicles')
        .select('*')
        .eq('is_available', true);

      if (filters.transmission) {
        query = query.eq('transmission', filters.transmission);
      }

      if (filters.fuel_type) {
        query = query.eq('fuel_type', filters.fuel_type);
      }

      if (filters.min_price) {
        query = query.gte('price_per_day', filters.min_price);
      }

      if (filters.max_price) {
        query = query.lte('price_per_day', filters.max_price);
      }

      if (filters.seats) {
        query = query.eq('seats', filters.seats);
      }

      const { data, error } = await query.order('price_per_day', { ascending: true });

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error: any) {
      throw error;
    }
  },

  async createVehicle(vehicle: Omit<Vehicle, 'id' | 'created_at' | 'updated_at'>): Promise<Vehicle> {
    try {
      const { data, error } = await supabase
        .from('vehicles')
        .insert([vehicle])
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

  async updateVehicle(id: string, updates: Partial<Vehicle>): Promise<Vehicle> {
    try {
      const { data, error } = await supabase
        .from('vehicles')
        .update(updates)
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

  async deleteVehicle(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('vehicles')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }
    } catch (error: any) {
      throw error;
    }
  },

  async updateVehicleAvailability(id: string, isAvailable: boolean): Promise<Vehicle> {
    try {
      const { data, error } = await supabase
        .from('vehicles')
        .update({ 
          is_available: isAvailable,
          status: isAvailable ? 'available' : 'in_use'
        })
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
  }
};