import { supabase } from '../lib/supabase';

export const LISTING_TYPES = Object.freeze({
  SITTING_REQUEST: 'SITTING_REQUEST',
  GIFT: 'GIFT',
  SWAP: 'SWAP',
  SALE: 'SALE',
});

/**
 * Supabase-backed data access for marketplace and plant-sitting listings.
 */
export const listingsService = {
  /**
   * Loads all open listings for the browse feed.
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
        listing_type,
        owner_user_id,
        sitting_start_date,
        sitting_end_date,
        sitting_notes,
        desired_swap_notes,
        gift_notes,
        sale_price,
        currency_code,
        status,
        created_at,
        plants (
          id,
          name,
          species,
          size_description,
          watering_frequency_days,
          light_requirements,
          humidity_requirements
        )
      `)
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
    return this.createListing({
      plantId,
      ownerUserId,
      listingType: LISTING_TYPES.SITTING_REQUEST,
      title,
      description,
      startDate,
      endDate,
      sittingNotes,
    });
  },

  /**
   * Creates a listing for one plant in one of the currently supported owner modes.
   *
   * @param {object} params
   * @returns {Promise<object>}
   */
  async createListing({
    plantId,
    ownerUserId,
    listingType,
    title,
    description,
    startDate,
    endDate,
    sittingNotes,
    giftNotes,
    salePrice,
    currencyCode,
  }) {
    const payload = {
      plant_id: plantId,
      owner_user_id: ownerUserId,
      listing_type: listingType,
      status: 'OPEN',
      title,
      description: description ?? null,
      published_at: new Date().toISOString(),
    };

    if (listingType === LISTING_TYPES.SITTING_REQUEST) {
      payload.sitting_start_date = startDate;
      payload.sitting_end_date = endDate;
      payload.sitting_notes = sittingNotes ?? null;
    }

    if (listingType === LISTING_TYPES.GIFT) {
      payload.gift_notes = giftNotes ?? null;
    }

    if (listingType === LISTING_TYPES.SALE) {
      payload.sale_price = salePrice;
      payload.currency_code = currencyCode;
    }

    const { data, error } = await supabase
      .from('plant_listings')
      .insert(payload)
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

  async createSwapProposal({ listingId, proposerOwnerUserId, offeredPlantId, message }) {
    const { data, error } = await supabase
      .from('swap_proposals')
      .insert({
        listing_id: listingId,
        proposer_owner_user_id: proposerOwnerUserId,
        offered_plant_id: offeredPlantId,
        message_to_owner: message || null,
        status: 'PENDING',
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async getSwapProposalsForListing(listingId) {
    const { data, error } = await supabase
      .from('swap_proposals')
      .select(`
        id,
        listing_id,
        proposer_owner_user_id,
        message_to_owner,
        status,
        created_at,
        responded_at,
        offered_plant:plants!swap_proposals_offered_plant_id_fkey (
          id,
          name,
          species,
          health_status,
          size_description
        ),
        proposer:owner_profiles!swap_proposals_proposer_owner_user_id_fkey (
          user_id,
          display_name
        )
      `)
      .eq('listing_id', listingId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async getMySwapProposalForListing(listingId, proposerOwnerUserId) {
    const { data, error } = await supabase
      .from('swap_proposals')
      .select(`
        id,
        listing_id,
        proposer_owner_user_id,
        message_to_owner,
        status,
        created_at,
        responded_at,
        offered_plant:plants!swap_proposals_offered_plant_id_fkey (
          id,
          name,
          species
        )
      `)
      .eq('listing_id', listingId)
      .eq('proposer_owner_user_id', proposerOwnerUserId)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async updateSwapProposalStatus(proposalId, status) {
    const { error } = await supabase
      .from('swap_proposals')
      .update({ status, responded_at: new Date().toISOString() })
      .eq('id', proposalId);
    if (error) throw error;
  },

  async startListingHandoff({ listing, recipientUserId, notes, swapProposalId }) {
    const payload = {
      listing_id: listing.id,
      owner_user_id: listing.owner_user_id,
      recipient_user_id: recipientUserId,
      created_by_user_id: recipientUserId,
      notes: notes || null,
    };

    if (listing.listing_type === LISTING_TYPES.SALE) {
      payload.amount = listing.sale_price;
      payload.currency_code = listing.currency_code;
    }

    if (listing.listing_type === LISTING_TYPES.SWAP) {
      payload.swap_proposal_id = swapProposalId;
    }

    const { data, error } = await supabase
      .from('listing_handoffs')
      .insert(payload)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getListingHandoff(listingId) {
    const { data, error } = await supabase
      .from('listing_handoffs')
      .select(`
        id,
        listing_id,
        owner_user_id,
        recipient_user_id,
        swap_proposal_id,
        amount,
        currency_code,
        status,
        notes,
        owner_confirmed_at,
        recipient_confirmed_at,
        completed_at,
        cancelled_at,
        created_at,
        listing_handoff_reviews (
          id,
          reviewer_user_id,
          reviewee_user_id,
          rating,
          review_text,
          created_at
        )
      `)
      .eq('listing_id', listingId)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async getListingHandoffById(handoffId) {
    const { data, error } = await supabase
      .from('listing_handoffs')
      .select(`
        id,
        listing_id,
        owner_user_id,
        recipient_user_id,
        swap_proposal_id,
        amount,
        currency_code,
        status,
        notes,
        owner_confirmed_at,
        recipient_confirmed_at,
        completed_at,
        cancelled_at,
        created_at,
        listing_handoff_reviews (
          id,
          reviewer_user_id,
          reviewee_user_id,
          rating,
          review_text,
          created_at
        )
      `)
      .eq('id', handoffId)
      .single();

    if (error) throw error;
    return data;
  },

  async confirmListingHandoff(handoffId) {
    const { data, error } = await supabase.rpc('confirm_listing_handoff', {
      p_handoff_id: handoffId,
    });

    if (error) throw error;
    return this.getListingHandoffById(data.id);
  },

  async createListingHandoffReview({ handoffId, reviewerUserId, revieweeUserId, rating, reviewText }) {
    const { data, error } = await supabase
      .from('listing_handoff_reviews')
      .insert({
        handoff_id: handoffId,
        reviewer_user_id: reviewerUserId,
        reviewee_user_id: revieweeUserId,
        rating,
        review_text: reviewText || null,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async acceptSwapProposal({ proposal, listingOwnerUserId, actingUserId }) {
    await this.updateSwapProposalStatus(proposal.id, 'ACCEPTED');

    try {
      return await this.startListingHandoff({
        listing: {
          id: proposal.listing_id,
          owner_user_id: listingOwnerUserId,
          listing_type: LISTING_TYPES.SWAP,
        },
        recipientUserId: proposal.proposer_owner_user_id,
        notes: proposal.message_to_owner,
        swapProposalId: proposal.id,
        actingUserId,
      });
    } catch (error) {
      await supabase
        .from('swap_proposals')
        .update({ status: 'PENDING', responded_at: null })
        .eq('id', proposal.id);
      throw error;
    }
  },

  async getIncomingSwapProposals(ownerUserId) {
    const { data, error } = await supabase
      .from('swap_proposals')
      .select(`
        id,
        listing_id,
        proposer_owner_user_id,
        message_to_owner,
        status,
        created_at,
        responded_at,
        listing:plant_listings!inner (
          id,
          title,
          listing_type,
          owner_user_id,
          plants (
            id,
            name,
            species
          )
        ),
        offered_plant:plants!swap_proposals_offered_plant_id_fkey (
          id,
          name,
          species
        ),
        proposer:owner_profiles!swap_proposals_proposer_owner_user_id_fkey (
          user_id,
          display_name
        )
      `)
      .eq('listing.owner_user_id', ownerUserId)
      .in('status', ['PENDING', 'ACCEPTED'])
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async getOutgoingSwapProposals(proposerOwnerUserId) {
    const { data, error } = await supabase
      .from('swap_proposals')
      .select(`
        id,
        listing_id,
        proposer_owner_user_id,
        message_to_owner,
        status,
        created_at,
        responded_at,
        listing:plant_listings (
          id,
          title,
          listing_type,
          owner_user_id,
          plants (
            id,
            name,
            species
          )
        ),
        offered_plant:plants!swap_proposals_offered_plant_id_fkey (
          id,
          name,
          species
        )
      `)
      .eq('proposer_owner_user_id', proposerOwnerUserId)
      .in('status', ['PENDING', 'ACCEPTED'])
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async getMyHandoffs(userId) {
    const { data, error } = await supabase
      .from('listing_handoffs')
      .select(`
        id,
        listing_id,
        owner_user_id,
        recipient_user_id,
        swap_proposal_id,
        amount,
        currency_code,
        status,
        notes,
        owner_confirmed_at,
        recipient_confirmed_at,
        completed_at,
        cancelled_at,
        created_at,
        updated_at,
        listing:plant_listings (
          id,
          title,
          listing_type,
          plants (
            id,
            name,
            species
          )
        ),
        listing_handoff_reviews (
          id,
          reviewer_user_id,
          reviewee_user_id,
          rating,
          created_at
        )
      `)
      .or(`owner_user_id.eq.${userId},recipient_user_id.eq.${userId}`)
      .order('updated_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async getExchangeInbox(userId) {
    const [incomingSwapProposals, outgoingSwapProposals, handoffs] = await Promise.all([
      this.getIncomingSwapProposals(userId),
      this.getOutgoingSwapProposals(userId),
      this.getMyHandoffs(userId),
    ]);

    const activeProposals = [
      ...incomingSwapProposals.map((proposal) => ({ ...proposal, direction: 'INCOMING' })),
      ...outgoingSwapProposals.map((proposal) => ({ ...proposal, direction: 'OUTGOING' })),
    ].sort((left, right) => new Date(right.created_at) - new Date(left.created_at));

    const pendingHandoffs = handoffs
      .filter((handoff) => handoff.status !== 'COMPLETED' && handoff.status !== 'CANCELLED')
      .sort((left, right) => new Date(right.updated_at) - new Date(left.updated_at));

    const completedExchanges = handoffs
      .filter((handoff) => handoff.status === 'COMPLETED')
      .sort((left, right) => new Date(right.completed_at ?? right.updated_at) - new Date(left.completed_at ?? left.updated_at));

    return {
      activeProposals,
      pendingHandoffs,
      completedExchanges,
    };
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
        owner_user_id,
        store_owner_user_id,
        sitting_start_date,
        sitting_end_date,
        sitting_notes,
        desired_swap_notes,
        gift_notes,
        sale_price,
        currency_code,
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
          special_instructions,
          location_notes
        )
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },
};
