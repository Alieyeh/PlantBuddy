import { supabase } from '../lib/supabase';

/**
 * Reads deterministic common-plant care profiles from Supabase.
 * These rows are public reference data, not personalized care advice.
 */
export const commonPlantCareService = {
  /**
   * Loads active care profiles for local species matching in the plant form.
   *
   * @returns {Promise<Array<object>>}
   */
  async getActiveProfiles() {
    const { data, error } = await supabase
      .from('common_plant_care_profiles')
      .select(`
        id,
        profile_key,
        common_name,
        scientific_name,
        aliases,
        age_description,
        watering_frequency_days,
        watering_frequency_unit,
        light_requirements,
        humidity_requirements,
        location_notes,
        care_notes,
        confidence_notes,
        sort_order,
        is_active
      `)
      .eq('is_active', true)
      .order('sort_order', { ascending: true })
      .order('common_name', { ascending: true });

    if (error) throw error;
    return data;
  },
};
