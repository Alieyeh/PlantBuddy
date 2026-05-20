const { LISTING_TYPES } = require('../domain/listings');

const BROWSE_TYPE_FILTERS = Object.freeze({
  ALL: 'ALL',
  SITTING_REQUEST: LISTING_TYPES.SITTING_REQUEST,
  GIFT: LISTING_TYPES.GIFT,
  SALE: LISTING_TYPES.SALE,
  SWAP: LISTING_TYPES.SWAP,
});

const BROWSE_SORT_OPTIONS = Object.freeze({
  NEWEST: 'NEWEST',
  SOONEST_SITTING: 'SOONEST_SITTING',
  PRICE_LOW: 'PRICE_LOW',
  PRICE_HIGH: 'PRICE_HIGH',
});

function normalizedText(value) {
  return String(value ?? '').trim().toLowerCase();
}

function timestampMs(value) {
  if (!value) return 0;
  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? 0 : parsed;
}

function salePrice(listing) {
  if (listing?.listing_type !== LISTING_TYPES.SALE) return null;
  const price = Number(listing.sale_price);
  return Number.isFinite(price) ? price : null;
}

function sittingStartMs(listing) {
  if (listing?.listing_type !== LISTING_TYPES.SITTING_REQUEST) return null;
  const parsed = timestampMs(listing.sitting_start_date);
  return parsed || null;
}

function listingSearchText(listing) {
  const plant = listing?.plants ?? {};
  return [
    listing?.title,
    listing?.description,
    listing?.sitting_notes,
    listing?.desired_swap_notes,
    listing?.gift_notes,
    listing?.currency_code,
    plant.name,
    plant.species,
    plant.size_description,
    plant.light_requirements,
    plant.humidity_requirements,
  ].map(normalizedText).filter(Boolean).join(' ');
}

function matchesTypeFilter(listing, listingType) {
  return !listingType || listingType === BROWSE_TYPE_FILTERS.ALL || listing?.listing_type === listingType;
}

function matchesSearch(listing, searchTerm) {
  const term = normalizedText(searchTerm);
  if (!term) return true;
  return listingSearchText(listing).includes(term);
}

function compareNewest(left, right) {
  return timestampMs(right.created_at) - timestampMs(left.created_at);
}

function compareOptionalNumber(leftValue, rightValue, direction = 'asc') {
  const leftMissing = leftValue == null;
  const rightMissing = rightValue == null;

  if (leftMissing && rightMissing) return 0;
  if (leftMissing) return 1;
  if (rightMissing) return -1;

  return direction === 'asc' ? leftValue - rightValue : rightValue - leftValue;
}

function compareListings(left, right, sortBy) {
  if (sortBy === BROWSE_SORT_OPTIONS.SOONEST_SITTING) {
    return compareOptionalNumber(sittingStartMs(left), sittingStartMs(right), 'asc') || compareNewest(left, right);
  }

  if (sortBy === BROWSE_SORT_OPTIONS.PRICE_LOW) {
    return compareOptionalNumber(salePrice(left), salePrice(right), 'asc') || compareNewest(left, right);
  }

  if (sortBy === BROWSE_SORT_OPTIONS.PRICE_HIGH) {
    return compareOptionalNumber(salePrice(left), salePrice(right), 'desc') || compareNewest(left, right);
  }

  return compareNewest(left, right);
}

/**
 * Applies browse search, listing type filters, and deterministic sort order.
 *
 * @param {Array<object>} listings
 * @param {object} options
 * @param {string} [options.listingType]
 * @param {string} [options.searchTerm]
 * @param {string} [options.sortBy]
 * @returns {Array<object>}
 */
function filterAndSortListings(listings = [], {
  listingType = BROWSE_TYPE_FILTERS.ALL,
  searchTerm = '',
  sortBy = BROWSE_SORT_OPTIONS.NEWEST,
} = {}) {
  return [...listings]
    .filter((listing) => matchesTypeFilter(listing, listingType))
    .filter((listing) => matchesSearch(listing, searchTerm))
    .sort((left, right) => compareListings(left, right, sortBy));
}

module.exports = {
  BROWSE_SORT_OPTIONS,
  BROWSE_TYPE_FILTERS,
  compareListings,
  filterAndSortListings,
  listingSearchText,
  matchesSearch,
  matchesTypeFilter,
  normalizedText,
};
