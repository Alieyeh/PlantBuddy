import { supabase } from '../lib/supabase';

export const api = {
  async getPlants() {
    const { data: { user } } = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from('plants')
      .select('id, name, species, description, size_description, health_status, watering_frequency_days, light_requirements, humidity_requirements, special_instructions, location_notes, is_active, created_at, updated_at')
      .eq('current_owner_user_id', user.id)
      .eq('is_active', true)
      .order('name');
    if (error) throw error;
    return data;
  },

  async getPlant(id) {
    const { data, error } = await supabase
      .from('plants')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  },

  async createPlant(plantData) {
    const { data: { user } } = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from('plants')
      .insert({ ...plantData, current_owner_user_id: user.id })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async updatePlant(id, plantData) {
    const { data, error } = await supabase
      .from('plants')
      .update(plantData)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async deletePlant(id) {
    const { error } = await supabase
      .from('plants')
      .update({ is_active: false, archived_at: new Date().toISOString() })
      .eq('id', id);
    if (error) throw error;
  },
};
