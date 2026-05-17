import { supabase } from '../lib/supabase';

/**
 * Supabase-backed data access for sitting request listings. The database
 * supports more listing types, but the current UI only exposes sitting.
 */
export const listingsService = {
  /**
   * Loads all open sitting requests for the browse feed.
   *
   * @returns {Promise<Array<object>>}
   */
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

  /**
   * Loads listings created by a specific owner user id.
   *
   * @param {string} ownerUserId Supabase Auth UUID.
   * @returns {Promise<Array<object>>}
   */
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

  /**
   * Creates an open sitting request for one plant.
   *
   * @param {object} params
   * @param {number | string} params.plantId
   * @param {string} params.ownerUserId Supabase Auth UUID.
   * @param {string} params.title
   * @param {string | null} params.description
   * @param {string} params.startDate YYYY-MM-DD.
   * @param {string} params.endDate YYYY-MM-DD.
   * @param {string | null} params.sittingNotes
   * @returns {Promise<object>}
   */
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

  async applyToListing({ listingId, applicantUserId, message, proposedStartDate, proposedEndDate }) {
    const { data, error } = await supabase
      .from('listing_applications')
      .insert({
        listing_id: listingId,
        applicant_user_id: applicantUserId,
        message_to_lister: message || null,
        proposed_start_date: proposedStartDate || null,
        proposed_end_date: proposedEndDate || null,
        status: 'PENDING',
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async getApplicationsForListing(listingId) {
    const { data, error } = await supabase
      .from('listing_applications')
      .select(`
        id,
        status,
        message_to_lister,
        proposed_start_date,
        proposed_end_date,
        created_at,
        applicant_user_id,
        users (
          username,
          first_name
        )
      `)
      .eq('listing_id', listingId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async getMyApplications(applicantUserId) {
    const { data, error } = await supabase
      .from('listing_applications')
      .select(`
        id,
        status,
        message_to_lister,
        proposed_start_date,
        proposed_end_date,
        created_at,
        plant_listings (
          id,
          title,
          sitting_start_date,
          sitting_end_date,
          plants ( name, species )
        )
      `)
      .eq('applicant_user_id', applicantUserId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async updateApplicationStatus(applicationId, status) {
    const { error } = await supabase
      .from('listing_applications')
      .update({ status, responded_at: new Date().toISOString() })
      .eq('id', applicationId);
    if (error) throw error;
  },

  /**
   * Loads a single listing with its linked plant details.
   *
   * @param {number | string} id
   * @returns {Promise<object>}
   */
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
