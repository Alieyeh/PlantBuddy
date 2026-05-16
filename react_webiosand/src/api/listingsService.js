import { supabase } from '../lib/supabase';

export const listingsService = {
  async getOpenListings() {
    const { data, error } = await supabase
      .from('plant_listings')
      .select(`
        id,
        title,
        description,
        sitting_start_date,
        sitting_end_date,
        sitting_notes,
        status,
        created_at,
        plants (
          id,
          name,
          species,
          size_description,
          watering_frequency_days,
          light_requirements
        )
      `)
      .eq('listing_type', 'SITTING_REQUEST')
      .eq('status', 'OPEN')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async getMyListings(ownerUserId) {
    const { data, error } = await supabase
      .from('plant_listings')
      .select(`
        id,
        title,
        description,
        sitting_start_date,
        sitting_end_date,
        status,
        listing_type,
        created_at,
        plants (
          id,
          name,
          species
        )
      `)
      .eq('owner_user_id', ownerUserId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async createSittingRequest({ plantId, ownerUserId, title, description, startDate, endDate, sittingNotes }) {
    const { data, error } = await supabase
      .from('plant_listings')
      .insert({
        plant_id: plantId,
        owner_user_id: ownerUserId,
        listing_type: 'SITTING_REQUEST',
        status: 'OPEN',
        title,
        description,
        sitting_start_date: startDate,
        sitting_end_date: endDate,
        sitting_notes: sittingNotes,
        published_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getListing(id) {
    const { data, error } = await supabase
      .from('plant_listings')
      .select(`
        id,
        title,
        description,
        sitting_start_date,
        sitting_end_date,
        sitting_notes,
        status,
        listing_type,
        created_at,
        plants (
          id,
          name,
          species,
          description,
          size_description,
          health_status,
          watering_frequency_days,
          light_requirements,
          humidity_requirements,
          special_instructions
        )
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },
};
