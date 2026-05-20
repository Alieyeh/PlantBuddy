const {
  HANDOFF_STATUSES,
  SWAP_PROPOSAL_STATUSES,
  isTerminalHandoffStatus,
} = require('../domain/listings');

/**
 * Normalizes a Supabase nested relationship that can arrive as either a single
 * object or a one-item array depending on query shape.
 *
 * @param {object | Array<object> | null | undefined} value
 * @returns {object | null}
 */
function firstRelation(value) {
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
}

/**
 * Converts a timestamp-like value into comparable milliseconds. Missing or
 * invalid timestamps sort to the bottom.
 *
 * @param {string | null | undefined} value
 * @returns {number}
 */
function timestampMs(value) {
  if (!value) return 0;
  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? 0 : parsed;
}

/**
 * Sorts rows newest-first by the first timestamp field that exists.
 *
 * @param {object} left
 * @param {object} right
 * @param {Array<string>} fields
 * @returns {number}
 */
function newestFirst(left, right, fields) {
  const leftTime = fields.reduce((time, field) => time || timestampMs(left[field]), 0);
  const rightTime = fields.reduce((time, field) => time || timestampMs(right[field]), 0);
  return rightTime - leftTime;
}

/**
 * Formats a compact timestamp label for inbox cards.
 *
 * @param {string | null | undefined} value
 * @returns {string}
 */
function formatInboxDate(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

/**
 * Decorates and sorts the raw rows returned by exchange-related service calls.
 *
 * @param {object} params
 * @param {Array<object>} [params.incomingSwapProposals]
 * @param {Array<object>} [params.outgoingSwapProposals]
 * @param {Array<object>} [params.handoffs]
 * @returns {{activeProposals: Array<object>, pendingHandoffs: Array<object>, completedExchanges: Array<object>}}
 */
function buildExchangeInbox({
  incomingSwapProposals = [],
  outgoingSwapProposals = [],
  handoffs = [],
} = {}) {
  const activeProposals = [
    ...incomingSwapProposals.map((proposal) => ({ ...proposal, direction: 'INCOMING' })),
    ...outgoingSwapProposals.map((proposal) => ({ ...proposal, direction: 'OUTGOING' })),
  ].sort((left, right) => newestFirst(left, right, ['responded_at', 'created_at']));

  const pendingHandoffs = handoffs
    .filter((handoff) => !isTerminalHandoffStatus(handoff.status))
    .sort((left, right) => newestFirst(left, right, ['updated_at', 'created_at']));

  const completedExchanges = handoffs
    .filter((handoff) => handoff.status === HANDOFF_STATUSES.COMPLETED)
    .sort((left, right) => newestFirst(left, right, ['completed_at', 'updated_at', 'created_at']));

  return {
    activeProposals,
    pendingHandoffs,
    completedExchanges,
  };
}

/**
 * Checks whether the current signed-in user still needs to confirm a handoff.
 *
 * @param {object} handoff
 * @param {string} userId
 * @returns {boolean}
 */
function isHandoffWaitingOnUser(handoff, userId) {
  return (handoff.owner_user_id === userId && !handoff.owner_confirmed_at)
    || (handoff.recipient_user_id === userId && !handoff.recipient_confirmed_at);
}

/**
 * Finds the current user's review, if one exists, for a completed handoff.
 *
 * @param {object} handoff
 * @param {string} userId
 * @returns {object | null}
 */
function getMyHandoffReview(handoff, userId) {
  return (handoff.listing_handoff_reviews ?? [])
    .find((review) => review.reviewer_user_id === userId) ?? null;
}

/**
 * Builds top-level counts for the exchange inbox summary strip.
 *
 * @param {object} inbox
 * @param {string} userId
 * @returns {{activeProposals: number, pendingHandoffs: number, completedExchanges: number, actionNeeded: number, total: number}}
 */
function getExchangeInboxCounts(inbox, userId) {
  const activeProposals = inbox.activeProposals?.length ?? 0;
  const pendingHandoffs = inbox.pendingHandoffs?.length ?? 0;
  const completedExchanges = inbox.completedExchanges?.length ?? 0;

  const incomingPending = (inbox.activeProposals ?? [])
    .filter((proposal) => proposal.direction === 'INCOMING' && proposal.status === SWAP_PROPOSAL_STATUSES.PENDING).length;
  const handoffsWaitingOnUser = (inbox.pendingHandoffs ?? [])
    .filter((handoff) => isHandoffWaitingOnUser(handoff, userId)).length;
  const completedWithoutReview = (inbox.completedExchanges ?? [])
    .filter((handoff) => !getMyHandoffReview(handoff, userId)).length;

  return {
    activeProposals,
    pendingHandoffs,
    completedExchanges,
    actionNeeded: incomingPending + handoffsWaitingOnUser + completedWithoutReview,
    total: activeProposals + pendingHandoffs + completedExchanges,
  };
}

/**
 * Returns the related listing row from a proposal, normalizing Supabase's
 * possible array relationship shape.
 *
 * @param {object} proposal
 * @returns {object | null}
 */
function getProposalListing(proposal) {
  return firstRelation(proposal.listing);
}

/**
 * Produces a concise participant label for exchange cards.
 *
 * @param {object} item
 * @param {string} fallback
 * @returns {string}
 */
function participantLabel(item, fallback = 'PlantBuddy user') {
  return item?.display_name || item?.username || item?.first_name || fallback;
}

module.exports = {
  buildExchangeInbox,
  firstRelation,
  formatInboxDate,
  getExchangeInboxCounts,
  getMyHandoffReview,
  getProposalListing,
  isHandoffWaitingOnUser,
  newestFirst,
  participantLabel,
  timestampMs,
};
