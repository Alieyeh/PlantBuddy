const assert = require('node:assert/strict');
const test = require('node:test');

const {
  firstRelation,
  formatInboxDate,
  getExchangeInboxCounts,
  getMyHandoffReview,
  getProposalListing,
  isHandoffWaitingOnUser,
  participantLabel,
  timestampMs,
} = require('../../src/utils/exchangeInbox');

test('firstRelation normalizes Supabase relation shapes', () => {
  assert.deepEqual(firstRelation([{ id: 1 }]), { id: 1 });
  assert.deepEqual(firstRelation({ id: 2 }), { id: 2 });
  assert.equal(firstRelation([]), null);
  assert.equal(firstRelation(null), null);
});

test('timestamp and date helpers handle missing and valid values', () => {
  assert.equal(timestampMs(null), 0);
  assert.equal(timestampMs('not-a-date'), 0);
  assert.ok(timestampMs('2026-05-19T12:00:00Z') > 0);
  assert.equal(formatInboxDate(null), '');
  assert.equal(formatInboxDate('bad-date'), '');
  assert.match(formatInboxDate('2026-05-19T12:00:00Z'), /May 19/);
});

test('handoff helper detects whether the current user needs to confirm', () => {
  const handoff = {
    owner_user_id: 'owner',
    recipient_user_id: 'recipient',
    owner_confirmed_at: null,
    recipient_confirmed_at: '2026-05-19T12:00:00Z',
  };

  assert.equal(isHandoffWaitingOnUser(handoff, 'owner'), true);
  assert.equal(isHandoffWaitingOnUser(handoff, 'recipient'), false);
  assert.equal(isHandoffWaitingOnUser(handoff, 'someone-else'), false);
});

test('review and participant helpers choose useful labels', () => {
  const handoff = {
    listing_handoff_reviews: [
      { reviewer_user_id: 'other', rating: 4 },
      { reviewer_user_id: 'me', rating: 5 },
    ],
  };

  assert.equal(getMyHandoffReview(handoff, 'me').rating, 5);
  assert.equal(getMyHandoffReview(handoff, 'missing'), null);
  assert.equal(participantLabel({ display_name: 'Fern Friend' }), 'Fern Friend');
  assert.equal(participantLabel({ username: 'leafy' }), 'leafy');
  assert.equal(participantLabel({}, 'Unknown owner'), 'Unknown owner');
});

test('summary counts include proposal, handoff, and review actions', () => {
  const inbox = {
    activeProposals: [
      { direction: 'INCOMING', status: 'PENDING' },
      { direction: 'OUTGOING', status: 'PENDING' },
    ],
    pendingHandoffs: [
      { owner_user_id: 'me', recipient_user_id: 'other', owner_confirmed_at: null },
      { owner_user_id: 'other', recipient_user_id: 'me', recipient_confirmed_at: '2026-05-19T12:00:00Z' },
    ],
    completedExchanges: [
      { listing_handoff_reviews: [] },
      { listing_handoff_reviews: [{ reviewer_user_id: 'me', rating: 5 }] },
    ],
  };

  assert.deepEqual(getExchangeInboxCounts(inbox, 'me'), {
    activeProposals: 2,
    pendingHandoffs: 2,
    completedExchanges: 2,
    actionNeeded: 3,
    total: 6,
  });
});

test('getProposalListing delegates relation normalization', () => {
  assert.deepEqual(getProposalListing({ listing: [{ id: 42 }] }), { id: 42 });
});
