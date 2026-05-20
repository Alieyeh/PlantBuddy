const assert = require('node:assert/strict');
const test = require('node:test');

const {
  HANDOFF_STATUSES,
  LISTING_STATUSES,
  LISTING_TYPES,
  buildListingInsertPayload,
  isSupportedListingType,
  isTerminalHandoffStatus,
} = require('../../src/domain/listings');

const publishedAt = '2026-05-20T10:00:00.000Z';

test('listing type helper only allows supported marketplace modes', () => {
  assert.equal(isSupportedListingType(LISTING_TYPES.SITTING_REQUEST), true);
  assert.equal(isSupportedListingType(LISTING_TYPES.GIFT), true);
  assert.equal(isSupportedListingType('UNKNOWN_MODE'), false);
});

test('buildListingInsertPayload creates a sitting request insert payload', () => {
  assert.deepEqual(
    buildListingInsertPayload({
      plantId: 42,
      ownerUserId: 'owner-uuid',
      listingType: LISTING_TYPES.SITTING_REQUEST,
      title: 'Sitter needed',
      description: null,
      startDate: '2026-06-01',
      endDate: '2026-06-14',
      sittingNotes: 'Water every Sunday',
    }, publishedAt),
    {
      plant_id: 42,
      owner_user_id: 'owner-uuid',
      listing_type: LISTING_TYPES.SITTING_REQUEST,
      status: LISTING_STATUSES.OPEN,
      title: 'Sitter needed',
      description: null,
      published_at: publishedAt,
      sitting_start_date: '2026-06-01',
      sitting_end_date: '2026-06-14',
      sitting_notes: 'Water every Sunday',
    }
  );
});

test('buildListingInsertPayload creates gift and sale-specific fields only when needed', () => {
  assert.deepEqual(
    buildListingInsertPayload({
      plantId: 7,
      ownerUserId: 'owner-uuid',
      listingType: LISTING_TYPES.GIFT,
      title: 'Free fern',
      description: 'Pickup only',
      giftNotes: undefined,
    }, publishedAt),
    {
      plant_id: 7,
      owner_user_id: 'owner-uuid',
      listing_type: LISTING_TYPES.GIFT,
      status: LISTING_STATUSES.OPEN,
      title: 'Free fern',
      description: 'Pickup only',
      published_at: publishedAt,
      gift_notes: null,
    }
  );

  assert.deepEqual(
    buildListingInsertPayload({
      plantId: 8,
      ownerUserId: 'owner-uuid',
      listingType: LISTING_TYPES.SALE,
      title: 'Rare cutting',
      description: null,
      salePrice: 14.5,
      currencyCode: 'GBP',
    }, publishedAt),
    {
      plant_id: 8,
      owner_user_id: 'owner-uuid',
      listing_type: LISTING_TYPES.SALE,
      status: LISTING_STATUSES.OPEN,
      title: 'Rare cutting',
      description: null,
      published_at: publishedAt,
      sale_price: 14.5,
      currency_code: 'GBP',
    }
  );
});

test('domain helpers reject unsupported listing and terminal handoff states are centralized', () => {
  assert.throws(
    () => buildListingInsertPayload({
      plantId: 1,
      ownerUserId: 'owner-uuid',
      listingType: 'WISHLIST',
      title: 'Invalid',
    }, publishedAt),
    /Unsupported listing type/
  );

  assert.equal(isTerminalHandoffStatus(HANDOFF_STATUSES.COMPLETED), true);
  assert.equal(isTerminalHandoffStatus(HANDOFF_STATUSES.CANCELLED), true);
  assert.equal(isTerminalHandoffStatus(HANDOFF_STATUSES.PENDING_CONFIRMATION), false);
});
