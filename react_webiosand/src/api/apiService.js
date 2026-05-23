import { supabase } from '../lib/supabase';

/**
 * Supabase-backed plant data access used by the current owner's plant screens.
 * Each method returns raw table rows and lets callers handle UI messaging.
 */
export const api = {
  /**
   * Loads active plants owned by the currently authenticated user.
   *
   * @returns {Promise<Array<object>>}
   */
  async getPlants() {
    const { data: { user } } = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from('plants')
      .select('id, name, species, description, size_description, health_status, watering_frequency_days, watering_frequency_unit, light_requirements, humidity_requirements, special_instructions, location_notes, is_active, created_at, updated_at')
      .eq('current_owner_user_id', user.id)
      .eq('is_active', true)
      .order('name');
    if (error) throw error;
    return data;
  },

  /**
   * Loads one plant by id.
   *
   * @param {number | string} id
   * @returns {Promise<object>}
   */
  async getPlant(id) {
    const { data, error } = await supabase
      .from('plants')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  },

  /**
   * Creates a plant for the currently authenticated owner.
   *
   * @param {object} plantData
   * @returns {Promise<object>}
   */
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

  /**
   * Updates an existing plant row. RLS is expected to enforce ownership.
   *
   * @param {number | string} id
   * @param {object} plantData
   * @returns {Promise<object>}
   */
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

  /**
   * Archives a plant without deleting historical rows.
   *
   * @param {number | string} id
   * @returns {Promise<void>}
   */
  async deletePlant(id) {
    const { error } = await supabase
      .from('plants')
      .update({ is_active: false, archived_at: new Date().toISOString() })
      .eq('id', id);
    if (error) throw error;
  },
};
