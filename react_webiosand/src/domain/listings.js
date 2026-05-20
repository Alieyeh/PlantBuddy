const LISTING_TYPES = Object.freeze({
  SITTING_REQUEST: 'SITTING_REQUEST',
  GIFT: 'GIFT',
  SWAP: 'SWAP',
  SALE: 'SALE',
});

const LISTING_STATUSES = Object.freeze({
  OPEN: 'OPEN',
  CLOSED: 'CLOSED',
  CANCELLED: 'CANCELLED',
});

const APPLICATION_STATUSES = Object.freeze({
  PENDING: 'PENDING',
  ACCEPTED: 'ACCEPTED',
  DECLINED: 'DECLINED',
});

const SWAP_PROPOSAL_STATUSES = Object.freeze({
  PENDING: 'PENDING',
  ACCEPTED: 'ACCEPTED',
  DECLINED: 'DECLINED',
});

const HANDOFF_STATUSES = Object.freeze({
  PENDING_CONFIRMATION: 'PENDING_CONFIRMATION',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
});

function optionalValue(value) {
  return value ?? null;
}

/**
 * Checks whether a listing type is one of the supported marketplace modes.
 *
 * @param {string} listingType
 * @returns {boolean}
 */
function isSupportedListingType(listingType) {
  return Object.values(LISTING_TYPES).includes(listingType);
}

/**
 * Checks whether a handoff is no longer active.
 *
 * @param {string} status
 * @returns {boolean}
 */
function isTerminalHandoffStatus(status) {
  return status === HANDOFF_STATUSES.COMPLETED || status === HANDOFF_STATUSES.CANCELLED;
}

/**
 * Builds the database insert payload for a plant listing.
 *
 * @param {object} params
 * @param {number | string} params.plantId
 * @param {string} params.ownerUserId
 * @param {string} params.listingType
 * @param {string} params.title
 * @param {string | null} params.description
 * @param {string | null} [params.startDate]
 * @param {string | null} [params.endDate]
 * @param {string | null} [params.sittingNotes]
 * @param {string | null} [params.giftNotes]
 * @param {number | null} [params.salePrice]
 * @param {string | null} [params.currencyCode]
 * @param {string} [publishedAt]
 * @returns {object}
 */
function buildListingInsertPayload({
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
}, publishedAt = new Date().toISOString()) {
  if (!isSupportedListingType(listingType)) {
    throw new Error(`Unsupported listing type: ${listingType}`);
  }

  const payload = {
    plant_id: plantId,
    owner_user_id: ownerUserId,
    listing_type: listingType,
    status: LISTING_STATUSES.OPEN,
    title,
    description: optionalValue(description),
    published_at: publishedAt,
  };

  if (listingType === LISTING_TYPES.SITTING_REQUEST) {
    payload.sitting_start_date = startDate;
    payload.sitting_end_date = endDate;
    payload.sitting_notes = optionalValue(sittingNotes);
  }

  if (listingType === LISTING_TYPES.GIFT) {
    payload.gift_notes = optionalValue(giftNotes);
  }

  if (listingType === LISTING_TYPES.SALE) {
    payload.sale_price = salePrice;
    payload.currency_code = currencyCode;
  }

  return payload;
}

module.exports = {
  APPLICATION_STATUSES,
  HANDOFF_STATUSES,
  LISTING_STATUSES,
  LISTING_TYPES,
  SWAP_PROPOSAL_STATUSES,
  buildListingInsertPayload,
  isSupportedListingType,
  isTerminalHandoffStatus,
};
