const assert = require('node:assert/strict');
const test = require('node:test');

const {
  BROWSE_SORT_OPTIONS,
  BROWSE_TYPE_FILTERS,
  filterAndSortListings,
  listingSearchText,
  matchesSearch,
  matchesTypeFilter,
  normalizedText,
} = require('../../src/utils/browseListings');

const listings = [
  {
    id: 'sale-expensive',
    listing_type: BROWSE_TYPE_FILTERS.SALE,
    title: 'Established monstera',
    description: 'Large split leaves',
    sale_price: 45,
    currency_code: 'GBP',
    created_at: '2026-05-18T10:00:00Z',
    plants: { name: 'Margo', species: 'Monstera deliciosa', light_requirements: 'bright indirect' },
  },
  {
    id: 'sit-soon',
    listing_type: BROWSE_TYPE_FILTERS.SITTING_REQUEST,
    title: 'Care while away',
    sitting_start_date: '2026-05-25',
    sitting_end_date: '2026-06-02',
    created_at: '2026-05-17T10:00:00Z',
    plants: { name: 'Fernie', species: 'Boston fern', humidity_requirements: 'high humidity' },
  },
  {
    id: 'gift',
    listing_type: BROWSE_TYPE_FILTERS.GIFT,
    title: 'Free spider plant',
    gift_notes: 'Healthy babies ready for pickup',
    created_at: '2026-05-19T10:00:00Z',
    plants: { name: 'Spidey', species: 'Chlorophytum comosum' },
  },
  {
    id: 'sale-cheap',
    listing_type: BROWSE_TYPE_FILTERS.SALE,
    title: 'Small pothos',
    sale_price: 8,
    currency_code: 'GBP',
    created_at: '2026-05-16T10:00:00Z',
    plants: { name: 'Pearl', species: 'Pothos' },
  },
  {
    id: 'sit-later',
    listing_type: BROWSE_TYPE_FILTERS.SITTING_REQUEST,
    title: 'Summer sitting',
    sitting_start_date: '2026-07-10',
    sitting_end_date: '2026-07-20',
    created_at: '2026-05-15T10:00:00Z',
    plants: { name: 'Sunny', species: 'Calathea' },
  },
];

test('text helpers normalize and search across listing and plant fields', () => {
  assert.equal(normalizedText('  Monstera  '), 'monstera');
  assert.match(listingSearchText(listings[0]), /monstera deliciosa/);
  assert.equal(matchesSearch(listings[1], 'high humidity'), true);
  assert.equal(matchesSearch(listings[1], 'snake plant'), false);
});

test('type filtering supports all listings and individual listing modes', () => {
  assert.equal(matchesTypeFilter(listings[0], BROWSE_TYPE_FILTERS.ALL), true);
  assert.equal(matchesTypeFilter(listings[0], BROWSE_TYPE_FILTERS.SALE), true);
  assert.equal(matchesTypeFilter(listings[0], BROWSE_TYPE_FILTERS.GIFT), false);
});

test('filterAndSortListings filters by type and search term without mutating input', () => {
  const originalOrder = listings.map((listing) => listing.id);
  const result = filterAndSortListings(listings, {
    listingType: BROWSE_TYPE_FILTERS.SALE,
    searchTerm: 'pothos',
  });

  assert.deepEqual(result.map((listing) => listing.id), ['sale-cheap']);
  assert.deepEqual(listings.map((listing) => listing.id), originalOrder);
});

test('newest sort orders by created_at descending', () => {
  assert.deepEqual(
    filterAndSortListings(listings, { sortBy: BROWSE_SORT_OPTIONS.NEWEST }).map((listing) => listing.id),
    ['gift', 'sale-expensive', 'sit-soon', 'sale-cheap', 'sit-later']
  );
});

test('price sorts keep non-sale listings after listings with sale prices', () => {
  assert.deepEqual(
    filterAndSortListings(listings, { sortBy: BROWSE_SORT_OPTIONS.PRICE_LOW }).map((listing) => listing.id),
    ['sale-cheap', 'sale-expensive', 'gift', 'sit-soon', 'sit-later']
  );
  assert.deepEqual(
    filterAndSortListings(listings, { sortBy: BROWSE_SORT_OPTIONS.PRICE_HIGH }).map((listing) => listing.id),
    ['sale-expensive', 'sale-cheap', 'gift', 'sit-soon', 'sit-later']
  );
});

test('soonest sitting sort prioritizes dated sitting requests', () => {
  assert.deepEqual(
    filterAndSortListings(listings, { sortBy: BROWSE_SORT_OPTIONS.SOONEST_SITTING }).map((listing) => listing.id),
    ['sit-soon', 'sit-later', 'gift', 'sale-expensive', 'sale-cheap']
  );
});
