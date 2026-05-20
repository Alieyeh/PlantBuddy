const assert = require('node:assert/strict');
const test = require('node:test');

const {
  buildExchangeInbox,
  getExchangeInboxCounts,
} = require('../../src/utils/exchangeInbox');

test('buildExchangeInbox composes raw proposal and handoff rows into inbox sections', () => {
  const inbox = buildExchangeInbox({
    incomingSwapProposals: [
      {
        id: 1,
        status: 'PENDING',
        created_at: '2026-05-19T10:00:00Z',
        listing: [{ id: 101, title: 'Swap my monstera' }],
      },
    ],
    outgoingSwapProposals: [
      {
        id: 2,
        status: 'ACCEPTED',
        created_at: '2026-05-19T12:00:00Z',
        listing: { id: 102, title: 'Trade for pothos' },
      },
    ],
    handoffs: [
      {
        id: 10,
        status: 'COMPLETED',
        completed_at: '2026-05-19T14:00:00Z',
        updated_at: '2026-05-19T13:00:00Z',
        owner_user_id: 'owner',
        recipient_user_id: 'me',
        listing_handoff_reviews: [],
      },
      {
        id: 11,
        status: 'PENDING_CONFIRMATION',
        updated_at: '2026-05-19T15:00:00Z',
        owner_user_id: 'me',
        recipient_user_id: 'other',
        owner_confirmed_at: null,
      },
      {
        id: 12,
        status: 'CANCELLED',
        updated_at: '2026-05-19T16:00:00Z',
      },
    ],
  });

  assert.equal(inbox.activeProposals.length, 2);
  assert.equal(inbox.activeProposals[0].direction, 'OUTGOING');
  assert.equal(inbox.activeProposals[1].direction, 'INCOMING');
  assert.equal(inbox.pendingHandoffs.length, 1);
  assert.equal(inbox.pendingHandoffs[0].id, 11);
  assert.equal(inbox.completedExchanges.length, 1);
  assert.equal(inbox.completedExchanges[0].id, 10);

  assert.deepEqual(getExchangeInboxCounts(inbox, 'me'), {
    activeProposals: 2,
    pendingHandoffs: 1,
    completedExchanges: 1,
    actionNeeded: 3,
    total: 4,
  });
});
