import { supabase } from '@/lib/supabase/client';

export interface RentalTerm {
  id: string;
  title: string;
  content: string;
  category: string;
  is_active: boolean;
  display_order?: number | null;
  created_at?: string;
  updated_at?: string;
}

export const rentalTermsService = {
  async getAllRentalTerms(): Promise<RentalTerm[]> {
    try {
      const { data, error } = await supabase
        .from('rental_terms')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error: any) {
      throw error;
    }
  },

  async getActiveRentalTerms(): Promise<RentalTerm[]> {
    try {
      const { data, error } = await supabase
        .from('rental_terms')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error: any) {
      throw error;
    }
  },

  async getRentalTermsByCategory(category: string): Promise<RentalTerm[]> {
    try {
      const { data, error } = await supabase
        .from('rental_terms')
        .select('*')
        .eq('category', category)
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error: any) {
      throw error;
    }
  },

  async createRentalTerm(
    term: Omit<RentalTerm, 'id' | 'created_at' | 'updated_at'>
  ): Promise<RentalTerm> {
    try {
      const { data, error } = await supabase
        .from('rental_terms')
        .insert([term])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error: any) {
      throw error;
    }
  },

  async updateRentalTerm(
    id: string,
    updates: Partial<RentalTerm>
  ): Promise<RentalTerm> {
    try {
      const { data, error } = await supabase
        .from('rental_terms')
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

  async deleteRentalTerm(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('rental_terms')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error: any) {
      throw error;
    }
  },

  async toggleRentalTermStatus(id: string, isActive: boolean): Promise<RentalTerm> {
    try {
      const { data, error } = await supabase
        .from('rental_terms')
        .update({ is_active: isActive })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error: any) {
      throw error;
    }
  }
};